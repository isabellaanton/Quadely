import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import initialBoard from './data/initial-board.json'
import logo from './assets/quadely-logo.png'
import type { BoardData, CalendarEvent, Column, Label, Task } from './types'
import CalendarView from './CalendarView'
import Dashboard from './Dashboard'

const STORAGE_KEY = 'meu-quadro-pessoal:v1'
const labelPalette = ['#F8E8F3', '#EAF1F8', '#FBF8E0', '#E9EAF5', '#F4EAF2', '#EEF3F8', '#F7F0E2', '#FFFFFF']
const eventColors = ['#EAF1F8', '#F8E8F3', '#FBF8E0', '#E7ECFA', '#F4EAF2', '#EFF2F8', '#F8F1E6']
const backgroundOptions = [
  { name: 'Creme', color: '#F6F0E4', chart: '#091A58' },
  { name: 'Rosa', color: '#E593D1', chart: '#74275D' },
  { name: 'Azul', color: '#89A9D2', chart: '#234A7C' },
  { name: 'Amarelo', color: '#E5DA5F', chart: '#4D4510' },
  { name: 'Lavanda', color: '#B7A5D6', chart: '#514071' },
  { name: 'Coral', color: '#EAA08D', chart: '#713B2E' },
  { name: 'Menta', color: '#9CCBB5', chart: '#285743' },
  { name: 'Ardósia', color: '#91A8C0', chart: '#2D4764' },
]
type Page = 'overview' | 'board' | 'calendar' | 'done'

function loadBoard(): BoardData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialBoard as BoardData
    const parsed = JSON.parse(saved) as Partial<BoardData>
    const base = initialBoard as BoardData
    const oldBackgrounds: Record<string, string> = { '#F9EDF6': '#E593D1', '#EDF3FA': '#89A9D2', '#FCFAE4': '#E5DA5F', '#F1EFF8': '#B7A5D6', '#F0F3F6': '#91A8C0', '#F8E8F1': '#E593D1', '#FFFFFF': '#F6F0E4' }
    const savedColor = parsed.board?.backgroundColor ?? base.board.backgroundColor
    const savedBoard = { ...base.board, ...parsed.board, backgroundColor: oldBackgrounds[savedColor] || savedColor }
    return { ...base, ...parsed, board: savedBoard, events: parsed.events ?? base.events }
  } catch { return initialBoard as BoardData }
}
function uid() { return crypto.randomUUID() }
function dateLabel(value: string) { if (!value) return 'Sem prazo'; return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') }
function todayKey() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function colorFromHex(hex: string) {
  const value = hex.replace('#', '')
  const r = Number.parseInt(value.slice(0, 2), 16) / 255
  const g = Number.parseInt(value.slice(2, 4), 16) / 255
  const b = Number.parseInt(value.slice(4, 6), 16) / 255
  const linear = (channel: number) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
  let hue = 220
  if (delta) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6)
    else if (max === g) hue = 60 * ((b - r) / delta + 2)
    else hue = 60 * ((r - g) / delta + 4)
  }
  if (hue < 0) hue += 360
  return { ink: luminance < 0.2 ? '#F6F0E4' : '#091A58', chart: `hsl(${Math.round(hue)} 58% 29%)` }
}

