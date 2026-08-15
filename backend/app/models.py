from datetime import date as Date
from typing import Optional

from sqlmodel import Field, SQLModel

TIPOS = ("receita", "despesa", "investimento", "divida")


class TransactionBase(SQLModel):
    data: Date
    tipo: str  # receita | despesa | investimento | divida
    grupo: str
    categoria: str
    valor: float
    nota: str = ""


class Transaction(TransactionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class TransactionCreate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: int
