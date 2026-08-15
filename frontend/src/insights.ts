import { fmt } from './format'
import type { Summary } from './types'

export interface Insight {
  tone: 'bad' | 'warn' | 'good'
  text: string
}

/** Regras simples de saúde financeira aplicadas ao mês visível. */
export function buildInsights(s: Summary): Insight[] {
  const out: Insight[] = []
  if (s.receitas === 0 && s.gastos === 0) return out

  const pct = s.pct_gasto ?? 100
  if (pct >= 100) {
    out.push({ tone: 'bad', text: `Você gastou ${pct.toFixed(0)}% da receita — o mês fechou no vermelho ou no zero a zero.` })
  } else if (pct >= 90) {
    out.push({ tone: 'warn', text: `${pct.toFixed(0)}% da receita já foi gasta. Margem de segurança muito apertada.` })
  } else if (pct <= 70) {
    out.push({ tone: 'good', text: `Você gastou só ${pct.toFixed(0)}% da receita. Ótimo controle este mês.` })
  }

  const dividas = s.por_grupo.find((g) => g.grupo === 'Dívidas')
  if (dividas && s.receitas > 0) {
    const p = (dividas.valor / s.receitas) * 100
    if (p >= 20) {
      out.push({ tone: 'warn', text: `Dívidas consumiram ${p.toFixed(0)}% da receita (${fmt(dividas.valor)}). Priorize quitar antes de gastos extras.` })
    }
  }

  const adicionais = s.por_grupo.find((g) => g.grupo === 'Adicionais')
  if (adicionais && s.gastos > 0 && adicionais.valor / s.gastos >= 0.4) {
    out.push({ tone: 'warn', text: `Gastos “Adicionais” (não obrigatórios) são ${((adicionais.valor / s.gastos) * 100).toFixed(0)}% de tudo que saiu. É a alavanca mais fácil de cortar.` })
  }

  if (s.saldo > 0 && s.investimentos === 0) {
    const sugestao = Math.min(s.saldo, s.receitas * 0.1)
    if (sugestao >= 20) {
      out.push({ tone: 'good', text: `Sobraram ${fmt(s.saldo)}. Que tal guardar ${fmt(sugestao)} (10% da receita) antes que o mês vire?` })
    }
  }

  return out.slice(0, 3)
}
