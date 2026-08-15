import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fmt, fmtK, GROUP_COLOR, monthShort, shiftMonth } from '../format'
import { buildInsights } from '../insights'
import type { Summary } from '../types'

const TONE_COLOR = { bad: '#FF6B81', warn: '#FFB454', good: '#2EE6A8' } as const

function Delta({ atual, anterior, invert }: { atual: number; anterior: number | null; invert?: boolean }) {
  if (anterior === null || anterior === 0) return null
  const pct = ((atual - anterior) / anterior) * 100
  if (!isFinite(pct) || Math.abs(pct) < 0.5) return null
  const up = pct > 0
  const good = invert ? !up : up
  return (
    <span
      className="num"
      style={{ fontSize: '0.7rem', fontWeight: 700, color: good ? 'var(--pos)' : 'var(--neg)', marginLeft: 8 }}
      title="variação vs mês anterior"
    >
      {up ? '▲' : '▼'} {Math.abs(pct).toFixed(0)}%
    </span>
  )
}

export default function Dashboard({ summary: s }: { summary: Summary }) {
  const prev = s.meses.find((m) => m.mes === shiftMonth(s.mes, -1)) ?? null
  const pct = s.pct_gasto ?? (s.gastos > 0 ? 100 : 0)
  const donutData = s.por_grupo.map((g) => ({ name: g.grupo, value: g.valor }))
  const mesesData = s.meses.slice(-6).map((m) => ({ ...m, label: monthShort(m.mes) }))
  const insights = buildInsights(s)
  const topMax = s.top_categorias[0]?.valor ?? 1
  const vazio = s.receitas === 0 && s.gastos === 0

  return (
    <>
      <div className="card hero">
        <div className="lbl">saldo do mês</div>
        <div className={`big num display${s.saldo < 0 ? ' neg' : ''}`}>{fmt(s.saldo)}</div>
        <div className="note">
          {vazio
            ? 'nenhum lançamento neste mês'
            : s.saldo >= 0
              ? `sobrou depois de todos os gastos${s.investimentos > 0 ? ' e investimentos' : ''}`
              : 'gastos acima da receita'}
        </div>
      </div>

      <div className="duo">
        <div className="card mini">
          <div className="lbl">
            <i style={{ background: 'var(--pos)' }} />
            Receitas
          </div>
          <div className="val pos num">
            {fmt(s.receitas)}
            <Delta atual={s.receitas} anterior={prev?.receitas ?? null} />
          </div>
        </div>
        <div className="card mini">
          <div className="lbl">
            <i style={{ background: 'var(--neg)' }} />
            Gastos
          </div>
          <div className="val neg num">
            {fmt(s.gastos)}
            <Delta atual={s.gastos} anterior={prev?.gastos ?? null} invert />
          </div>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="card">
          <h2>Insights do mês</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--ink2)' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: TONE_COLOR[ins.tone],
                    marginTop: 6,
                    flex: 'none',
                  }}
                />
                <span>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Comprometimento da renda</h2>
        <div className="meter">
          <i className={pct >= 90 ? 'hot' : ''} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="meter-cap num">
          <span>{pct.toFixed(0)}% da receita gasta</span>
          <span>{s.receitas > 0 ? `${fmt(Math.max(s.receitas - s.gastos, 0))} livre` : ''}</span>
        </div>
      </div>

      <div className="card">
        <h2>Para onde foi o dinheiro</h2>
        {donutData.length === 0 ? (
          <div className="empty">sem gastos neste mês</div>
        ) : (
          <div className="donut-flex">
            <div className="donut-side">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="68%"
                    outerRadius="100%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {donutData.map((d) => (
                      <Cell key={d.name} fill={GROUP_COLOR[d.name] ?? '#7AA2FF'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => fmt(v)}
                    contentStyle={{
                      background: '#10151b',
                      border: '1px solid rgba(255,255,255,.16)',
                      borderRadius: 12,
                      color: '#F2F5F7',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <div>
                  <b className="num display">{fmtK(s.gastos + s.investimentos)}</b>
                  <span>gastos</span>
                </div>
              </div>
            </div>
            <div className="dlegend">
              {s.por_grupo.map((g) => {
                const p = Math.round((g.valor / (s.gastos + s.investimentos)) * 100)
                return (
                  <div className="row" key={g.grupo}>
                    <i style={{ background: GROUP_COLOR[g.grupo] ?? '#7AA2FF' }} />
                    <span className="n">{g.grupo}</span>
                    <span className="p num">{p}%</span>
                    <span className="v num">{fmt(g.valor)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Maiores gastos do mês</h2>
        {s.top_categorias.length === 0 ? (
          <div className="empty">sem gastos neste mês</div>
        ) : (
          s.top_categorias.slice(0, 5).map((c) => (
            <div className="grow" key={`${c.categoria}-${c.grupo}`}>
              <div className="top">
                <span>
                  <span className="name">{c.categoria}</span>
                  <span className="pct">{c.grupo}</span>
                </span>
                <span className="amt num">{fmt(c.valor)}</span>
              </div>
              <div className="bar">
                <i
                  style={{
                    width: `${(c.valor / topMax) * 100}%`,
                    background: GROUP_COLOR[c.grupo] ?? '#7AA2FF',
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2>Receitas × gastos por mês</h2>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mesesData} barGap={4}>
              <XAxis
                dataKey="label"
                tick={{ fill: '#5E6B78', fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => fmt(v)}
                labelFormatter={(l) => `mês: ${l}`}
                cursor={{ fill: 'rgba(255,255,255,.04)' }}
                contentStyle={{
                  background: '#10151b',
                  border: '1px solid rgba(255,255,255,.16)',
                  borderRadius: 12,
                  color: '#F2F5F7',
                }}
              />
              <Bar dataKey="receitas" name="Receitas" fill="#2EE6A8" radius={[5, 5, 2, 2]} maxBarSize={18} />
              <Bar dataKey="gastos" name="Gastos" fill="#FF6B81" radius={[5, 5, 2, 2]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="legend">
          <span>
            <b className="lr" />
            Receitas
          </span>
          <span>
            <b className="ld" />
            Gastos
          </span>
        </div>
      </div>
    </>
  )
}
