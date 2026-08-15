import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import type { Catalogo, Tipo, Transaction } from '../types'

const TIPOS: { t: Tipo; label: string }[] = [
  { t: 'despesa', label: 'Despesa' },
  { t: 'receita', label: 'Receita' },
  { t: 'investimento', label: 'Invest.' },
  { t: 'divida', label: 'Dívida' },
]

const OUTRA = '__outra'

export default function TxForm({
  catalogo,
  tx,
  defaultDate,
  onClose,
  onSaved,
}: {
  catalogo: Catalogo
  tx: Transaction | null
  defaultDate: string
  onClose: () => void
  onSaved: (msg: string, month?: string) => void
}) {
  const [tipo, setTipo] = useState<Tipo>(tx?.tipo ?? 'despesa')
  const grupos = useMemo(() => Object.keys(catalogo[tipo] ?? {}), [catalogo, tipo])
  const [grupo, setGrupo] = useState(tx?.grupo ?? grupos[0])
  const cats = catalogo[tipo]?.[grupo] ?? []
  const knownCat = tx ? cats.includes(tx.categoria) : true
  const [cat, setCat] = useState(tx ? (knownCat ? tx.categoria : OUTRA) : cats[0] ?? OUTRA)
  const [catCustom, setCatCustom] = useState(tx && !knownCat ? tx.categoria : '')
  const [valor, setValor] = useState(tx ? String(tx.valor.toFixed(2)).replace('.', ',') : '')
  const [data, setData] = useState(tx?.data ?? defaultDate)
  const [nota, setNota] = useState(tx && tx.nota !== 'dados de exemplo' ? tx.nota : '')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // ao trocar tipo/grupo, realinha grupo e categoria válidos
  useEffect(() => {
    if (!grupos.includes(grupo)) setGrupo(grupos[0])
  }, [grupos, grupo])
  useEffect(() => {
    const list = catalogo[tipo]?.[grupo] ?? []
    if (cat !== OUTRA && !list.includes(cat)) setCat(list[0] ?? OUTRA)
  }, [tipo, grupo, catalogo, cat])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = parseFloat(valor.trim().replace(/\./g, '').replace(',', '.'))
    if (!(v > 0)) {
      setErr('Informe um valor válido.')
      return
    }
    const categoria = cat === OUTRA ? catCustom.trim() : cat
    if (!categoria) {
      setErr('Informe a categoria.')
      return
    }
    setErr(null)
    setBusy(true)
    const payload = { data, tipo, grupo, categoria, valor: v, nota: nota.trim() }
    try {
      if (tx) await api.update(tx.id, payload)
      else await api.create(payload)
      onSaved(tx ? 'Lançamento atualizado' : 'Lançamento salvo', data.slice(0, 7))
    } catch {
      setErr('Erro ao salvar. O backend está rodando?')
      setBusy(false)
    }
  }

  async function remove() {
    if (!tx) return
    setBusy(true)
    try {
      await api.remove(tx.id)
      onSaved('Lançamento excluído')
    } catch {
      setErr('Erro ao excluir.')
      setBusy(false)
    }
  }

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form className="sheet" onSubmit={submit} aria-label={tx ? 'Editar lançamento' : 'Novo lançamento'}>
        <h3 className="display">{tx ? 'Editar lançamento' : 'Novo lançamento'}</h3>

        <div className="seg" role="radiogroup" aria-label="Tipo de lançamento">
          {TIPOS.map(({ t, label }) => (
            <button
              type="button"
              key={t}
              className={tipo === t ? 'on' : ''}
              role="radio"
              aria-checked={tipo === t}
              onClick={() => setTipo(t)}
            >
              {label}
            </button>
          ))}
        </div>

        {grupos.length > 1 && (
          <>
            <label htmlFor="f-grupo">Grupo</label>
            <select id="f-grupo" value={grupo} onChange={(e) => setGrupo(e.target.value)}>
              {grupos.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="f-cat">Categoria</label>
        <select id="f-cat" value={cat} onChange={(e) => setCat(e.target.value)}>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
          <option value={OUTRA}>Outra…</option>
        </select>
        {cat === OUTRA && (
          <input
            aria-label="Nome da categoria"
            placeholder="Nome da categoria"
            style={{ marginTop: 8 }}
            value={catCustom}
            onChange={(e) => setCatCustom(e.target.value)}
          />
        )}

        <label htmlFor="f-valor">Valor (R$)</label>
        <input
          id="f-valor"
          inputMode="decimal"
          placeholder="0,00"
          required
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <label htmlFor="f-data">Data</label>
        <input id="f-data" type="date" required value={data} onChange={(e) => setData(e.target.value)} />

        <label htmlFor="f-nota">
          Observação <span style={{ textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
        </label>
        <input id="f-nota" placeholder="ex.: mercado da semana" value={nota} onChange={(e) => setNota(e.target.value)} />

        {err && (
          <div className="error-banner" style={{ marginTop: 14, marginBottom: 0 }} role="alert">
            {err}
          </div>
        )}

        <div className="actions">
          {tx && (
            <button type="button" className="btn danger" onClick={remove} disabled={busy}>
              Excluir
            </button>
          )}
          <button type="button" className="btn" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" className="btn primary" disabled={busy}>
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}
