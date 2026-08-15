import { fmt, ICONS, MESES } from '../format'
import type { Transaction } from '../types'

export default function Extrato({
  txs,
  onEdit,
}: {
  txs: Transaction[]
  onEdit: (tx: Transaction) => void
}) {
  if (txs.length === 0) {
    return (
      <div className="card">
        <div className="empty">
          Nenhum lançamento neste mês.
          <br />
          Toque em + para adicionar.
        </div>
      </div>
    )
  }

  const sorted = [...txs].sort((a, b) => b.data.localeCompare(a.data) || a.categoria.localeCompare(b.categoria))
  const rows: JSX.Element[] = []
  let lastDay = ''

  for (const t of sorted) {
    const day = `${t.data.slice(8, 10)} de ${MESES[Number(t.data.slice(5, 7)) - 1]}`
    if (day !== lastDay) {
      rows.push(
        <div className="txday" key={`d-${day}`}>
          {day}
        </div>,
      )
      lastDay = day
    }
    const cls = t.tipo === 'receita' ? 'pos' : t.tipo === 'investimento' ? 'inv' : 'neg'
    const sign = t.tipo === 'receita' ? '+' : '−'
    rows.push(
      <button className="tx" key={t.id} onClick={() => onEdit(t)}>
        <span className="ic" aria-hidden="true">
          {ICONS[t.grupo] ?? '•'}
        </span>
        <span className="mid">
          <span className="c">{t.categoria}</span>
          <span className="s">
            {t.grupo}
            {t.nota && t.nota !== 'dados de exemplo' ? ` · ${t.nota}` : ''}
          </span>
        </span>
        <span className={`v num ${cls}`}>
          {sign} {fmt(t.valor)}
        </span>
      </button>,
    )
  }

  return (
    <>
      <div className="card" style={{ padding: '15px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Extrato do mês</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }} className="num">
            {txs.length} lançamento{txs.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>
      <div>{rows}</div>
    </>
  )
}
