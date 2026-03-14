import { createClient } from '@supabase/supabase-js'
import type { Todo } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Setup presence channel for cursor tracking and online users
export function setupPresenceChannel(userId: string) {
  return supabase.channel('presence:board', {
    config: {
      presence: {
        key: userId,
      },
      broadcast: {
        self: true,
      },
    },
  })
}

// Subscribe to todos changes via Supabase Realtime
export function subscribeToTodos(
  callback: (payload: { eventType: string; new?: Todo; old?: Todo }) => void
) {
  return supabase
    .channel('todos')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'todos',
      },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new as Todo | undefined,
          old: payload.old as Todo | undefined,
        })
      }
    )
    .subscribe()
}

// API-based CRUD operations (using Prisma via Next.js API routes)

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.statusText}`)
  }

  return response.json()
}

export async function createTodo(todo: Omit<Todo, 'id' | 'created_at'>) {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  })

  if (!response.ok) {
    throw new Error(`Failed to create todo: ${response.statusText}`)
  }

  return response.json() as Promise<Todo>
}

export async function updateTodo(
  id: string,
  updates: Partial<Omit<Todo, 'id' | 'created_at'>>
) {
  const response = await fetch(`/api/todos?id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error(`Failed to update todo: ${response.statusText}`)
  }

  return response.json() as Promise<Todo>
}

export async function deleteTodo(id: string) {
  const response = await fetch(`/api/todos?id=${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete todo: ${response.statusText}`)
  }
}
