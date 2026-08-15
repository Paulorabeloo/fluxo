import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'
import Dashboard from './components/Dashboard'
import Extrato from './components/Extrato'
import TxForm from './components/TxForm'
import { monthName, shiftMonth, todayMonth } from './format'
import type { Catalogo, Summary, Transaction } from './types'

type Modal = { open: false } | { open: true; tx: Transaction | null }

export default function App() {
  const [month, setMonth] = useState(todayMonth())
  const [tab, setTab] = useState<'resumo' | 'extrato'>('resumo')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [txs, setTxs] = useState<Transaction[]>([])
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [modal, setModal] = useState<Modal>({ open: false })
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const jumped = useRef(false)
  const toastTimer = useRef<number>()

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  const reload = useCallback(async (m: string) => {
    try {
      const [s, t] = await Promise.all([api.summary(m), api.transactions(m)])
      setError(null)
      setSummary(s)
      setTxs(t)
      // primeira carga: se o mês atual está vazio, pula para o último mês com dados
      if (!jumped.current) {
        jumped.current = true
        if (s.receitas === 0 && s.gastos === 0) {
          const withData = s.meses.filter((x) => x.receitas > 0 || x.gastos > 0)
          if (withData.length) {
            const last = withData[withData.length - 1].mes
            if (last !== m) {
              setMonth(last)
              return
            }
          }
        }
      }
    } catch (e) {
      setError('Não consegui falar com a API. O backend está rodando em http://localhost:8000?')
    }
  }, [])

  useEffect(() => {
    reload(month)
  }, [month, reload])

  useEffect(() => {
    api.catalogo().then(setCatalogo).catch(() => undefined)
  }, [])

  const { nome, ano } = monthName(month)

  return (
    <div className="wrap">
      <header className="app">
        <div className="logo">
          <span className="mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 15l5-6 4 4 7-8" />
              <path d="M15 5h5v5" />
            </svg>
          </span>
          <span>
            <h1 className="display">Fluxo</h1>
            <span className="sub">suas finanças em dia</span>
          </span>
        </div>
      </header>

      <div className="toolbar">
        <button className="nav-arrow" aria-label="Mês anterior" onClick={() => setMonth(shiftMonth(month, -1))}>
          ‹
        </button>
        <div className="month display">
          {nome}
          <small>{ano}</small>
        </div>
        <button className="nav-arrow" aria-label="Próximo mês" onClick={() => setMonth(shiftMonth(month, 1))}>
          ›
        </button>
      </div>

      {error && <div className="error-banner" style={{ gridColumn: '1 / -1' }} role="alert">{error}</div>}

      <section className="view" style={{ display: tab === 'resumo' ? undefined : 'none' }}>
        {summary && <Dashboard summary={summary} />}
      </section>

      <section className="view" style={{ display: tab === 'extrato' ? undefined : 'none' }}>
        <Extrato txs={txs} onEdit={(tx) => setModal({ open: true, tx })} />
      </section>

      <nav className="tabs" aria-label="Navegação principal">
        <button className={tab === 'resumo' ? 'on' : ''} onClick={() => setTab('resumo')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="3" y="12" width="4" height="9" rx="1" />
            <rect x="10" y="7" width="4" height="14" rx="1" />
            <rect x="17" y="3" width="4" height="18" rx="1" />
          </svg>
          Resumo
        </button>
        <button className="fab-pill" aria-label="Novo lançamento" onClick={() => setModal({ open: true, tx: null })}>
          +
        </button>
        <button className={tab === 'extrato' ? 'on' : ''} onClick={() => setTab('extrato')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M8 6h13M8 12h13M8 18h13" />
            <circle cx="3.5" cy="6" r="1" />
            <circle cx="3.5" cy="12" r="1" />
            <circle cx="3.5" cy="18" r="1" />
          </svg>
          Extrato
        </button>
      </nav>
      <button className="fab-desk" aria-label="Novo lançamento" onClick={() => setModal({ open: true, tx: null })}>
        +
      </button>

      {modal.open && catalogo && (
        <TxForm
          catalogo={catalogo}
          tx={modal.tx}
          defaultDate={month === todayMonth() ? new Date().toISOString().slice(0, 10) : `${month}-15`}
          onClose={() => setModal({ open: false })}
          onSaved={(msg, newMonth) => {
            setModal({ open: false })
            showToast(msg)
            if (newMonth && newMonth !== month) setMonth(newMonth)
            else reload(month)
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
