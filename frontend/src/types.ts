export type Tipo = 'receita' | 'despesa' | 'investimento' | 'divida'

export interface Transaction {
  id: number
  data: string // YYYY-MM-DD
  tipo: Tipo
  grupo: string
  categoria: string
  valor: number
  nota: string
}

export type TransactionInput = Omit<Transaction, 'id'>

export interface GrupoResumo {
  grupo: string
  valor: number
  pct_receita: number | null
}

export interface CategoriaResumo {
  categoria: string
  grupo: string
  valor: number
}

export interface MesResumo {
  mes: string // YYYY-MM
  receitas: number
  gastos: number
  saldo: number
}

export interface Summary {
  mes: string
  receitas: number
  gastos: number
  investimentos: number
  saldo: number
  pct_gasto: number | null
  por_grupo: GrupoResumo[]
  top_categorias: CategoriaResumo[]
  meses: MesResumo[]
}

export type Catalogo = Record<Tipo, Record<string, string[]>>
