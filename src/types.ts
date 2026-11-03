export type Column = { id: string; title: string; color: string }

export type Label = { id: string; name: string; color: string }

export type Task = {
  id: string
  title: string
  details: string
  dueDate: string
  columnId: string
  labelIds: string[]
}

export type CalendarEvent = {
  id: string
  title: string
  details: string
  date: string
  startTime: string
  endTime: string
  color: string
  category: string
}

export type BoardData = {
  board: { title: string; subtitle: string; backgroundColor: string }
  columns: Column[]
  labels: Label[]
  tasks: Task[]
  events: CalendarEvent[]
}
