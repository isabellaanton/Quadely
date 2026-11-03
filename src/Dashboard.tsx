import type { CalendarEvent, Column, Label, Task } from './types'

function localKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function plusDays(date: Date, days: number) { const next = new Date(date); next.setDate(next.getDate() + days); return next }

export default function Dashboard({ tasks, columns, labels, events, onAgenda, onBoard }: { tasks: Task[]; columns: Column[]; labels: Label[]; events: CalendarEvent[]; onAgenda: () => void; onBoard: () => void }) {
  const completed = tasks.filter(task => columns.find(column => column.id === task.columnId)?.id === 'done').length
  const active = tasks.length - completed
  const rate = tasks.length ? Math.round(completed / tasks.length * 100) : 0
  const todayKey = localKey(new Date())
  const todayEvents = events.filter(event => event.date === todayKey).sort((a, b) => a.startTime.localeCompare(b.startTime))
  const week = Array.from({ length: 7 }, (_, index) => plusDays(new Date(), index))
  const weekEvents = week.map(day => events.filter(event => event.date === localKey(day)).length)
  const maxEvents = Math.max(1, ...weekEvents)
  const labelCounts = labels.map(label => ({ ...label, count: tasks.filter(task => task.labelIds.includes(label.id)).length })).filter(label => label.count)
  const totalLabels = labelCounts.reduce((sum, label) => sum + label.count, 0)
  let currentStop = 0
  const donutStops = labelCounts.length ? labelCounts.map(label => {
    const start = currentStop
    currentStop += label.count / totalLabels * 100
    return `${label.color} ${start}% ${currentStop}%`
  }).join(', ') : 'var(--chart-color) 0% 100%'
  const nextEvent = events.filter(event => `${event.date}T${event.startTime}` >= `${todayKey}T${new Date().toTimeString().slice(0, 5)}`).sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0]

  return <div className="dashboard-page">
    <header className="dashboard-header"><div><p className="eyebrow">VISÃO GERAL DO SEU ESPAÇO</p><h1>Olá! Como está seu ritmo?</h1><p className="subtitle">Pequenos passos também são progresso. Aqui está seu resumo.</p></div><button className="button primary" onClick={onAgenda}>＋ Planejar meu tempo</button></header>
    <section className="profile-stats">
      <article className="profile-stat"><span className="stat-icon green" aria-hidden="true" /><div><small>Tarefas concluídas</small><strong>{completed}</strong><span>de {tasks.length} tarefas no quadro</span></div><button onClick={onBoard}>Ver quadro →</button></article>
      <article className="profile-stat"><span className="stat-icon violet" aria-hidden="true" /><div><small>Seu progresso</small><strong>{rate}%</strong><span>taxa de conclusão geral</span></div><div className="tiny-progress"><i style={{ width: `${rate}%` }} /></div></article>
      <article className="profile-stat"><span className="stat-icon orange" aria-hidden="true" /><div><small>Horários marcados</small><strong>{events.length}</strong><span>{todayEvents.length} compromisso{todayEvents.length === 1 ? '' : 's'} hoje</span></div><button onClick={onAgenda}>Abrir agenda →</button></article>
      <article className="profile-stat"><span className="stat-icon blue" aria-hidden="true" /><div><small>Em andamento</small><strong>{active}</strong><span>tarefas em aberto</span></div><button onClick={onBoard}>Continuar →</button></article>
    </section>

    <section className="dashboard-grid">
      <article className="success-card">
        <div className="success-card-head"><div><span className="dark-kicker">SEU PROGRESSO</span><h2>O sucesso está no caminho</h2><p>Acompanhe como suas tarefas estão distribuídas.</p></div></div>
        <div className="success-content"><div className="donut" style={{ background: `conic-gradient(${donutStops})` }}><div><strong>{rate}%</strong><span>concluído</span></div></div><div className="legend-list">{labelCounts.length ? labelCounts.map(label => <div className="legend-row" key={label.id}><i style={{ background: label.color }} /><span>{label.name}</span><small>{Math.round(label.count / totalLabels * 100)}%</small><b>{label.count} tarefa{label.count === 1 ? '' : 's'}</b></div>) : <div className="legend-empty">Adicione etiquetas para acompanhar suas áreas.</div>}<div className="legend-row status-row"><i className="status-dot" /><span>Em aberto</span><small>{tasks.length ? Math.round(active / tasks.length * 100) : 0}%</small><b>{active} tarefa{active === 1 ? '' : 's'}</b></div></div></div>
        <div className="success-insight"><span><b>Seu progresso conta.</b> {completed ? `Você já concluiu ${completed} tarefa${completed === 1 ? '' : 's'} — continue no seu ritmo.` : 'Escolha uma tarefa pequena para começar a avançar hoje.'}</span><button onClick={onBoard}>Ver detalhes&nbsp; ›</button></div>
      </article>

      <article className="week-card panel"><div className="card-heading"><div><span className="eyebrow">PRÓXIMOS 7 DIAS</span><h2>Seu tempo planejado</h2></div><button className="subtle-button" onClick={onAgenda}>Agenda ↗</button></div><div className="week-bars">{week.map((day, index) => <div className="bar-day" key={localKey(day)}><span className="bar-count">{weekEvents[index] || ''}</span><div className="bar-track"><i style={{ height: `${Math.max(5, weekEvents[index] / maxEvents * 100)}%` }} /></div><small>{day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</small><b>{day.getDate()}</b></div>)}</div><div className="week-footer"><i />{events.filter(event => week.some(day => localKey(day) === event.date)).length} compromissos planejados nesta semana</div></article>

      <article className="today-card panel"><div className="card-heading"><div><span className="eyebrow">HOJE</span><h2>Seu dia</h2></div><button className="subtle-button" onClick={onAgenda}>Ver agenda →</button></div>{todayEvents.length ? <div className="today-event-list">{todayEvents.slice(0, 3).map(event => <div className="today-event" key={event.id}><span className="event-time">{event.startTime}</span><i style={{ background: event.color }} /><div><b>{event.title}</b><small>{event.endTime} · {event.category}</small></div></div>)}</div> : <div className="empty-today"><p>Seu dia está livre por enquanto.</p><button onClick={onAgenda}>Adicionar um horário</button></div>}</article>

      <article className="moment-card"><div><span className="dark-kicker">UM BOM PRÓXIMO PASSO</span><h2>{nextEvent ? nextEvent.title : 'Escolha o que merece seu tempo'}</h2><p>{nextEvent ? `Na agenda ${new Date(`${nextEvent.date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}, às ${nextEvent.startTime}.` : 'Organize tarefas e horários em um só lugar.'}</p></div><button onClick={onAgenda}>{nextEvent ? 'Abrir agenda' : 'Planejar horário'} &nbsp; ›</button></article>
    </section>
  </div>
}