export default function App() {
  const [data, setData] = useState<BoardData>(loadBoard)
  const [page, setPage] = useState<Page>('overview')
  const [backgroundMenuOpen, setBackgroundMenuOpen] = useState(false)
  const [backgroundHex, setBackgroundHex] = useState(() => loadBoard().board.backgroundColor || '#F6F0E4')
  const [filter, setFilter] = useState('')
  const [taskEditor, setTaskEditor] = useState<Task | null | undefined>(undefined)
  const [eventEditor, setEventEditor] = useState<CalendarEvent | null | undefined>(undefined)
  const [labelEditor, setLabelEditor] = useState(false)
  const [labelDraft, setLabelDraft] = useState<Label | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }, [data])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2200); return () => window.clearTimeout(timer) }, [toast])
  const visibleTasks = useMemo(() => data.tasks.filter(task => (!filter || task.labelIds.includes(filter)) && (page !== 'done' || task.columnId === 'done')), [data.tasks, filter, page])

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    const task: Task = { id: taskEditor?.id || uid(), title: String(form.get('title')).trim(), details: String(form.get('details')).trim(), dueDate: String(form.get('dueDate')), columnId: String(form.get('columnId')), labelIds: form.getAll('labels').map(String) }
    if (!task.title) return
    setData(current => ({ ...current, tasks: taskEditor ? current.tasks.map(item => item.id === task.id ? task : item) : [task, ...current.tasks] }))
    setTaskEditor(undefined); setToast(taskEditor ? 'Tarefa atualizada' : 'Tarefa adicionada')
  }
  function deleteTask() {
    if (!taskEditor) return
    setData(current => ({ ...current, tasks: current.tasks.filter(task => task.id !== taskEditor.id) })); setTaskEditor(undefined); setToast('Tarefa excluída')
  }
  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    const startTime = String(form.get('startTime')); const endTime = String(form.get('endTime'))
    if (endTime <= startTime) { setToast('O horário final precisa ser depois do horário inicial'); return }
    const item: CalendarEvent = { id: eventEditor?.id || uid(), title: String(form.get('title')).trim(), details: String(form.get('details')).trim(), date: String(form.get('date')), startTime, endTime, category: String(form.get('category')), color: String(form.get('color')) }
    if (!item.title) return
    setData(current => ({ ...current, events: eventEditor ? current.events.map(existing => existing.id === item.id ? item : existing) : [...current.events, item] }))
    setEventEditor(undefined); setToast(eventEditor ? 'Horário atualizado' : 'Horário adicionado à agenda')
  }
  function deleteEvent() {
    if (!eventEditor) return
    setData(current => ({ ...current, events: current.events.filter(item => item.id !== eventEditor.id) })); setEventEditor(undefined); setToast('Horário removido')
  }
  function saveLabel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get('labelName')).trim()
    if (!name) return
    const label: Label = { id: labelDraft?.id || uid(), name, color: String(form.get('labelColor')) }
    setData(current => ({ ...current, labels: labelDraft ? current.labels.map(item => item.id === label.id ? label : item) : [...current.labels, label] }))
    setLabelEditor(false); setLabelDraft(null); setToast(labelDraft ? 'Etiqueta atualizada' : 'Etiqueta criada')
  }
  function deleteLabel(label: Label) {
    setData(current => ({ ...current, labels: current.labels.filter(item => item.id !== label.id), tasks: current.tasks.map(task => ({ ...task, labelIds: task.labelIds.filter(id => id !== label.id) })) }))
    setLabelEditor(false); setLabelDraft(null); setToast('Etiqueta removida')
  }
  function moveTask(taskId: string, columnId: string) { setData(current => ({ ...current, tasks: current.tasks.map(task => task.id === taskId ? { ...task, columnId } : task) })) }
  function addEvent(date = todayKey()) { setEventEditor({ id: '', title: '', details: '', date, startTime: '09:00', endTime: '10:00', color: eventColors[0], category: 'Pessoal' }) }
  const completedCount = data.tasks.filter(task => task.columnId === 'done').length
  const navItems: { id: Page; icon: string; name: string }[] = [{ id: 'overview', icon: '⌂', name: 'Visão geral' }, { id: 'board', icon: '▦', name: 'Meu quadro' }, { id: 'calendar', icon: '▦', name: 'Agenda' }, { id: 'done', icon: '✓', name: 'Concluídas' }]

  const activeBackground = backgroundOptions.find(option => option.color.toUpperCase() === data.board.backgroundColor.toUpperCase())
  const customTheme = colorFromHex(data.board.backgroundColor)
  const themeColor = activeBackground?.color || data.board.backgroundColor
  const chartColor = activeBackground?.chart || customTheme.chart
  const canvasInk = customTheme.ink
  function applyBackground(color: string) {
    if (!/^#[\da-f]{6}$/i.test(color)) return
    setBackgroundHex(color.toUpperCase())
    setData(current => ({ ...current, board: { ...current.board, backgroundColor: color.toUpperCase() } }))
  }
  return <div className="app redesigned-app" style={{ '--accent': 'var(--brand-navy)', '--canvas-color': themeColor, '--chart-color': chartColor, '--canvas-ink': canvasInk } as CSSProperties}>
    <aside className="sidebar">
      <button className="brand logo-brand" aria-label="Quadely — visão geral" onClick={() => setPage('overview')}><img src={logo} alt="Quadely" /></button>
      <div className="section-label">SEU ESPAÇO</div>
      <nav className="primary-nav">{navItems.map(item => <button key={item.id} className={`nav ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setFilter('') }}><span className="nav-icon">{item.icon}</span>{item.name}{item.id === 'done' && <span className="nav-count">{completedCount}</span>}</button>)}</nav>
      <div className="sidebar-labels"><div className="section-label label-heading">ETIQUETAS <button title="Criar etiqueta" onClick={() => { setLabelDraft(null); setLabelEditor(true) }}>＋</button></div>{data.labels.map(label => <button className={`sidebar-label ${filter === label.id ? 'chosen' : ''}`} key={label.id} onClick={() => { setFilter(filter === label.id ? '' : label.id); setPage('board') }}><i style={{ background: label.color }} />{label.name}</button>)}</div>
      <section className="sidebar-success"><span>SEU PROGRESSO</span><div><strong>{data.tasks.length ? Math.round(completedCount / data.tasks.length * 100) : 0}%</strong><small>das tarefas concluídas</small></div><i><b style={{ width: `${data.tasks.length ? completedCount / data.tasks.length * 100 : 0}%` }} /></i></section>
    </aside>

    <main className="main redesigned-main">
      <div className="topbar"><div className="crumb">Quadely&nbsp; / &nbsp;<strong>{page === 'overview' ? 'Visão geral' : page === 'calendar' ? 'Agenda' : page === 'done' ? 'Concluídas' : data.board.title}</strong></div><div className="top-actions theme-control"><button className="theme-trigger" aria-expanded={backgroundMenuOpen} onClick={() => { setBackgroundHex(data.board.backgroundColor); setBackgroundMenuOpen(open => !open) }}><i style={{ background: themeColor }} />Fundo <span>⌄</span></button>{backgroundMenuOpen && <div className="theme-popover"><strong>Cor de fundo</strong><span>Escolha um tom ou informe o hexadecimal</span><div className="theme-swatches">{backgroundOptions.map(option => <button key={option.color} title={option.name} aria-label={`Fundo ${option.name}`} aria-pressed={themeColor.toUpperCase() === option.color} className={themeColor.toUpperCase() === option.color ? 'selected' : ''} style={{ background: option.color }} onClick={() => { applyBackground(option.color); setBackgroundMenuOpen(false) }}>{themeColor.toUpperCase() === option.color && <b>✓</b>}</button>)}</div><div className="theme-custom-color"><label htmlFor="background-color-picker">Personalizar cor</label><div><input id="background-color-picker" aria-label="Selecionar cor do fundo" type="color" value={/^#[\da-f]{6}$/i.test(backgroundHex) ? backgroundHex : '#F6F0E4'} onChange={event => applyBackground(event.currentTarget.value)} /><input aria-label="Hexadecimal da cor de fundo" type="text" inputMode="text" maxLength={7} value={backgroundHex} placeholder="#091A58" onChange={event => { const value = event.currentTarget.value; setBackgroundHex(value); if (/^#[\da-f]{6}$/i.test(value)) applyBackground(value) }} /></div>{!/^#[\da-f]{6}$/i.test(backgroundHex) && <small>Use o formato #RRGGBB.</small>}</div></div>}</div></div>

      {page === 'overview' && <Dashboard tasks={data.tasks} columns={data.columns} labels={data.labels} events={data.events || []} onAgenda={() => setPage('calendar')} onBoard={() => setPage('board')} />}

      {page === 'calendar' && <CalendarView events={data.events || []} onNew={addEvent} onEdit={setEventEditor} />}

      {(page === 'board' || page === 'done') && <>
        <header className="board-head redesigned-board-head"><div><div className="eyebrow">{page === 'done' ? 'SEU HISTÓRICO DE CONQUISTAS' : 'QUADRO PESSOAL'}</div><h1>{page === 'done' ? 'Tarefas concluídas' : data.board.title}</h1><div className="subtitle">{page === 'done' ? 'Tudo o que você já tirou do papel.' : data.board.subtitle}</div></div>{page === 'board' && <div className="head-actions"><button className="button" onClick={() => { setLabelDraft(null); setLabelEditor(true) }}>＋ &nbsp; Etiqueta</button><button className="button primary" onClick={() => setTaskEditor(null)}>＋ &nbsp; Nova tarefa</button></div>}</header>
        {page === 'board' && <div className="filters redesigned-filters"><button className={`filter ${!filter ? 'selected' : ''}`} onClick={() => setFilter('')}>Todas</button>{data.labels.map(label => <button key={label.id} className={`filter ${filter === label.id ? 'selected' : ''}`} onClick={() => setFilter(filter === label.id ? '' : label.id)}><i style={{ background: label.color }} />{label.name}</button>)}<button className="filter manage-filter" onClick={() => { setLabelDraft(null); setLabelEditor(true) }}>＋ Criar etiqueta</button></div>}
        <section className={`board ${page === 'done' ? 'completed-board' : ''}`}>{data.columns.filter(column => page !== 'done' || column.id === 'done').map(column => <BoardColumn key={column.id} column={column} tasks={visibleTasks.filter(task => task.columnId === column.id)} labels={data.labels} columns={data.columns} onAdd={() => setTaskEditor({ id: '', title: '', details: '', dueDate: '', columnId: column.id, labelIds: [] })} onEdit={setTaskEditor} onMove={moveTask} onMoveAll={(fromId, toId) => setData(current => ({ ...current, tasks: current.tasks.map(task => task.columnId === fromId ? { ...task, columnId: toId } : task) }))} />)}</section>
      </>}
    </main>

    {taskEditor !== undefined && <div className="backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setTaskEditor(undefined) }}><form className="modal" onSubmit={saveTask}><h2>{taskEditor?.id ? 'Editar tarefa' : 'Nova tarefa'}</h2><div className="form-row"><label>Título</label><input name="title" required maxLength={90} defaultValue={taskEditor?.title} placeholder="Ex.: Marcar consulta no dentista" autoFocus /></div><div className="form-row"><label>Detalhes</label><textarea name="details" maxLength={240} defaultValue={taskEditor?.details} placeholder="Anote algum detalhe importante" /></div><div className="form-grid"><div className="form-row"><label>Prazo</label><input name="dueDate" type="date" defaultValue={taskEditor?.dueDate} /></div><div className="form-row"><label>Etapa</label><select name="columnId" defaultValue={taskEditor?.columnId || data.columns[0]?.id}>{data.columns.map(column => <option key={column.id} value={column.id}>{column.title}</option>)}</select></div></div><div className="form-row"><label>Etiquetas</label><div className="label-picker">{data.labels.length ? data.labels.map(label => <label className="check-label" key={label.id}><input type="checkbox" name="labels" value={label.id} defaultChecked={taskEditor?.labelIds.includes(label.id)} /><span style={{ background: label.color }}>{label.name}</span></label>) : <button type="button" className="text-button" onClick={() => { setTaskEditor(undefined); setLabelDraft(null); setLabelEditor(true) }}>Criar sua primeira etiqueta</button>}</div></div><div className="modal-actions">{taskEditor?.id && <button type="button" className="delete-button" onClick={deleteTask}>Excluir</button>}<button type="button" className="button" onClick={() => setTaskEditor(undefined)}>Cancelar</button><button className="button primary">Salvar tarefa</button></div></form></div>}

    {eventEditor !== undefined && <div className="backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setEventEditor(undefined) }}><form className="modal appointment-modal" onSubmit={saveEvent}><div className="modal-eyebrow">AGENDA PESSOAL</div><h2>{eventEditor?.id ? 'Editar horário' : 'Novo horário'}</h2><div className="form-row"><label>O que você vai fazer?</label><input name="title" required maxLength={90} defaultValue={eventEditor?.title} placeholder="Ex.: Aula de pilates" autoFocus /></div><div className="form-row"><label>Detalhes <span className="optional">(opcional)</span></label><textarea name="details" maxLength={180} defaultValue={eventEditor?.details} placeholder="Local, preparo ou lembretes" /></div><div className="form-row"><label>Data</label><input name="date" type="date" required defaultValue={eventEditor?.date || todayKey()} /></div><div className="form-grid"><div className="form-row"><label>Começa</label><input name="startTime" type="time" required defaultValue={eventEditor?.startTime || '09:00'} /></div><div className="form-row"><label>Termina</label><input name="endTime" type="time" required defaultValue={eventEditor?.endTime || '10:00'} /></div></div><div className="form-grid"><div className="form-row"><label>Categoria</label><select name="category" defaultValue={eventEditor?.category || 'Pessoal'}>{['Pessoal', 'Trabalho', 'Estudos', 'Saúde', 'Casa', 'Outro'].map(category => <option key={category}>{category}</option>)}</select></div><div className="form-row"><label>Cor do compromisso</label><div className="event-color-picker">{eventColors.map(color => <label key={color} className={`event-swatch ${eventEditor?.color === color ? 'selected' : ''}`} style={{ background: color }}><input type="radio" name="color" value={color} defaultChecked={eventEditor ? eventEditor.color === color : color === eventColors[0]} /></label>)}</div></div></div><div className="modal-actions">{eventEditor?.id && <button type="button" className="delete-button" onClick={deleteEvent}>Excluir horário</button>}<button type="button" className="button" onClick={() => setEventEditor(undefined)}>Cancelar</button><button className="button primary">{eventEditor?.id ? 'Salvar alterações' : 'Adicionar à agenda'}</button></div></form></div>}

    {labelEditor && <div className="backdrop" onMouseDown={event => { if (event.target === event.currentTarget) { setLabelEditor(false); setLabelDraft(null) } }}><form key={labelDraft?.id || 'new-label'} className="modal small-modal" onSubmit={saveLabel}><div className="modal-title-row"><h2>{labelDraft ? 'Editar etiqueta' : 'Nova etiqueta'}</h2><button type="button" className="modal-close" aria-label="Fechar janela" onClick={() => { setLabelEditor(false); setLabelDraft(null) }}>×</button></div><div className="form-row"><label>Nome</label><input name="labelName" required maxLength={28} defaultValue={labelDraft?.name} placeholder="Ex.: Estudos" autoFocus /></div><div className="form-row"><label>Cor</label><input type="hidden" name="labelColor" defaultValue={labelDraft?.color || labelPalette[0]} /><div className="color-options">{labelPalette.map(color => <label key={color} className={`swatch ${labelDraft?.color === color ? 'chosen' : ''}`} style={{ background: color }}><input type="radio" name="labelPreset" value={color} defaultChecked={labelDraft ? labelDraft.color === color : color === labelPalette[0]} onChange={event => { const hidden = event.currentTarget.form?.elements.namedItem('labelColor') as HTMLInputElement | null; if (hidden) hidden.value = color }} /></label>)}<label className="custom-color"><input aria-label="Escolher outra cor" type="color" defaultValue={labelDraft?.color || '#39715d'} onChange={event => { const hidden = event.currentTarget.form?.elements.namedItem('labelColor') as HTMLInputElement | null; if (hidden) hidden.value = event.currentTarget.value }} /></label></div></div>{data.labels.length > 0 && !labelDraft && <div className="existing-labels"><span>Suas etiquetas</span>{data.labels.map(label => <div key={label.id} className="existing-label"><i style={{ background: label.color }} />{label.name}<button type="button" onClick={() => setLabelDraft(label)}>Editar</button><button type="button" className="label-delete" onClick={() => deleteLabel(label)}>×</button></div>)}</div>}<div className="modal-actions"><button className="button primary">{labelDraft ? 'Salvar alterações' : 'Criar etiqueta'}</button></div></form></div>}
    {toast && <div className="toast">{toast}</div>}
  </div>
}

function BoardColumn({ column, tasks, labels, columns, onAdd, onEdit, onMove, onMoveAll }: { column: Column; tasks: Task[]; labels: Label[]; columns: Column[]; onAdd: () => void; onEdit: (task: Task) => void; onMove: (taskId: string, columnId: string) => void; onMoveAll: (fromId: string, toId: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="column" onDragOver={event => event.preventDefault()} onDrop={event => { const taskId = event.dataTransfer.getData('text/plain'); if (taskId) onMove(taskId, column.id) }}><div className="column-head"><div className="column-title"><i className="column-dot" style={{ background: column.color }} />{column.title}<span className="count">{tasks.length}</span></div><div className="column-menu-wrap"><button className="more" aria-label="Mais opções" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>···</button>{menuOpen && <div className="column-menu"><strong>Mover todos os cartões para</strong>{columns.filter(target => target.id !== column.id).map(target => <button key={target.id} onClick={() => { onMoveAll(column.id, target.id); setMenuOpen(false) }}>{target.title}</button>)}{!tasks.length && <span>A lista está vazia.</span>}</div>}</div></div><div className="cards">{tasks.map(task => { const due = task.dueDate ? new Date(`${task.dueDate}T12:00:00`) : null; const late = due && due < new Date(new Date().toDateString()) && column.id !== 'done'; return <article className="card" key={task.id} draggable onDragStart={event => event.dataTransfer.setData('text/plain', task.id)} onClick={() => onEdit(task)}><div className="task-labels">{task.labelIds.map(id => labels.find(label => label.id === id)).filter((label): label is Label => Boolean(label)).map(label => <span className="tag" key={label.id} style={{ background: label.color }}>{label.name}</span>)}</div><h3>{task.title}</h3>{task.details && <p className="card-note">{task.details}</p>}<div className="card-foot"><span className={`due ${late ? 'late' : ''}`}>{dateLabel(task.dueDate)}{late ? ' · atrasada' : ''}</span></div></article>})}{!tasks.length && <div className="empty-hint">Nada por aqui ainda</div>}</div><button className="add-card" onClick={onAdd}>＋ &nbsp; Adicionar cartão</button></div>
}
