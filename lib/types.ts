export type Priority = 'high' | 'medium' | 'low'
export type Status = 'todo' | 'in-progress' | 'done'

export interface Todo {
  id: string
  title: string
  description?: string
  priority: Priority
  status: Status
  assigneeId: string
  dueDate?: string
  tags: string[]
  createdAt: string
  order: number
}

export interface User {
  id: string
  name: string
  color: string
  initials: string
}

export interface PresenceState {
  cursor: { x: number; y: number } | null
  userId: string
  name: string
  color: string
}
