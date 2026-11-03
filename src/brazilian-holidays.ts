export type CalendarMarker = { name: string; kind: 'feriado' | 'data' }

function easterSunday(year: number) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day, 12)
}

function key(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function offset(date: Date, days: number) { const value = new Date(date); value.setDate(value.getDate() + days); return value }
function nthSunday(year: number, month: number, n: number) {
  const first = new Date(year, month, 1, 12)
  return new Date(year, month, 1 + ((7 - first.getDay()) % 7) + (n - 1) * 7, 12)
}

export function brazilianCalendarMarkers(year: number) {
  const markers: Record<string, CalendarMarker> = {}
  const add = (date: Date, name: string, kind: CalendarMarker['kind'] = 'feriado') => { markers[key(date)] = { name, kind } }
  ;[
    ['01-01', 'Confraternização Universal'], ['04-21', 'Tiradentes'], ['05-01', 'Dia do Trabalho'],
    ['09-07', 'Independência do Brasil'], ['10-12', 'Nossa Senhora Aparecida · Dia das Crianças'],
    ['11-02', 'Finados'], ['11-15', 'Proclamação da República'], ['11-20', 'Consciência Negra'], ['12-25', 'Natal'],
  ].forEach(([date, name]) => add(new Date(`${year}-${date}T12:00:00`), name))

  const easter = easterSunday(year)
  add(offset(easter, -48), 'Carnaval', 'data')
  add(offset(easter, -47), 'Carnaval', 'data')
  add(offset(easter, -2), 'Sexta-feira Santa')
  add(easter, 'Páscoa', 'data')
  add(offset(easter, 60), 'Corpus Christi', 'data')
  add(nthSunday(year, 4, 2), 'Dia das Mães', 'data')
  add(nthSunday(year, 7, 2), 'Dia dos Pais', 'data')
  return markers
}
