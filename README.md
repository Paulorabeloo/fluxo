<img width="360" height="787" alt="image" src="https://github.com/user-attachments/assets/e85c91d8-a3a4-4f99-bb10-9556fe09ddef" />

# 💸 Fluxo

**EN** · Personal finance manager with a **Python (FastAPI)** REST API and a **TypeScript (React)** front end. Monthly dashboard, automatic financial-health insights, charts and a full-CRUD statement. [Português abaixo](#-português). 🇧🇷

**▶ Live demo (PWA):** https://paulorabeloo.github.io/fluxo/ — a standalone single-file build ([`docs/`](docs/)) that runs entirely in the browser with `localStorage`, installable on mobile. No backend required; data never leaves your device.

## Features

- **Monthly dashboard** — balance, income × expenses with month-over-month deltas, income commitment meter, spending donut by group and top expenses
- **Automatic insights** — rule-based financial health checks: share of income spent, debt weight and savings suggestions
- **Statement** — entries grouped by day, with inline edit and delete
- **Typed REST API** — aggregations computed server-side in pure Python over SQLite

## Stack

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| API       | FastAPI + SQLModel (Pydantic v2) + SQLite   |
| Front end | React 18 + Vite + TypeScript + Recharts     |
| UI        | Plain CSS with design tokens (dark fintech) |

## API

```
GET    /api/summary?month=YYYY-MM   # month aggregations: balance, by group, top categories, monthly series
GET    /api/transactions?month=...  # entries (optional month filter)
POST   /api/transactions            # create
PUT    /api/transactions/{id}       # update
DELETE /api/transactions/{id}       # delete
GET    /api/categorias              # group/category taxonomy
```

## Running

API (port 8000):

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # Linux/mac: .venv/bin/pip
.venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

Front end (port 5173, proxied to the API):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The SQLite database (`backend/tostao.db`) is created empty on first start — no environment variables required.

## Project layout

```
backend/app/
├── main.py      # routes, validation and aggregations (summary)
├── models.py    # SQLModel: table + input/output schemas
├── db.py        # SQLite engine + session
└── catalog.py   # group/category taxonomy
frontend/src/
├── App.tsx                  # month navigation, tabs, modals
├── api.ts / types.ts        # typed HTTP client
├── insights.ts              # financial-health rules
└── components/              # Dashboard, Statement, entry form
```

---

## 🇧🇷 Português

Gestor de finanças pessoais com API REST em **Python (FastAPI)** e front-end em **TypeScript (React)**. Dashboard mensal, insights automáticos de saúde financeira, gráficos e extrato com CRUD completo.

**▶ Demo ao vivo (PWA):** https://paulorabeloo.github.io/fluxo/ — versão standalone em arquivo único ([`docs/`](docs/)) que roda 100% no navegador com `localStorage`, instalável no celular. Sem backend; os dados não saem do seu aparelho.

### Funcionalidades

- **Dashboard mensal** — saldo, receitas × gastos com variação vs mês anterior, comprometimento da renda, donut por grupo e maiores gastos
- **Insights automáticos** — regras de saúde financeira: percentual da renda gasto, peso das dívidas e sugestão de poupança
- **Extrato** — lançamentos agrupados por dia, com edição e exclusão
- **API REST tipada** — agregações calculadas no servidor, em Python puro sobre SQLite

### Rodando

Suba a API (porta 8000) e o front (porta 5173) com os comandos da seção *Running* acima. O banco SQLite nasce **vazio** no primeiro start e não há variável de ambiente para configurar. Para resetar, apague `backend/tostao.db`.
