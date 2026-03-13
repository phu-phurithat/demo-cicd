import { createClient } from '@supabase/supabase-js'
import type { Todo, PresenceState } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Subscribe to todos table changes (INSERT, UPDATE, DELETE)
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

// Setup presence channel for cursor tracking and online users
export function setupPresenceChannel(userId: string) {
  return supabase.channel(`presence:${userId}`, {
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

// Fetch all todos
export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('order', { ascending: true })

  if (error) throw error
  return data || []
}

// Create a new todo
export async function createTodo(todo: Omit<Todo, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('todos')
    .insert([todo])
    .select()
    .single()

  if (error) throw error
  return data as Todo
}

// Update a todo
export async function updateTodo(
  id: string,
  updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
) {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Todo
}

// Delete a todo
export async function deleteTodo(id: string) {
  const { error } = await supabase.from('todos').delete().eq('id', id)

  if (error) throw error
}
