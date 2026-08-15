from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .catalog import CATALOGO
from .db import get_session, init_db
from .models import TIPOS, Transaction, TransactionCreate, TransactionRead

GROUP_ORDER = ["Fixas", "Variáveis", "Extras", "Adicionais", "Dívidas", "Investimentos"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Tostão API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _validate(tx: TransactionCreate) -> None:
    if tx.tipo not in TIPOS:
        raise HTTPException(422, f"tipo deve ser um de {TIPOS}")
    if tx.valor <= 0:
        raise HTTPException(422, "valor deve ser maior que zero")


def _month_bounds(month: str) -> tuple[date, date]:
    try:
        year, mon = map(int, month.split("-"))
        start = date(year, mon, 1)
    except ValueError:
        raise HTTPException(422, "month deve estar no formato YYYY-MM")
    end = date(year + 1, 1, 1) if mon == 12 else date(year, mon + 1, 1)
    return start, end


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/categorias")
def categorias():
    return CATALOGO


@app.get("/api/transactions", response_model=list[TransactionRead])
def list_transactions(
    month: str | None = Query(default=None, description="YYYY-MM"),
    session: Session = Depends(get_session),
):
    stmt = select(Transaction)
    if month:
        start, end = _month_bounds(month)
        stmt = stmt.where(Transaction.data >= start, Transaction.data < end)
    stmt = stmt.order_by(Transaction.data.desc(), Transaction.id.desc())
    return session.exec(stmt).all()


@app.post("/api/transactions", response_model=TransactionRead, status_code=201)
def create_transaction(tx: TransactionCreate, session: Session = Depends(get_session)):
    _validate(tx)
    row = Transaction.model_validate(tx)
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@app.put("/api/transactions/{tx_id}", response_model=TransactionRead)
def update_transaction(tx_id: int, tx: TransactionCreate, session: Session = Depends(get_session)):
    _validate(tx)
    row = session.get(Transaction, tx_id)
    if not row:
        raise HTTPException(404, "lançamento não encontrado")
    for field, value in tx.model_dump().items():
        setattr(row, field, value)
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@app.delete("/api/transactions/{tx_id}", status_code=204)
def delete_transaction(tx_id: int, session: Session = Depends(get_session)):
    row = session.get(Transaction, tx_id)
    if not row:
        raise HTTPException(404, "lançamento não encontrado")
    session.delete(row)
    session.commit()


@app.get("/api/summary")
def summary(month: str = Query(description="YYYY-MM"), session: Session = Depends(get_session)):
    start, end = _month_bounds(month)
    txs = session.exec(
        select(Transaction).where(Transaction.data >= start, Transaction.data < end)
    ).all()

    receitas = sum(t.valor for t in txs if t.tipo == "receita")
    gastos = sum(t.valor for t in txs if t.tipo in ("despesa", "divida"))
    investimentos = sum(t.valor for t in txs if t.tipo == "investimento")
    saldo = receitas - gastos - investimentos

    por_grupo: dict[str, float] = defaultdict(float)
    por_categoria: dict[tuple[str, str], float] = defaultdict(float)
    for t in txs:
        if t.tipo == "receita":
            continue
        por_grupo[t.grupo] += t.valor
        por_categoria[(t.categoria, t.grupo)] += t.valor

    grupos = [
        {
            "grupo": g,
            "valor": round(por_grupo[g], 2),
            "pct_receita": round(por_grupo[g] / receitas * 100, 1) if receitas else None,
        }
        for g in GROUP_ORDER
        if por_grupo.get(g)
    ]
    top_categorias = [
        {"categoria": c, "grupo": g, "valor": round(v, 2)}
        for (c, g), v in sorted(por_categoria.items(), key=lambda kv: -kv[1])[:8]
    ]

    # série mensal: todos os meses com lançamentos + o mês pedido
    all_txs = session.exec(select(Transaction)).all()
    by_month: dict[str, dict[str, float]] = defaultdict(lambda: {"receitas": 0.0, "gastos": 0.0})
    for t in all_txs:
        key = t.data.strftime("%Y-%m")
        if t.tipo == "receita":
            by_month[key]["receitas"] += t.valor
        else:
            by_month[key]["gastos"] += t.valor
    by_month.setdefault(month, {"receitas": 0.0, "gastos": 0.0})
    meses = [
        {
            "mes": key,
            "receitas": round(vals["receitas"], 2),
            "gastos": round(vals["gastos"], 2),
            "saldo": round(vals["receitas"] - vals["gastos"], 2),
        }
        for key, vals in sorted(by_month.items())
    ][-12:]

    return {
        "mes": month,
        "receitas": round(receitas, 2),
        "gastos": round(gastos, 2),
        "investimentos": round(investimentos, 2),
        "saldo": round(saldo, 2),
        "pct_gasto": round(gastos / receitas * 100, 1) if receitas else None,
        "por_grupo": grupos,
        "top_categorias": top_categorias,
        "meses": meses,
    }
