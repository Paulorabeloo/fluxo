import type { Catalogo, Summary, Transaction, TransactionInput } from './types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${body || res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  summary: (month: string) => request<Summary>(`/api/summary?month=${month}`),
  transactions: (month: string) => request<Transaction[]>(`/api/transactions?month=${month}`),
  catalogo: () => request<Catalogo>('/api/categorias'),
  create: (tx: TransactionInput) =>
    request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(tx) }),
  update: (id: number, tx: TransactionInput) =>
    request<Transaction>(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(tx) }),
  remove: (id: number) => request<void>(`/api/transactions/${id}`, { method: 'DELETE' }),
}
