import { useMemo, useState, type CSSProperties } from 'react'
import type { CalendarEvent } from './types'
import { brazilianCalendarMarkers } from './brazilian-holidays'

type ViewMode = 'dia' | 'semana' | 'mês'
const HOUR_START = 7
const HOUR_END = 21
const ROW_HEIGHT = 58

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function fromKey(key: string) { return new Date(`${key}T12:00:00`) }
function plusDays(date: Date, amount: number) { const next = new Date(date); next.setDate(next.getDate() + amount); return next }
function monday(date: Date) { const day = date.getDay(); return plusDays(date, day === 0 ? -6 : 1 - day) }
function formatRange(start: Date, end: Date) {
  const a = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')
  const b = end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')
  return `${a} – ${b}`
}
function monthTitle(date: Date) { return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }
function timeMinutes(value: string) { const [h, m] = value.split(':').map(Number); return h * 60 + m }

export default function CalendarView({ events, onNew, onEdit }: { events: CalendarEvent[]; onNew: (date: string) => void; onEdit: (event: CalendarEvent) => void }) {
  const [view, setView] = useState<ViewMode>('semana')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const weekStart = monday(selectedDate)
  const weekDays = Array.from({ length: 7 }, (_, index) => plusDays(weekStart, index))
  const visibleDays = view === 'dia' ? [selectedDate] : weekDays
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 12)
  const calendarStart = monday(monthStart)
  const monthDays = Array.from({ length: 42 }, (_, index) => plusDays(calendarStart, index))
  const markerYears = [selectedDate.getFullYear() - 1, selectedDate.getFullYear(), selectedDate.getFullYear() + 1]
  const calendarMarkers = useMemo(() => Object.assign({}, ...markerYears.map(brazilianCalendarMarkers)), [selectedDate.getFullYear()])
  const monthEvents = useMemo(() => events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
    groups[event.date] ||= []
    groups[event.date].push(event)
    return groups
  }, {}), [events])
  const rangeStart = view === 'dia' ? selectedDate : weekStart
  const rangeEnd = view === 'dia' ? selectedDate : plusDays(weekStart, 6)

  function movePeriod(direction: number) {
    if (view === 'mês') setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1, 12))
    else setSelectedDate(plusDays(selectedDate, direction * (view === 'dia' ? 1 : 7)))
  }
  function moveMonth(direction: number) {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1, 12))
  }

  return <div className="calendar-page">
    <header className="calendar-toolbar">
      <div><p className="eyebrow">SEU TEMPO, NO SEU RITMO</p><h1>Agenda</h1><p className="subtitle">Uma visão clara dos seus compromissos e horários.</p></div>
      <div className="calendar-controls">
        <div className="view-switch">{(['dia', 'semana', 'mês'] as ViewMode[]).map(option => <button key={option} className={view === option ? 'active' : ''} onClick={() => setView(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}</div>
        <div className="date-navigation"><button aria-label="Período anterior" onClick={() => movePeriod(-1)}>‹</button><button className="today-button" onClick={() => setSelectedDate(new Date())}>Hoje</button><button aria-label="Próximo período" onClick={() => movePeriod(1)}>›</button><strong>{view === 'mês' ? monthTitle(selectedDate) : formatRange(rangeStart, rangeEnd)}</strong></div>
        <button className="button primary" onClick={() => onNew(dateKey(selectedDate))}>＋ Novo horário</button>
      </div>
    </header>

    <div className="calendar-layout">
      <aside className="calendar-aside">
        <section className="mini-month panel"><div className="mini-month-head"><strong>{monthTitle(selectedDate)}</strong><div><button aria-label="Mês anterior" onClick={() => moveMonth(-1)}>‹</button><button aria-label="Próximo mês" onClick={() => moveMonth(1)}>›</button></div></div><div className="mini-grid mini-weekdays">{'seg ter qua qui sex sáb dom'.split(' ').map(day => <span key={day}>{day}</span>)}</div><div className="mini-grid">{monthDays.map(day => { const key = dateKey(day); const marker = calendarMarkers[key]; return <button key={key} title={marker?.name} aria-label={`${day.getDate()}${marker ? `, ${marker.name}` : ''}`} className={`${day.getMonth() !== selectedDate.getMonth() ? 'outside' : ''} ${key === dateKey(selectedDate) ? 'selected' : ''} ${key === dateKey(new Date()) ? 'today' : ''} ${monthEvents[key]?.length ? 'has-event' : ''} ${marker ? 'has-holiday' : ''}`} onClick={() => setSelectedDate(day)}>{day.getDate()}</button> })}</div><div className="holiday-key"><i />Feriados e datas comemorativas do Brasil</div></section>
        <section className="agenda-today panel"><div className="aside-title"><span>Resumo de hoje</span><span className="today-badge">{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}</span></div><div className="today-stats"><div><strong>{monthEvents[dateKey(new Date())]?.length || 0}</strong><span>na agenda</span></div><div><strong>{weekDays.reduce((sum, day) => sum + (monthEvents[dateKey(day)]?.length || 0), 0)}</strong><span>nesta semana</span></div></div><button className="aside-link" onClick={() => { setSelectedDate(new Date()); setView('dia') }}>Ver meu dia <span>→</span></button></section>
        <section className="upcoming-panel panel"><div className="aside-title">Próximos horários</div>{events.filter(event => event.date >= dateKey(new Date())).sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)).slice(0, 3).map(event => <button className="upcoming-item" key={event.id} onClick={() => onEdit(event)}><i style={{ background: event.color }} /><span><b>{event.title}</b><small>{fromKey(event.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} · {event.startTime}</small></span></button>)}</section>
      </aside>

      <section className="calendar-surface panel">
        {view === 'mês' ? <div className="month-view"><div className="month-view-head">{'seg ter qua qui sex sáb dom'.split(' ').map(day => <span key={day}>{day}</span>)}</div><div className="month-view-grid">{monthDays.map(day => { const key = dateKey(day); const marker = calendarMarkers[key]; return <button key={key} title={marker?.name} className={`month-cell ${day.getMonth() !== selectedDate.getMonth() ? 'outside' : ''} ${key === dateKey(new Date()) ? 'is-today' : ''} ${marker ? 'has-holiday' : ''}`} onClick={() => { setSelectedDate(day); setView('dia') }}><b>{day.getDate()}</b>{marker && <span className="holiday-event">{marker.name}</span>}{(monthEvents[key] || []).slice(0, 3).map(event => <span className="month-event" key={event.id} style={{ background: event.color }}>{event.startTime} {event.title}</span>)}</button> })}</div></div> : <div className="week-scroll"><div className="time-grid" style={{ '--days': visibleDays.length } as CSSProperties}>
          <div className="grid-corner">GMT−03</div>{visibleDays.map(day => { const key = dateKey(day); const marker = calendarMarkers[key]; return <div className={`day-heading ${key === dateKey(new Date()) ? 'current' : ''} ${marker ? 'holiday-heading' : ''}`} key={key}><span>{day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><b>{day.getDate()}</b>{marker && <small title={marker.name}>{marker.name}</small>}</div> })}
          <div className="time-axis">{Array.from({ length: HOUR_END - HOUR_START }, (_, i) => <span key={i}>{String(HOUR_START + i).padStart(2, '0')}:00</span>)}</div>
          {visibleDays.map(day => { const key = dateKey(day); const dayEvents = monthEvents[key] || []; return <div className={`day-lane ${key === dateKey(new Date()) ? 'current-lane' : ''}`} key={key} onDoubleClick={() => onNew(key)}><div className="hour-lines">{Array.from({ length: HOUR_END - HOUR_START }, (_, i) => <div key={i} />)}</div>{dayEvents.map(event => { const start = timeMinutes(event.startTime); const end = timeMinutes(event.endTime); const top = ((start - HOUR_START * 60) / 60) * ROW_HEIGHT; const height = Math.max(36, ((end - start) / 60) * ROW_HEIGHT - 3); return <button key={event.id} className="calendar-event" style={{ top: `${Math.max(2, top)}px`, height: `${height}px`, background: event.color }} onClick={() => onEdit(event)} title={`${event.title} · ${event.startTime}–${event.endTime}`}><b>{event.startTime} – {event.endTime}</b><span>{event.title}</span>{height > 55 && event.details && <small>{event.details}</small>}</button> })}</div> })}
        </div></div>}
      </section>
    </div>
  </div>
}
