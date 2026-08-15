const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const fmt = (v: number) => brl.format(v)
export const fmtK = (v: number) =>
  v >= 1000 ? `R$ ${(v / 1000).toFixed(1).replace('.', ',')}k` : brl.format(v)

export const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
export const MESES_AB = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function monthName(ym: string): { nome: string; ano: string } {
  const [ano, m] = ym.split('-')
  return { nome: MESES[Number(m) - 1], ano }
}

export function monthShort(ym: string): string {
  return MESES_AB[Number(ym.split('-')[1]) - 1]
}

export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function todayMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export const GROUP_COLOR: Record<string, string> = {
  Fixas: '#00C2FF',
  Variáveis: '#2EE6A8',
  Extras: '#A78BFA',
  Adicionais: '#FFB454',
  Dívidas: '#FF6B81',
  Investimentos: '#7AA2FF',
}

export const ICONS: Record<string, string> = {
  Receitas: '💵', Fixas: '🏠', Variáveis: '🛒', Extras: '🩺',
  Adicionais: '🎉', Dívidas: '💳', Investimentos: '📈',
}
