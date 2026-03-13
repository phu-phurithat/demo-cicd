'use client'

import { useEffect, useState } from 'react'
import { useTodoStore } from '@/lib/store'
import { subscribeToTodos, fetchTodos, createTodo, updateTodo, deleteTodo } from '@/lib/supabase'
import type { Todo } from '@/lib/types'

export function useTodos() {
  const { todos, setTodos, addTodo, updateTodo: updateStored, deleteTodo: deleteStored } =
    useTodoStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize and subscribe to todos
  useEffect(() => {
    let channel: ReturnType<typeof subscribeToTodos> | undefined

    const init = async () => {
      try {
        setIsLoading(true)
        // Fetch initial todos
        const initialTodos = await fetchTodos()
        setTodos(initialTodos)

        // Subscribe to realtime changes
        channel = subscribeToTodos(({ eventType, new: newData, old: oldData }) => {
          if (eventType === 'INSERT' && newData) {
            addTodo(newData)
          } else if (eventType === 'UPDATE' && newData) {
            updateStored(newData.id, newData)
          } else if (eventType === 'DELETE' && oldData) {
            deleteStored(oldData.id)
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load todos')
      } finally {
        setIsLoading(false)
      }
    }

    init()

    return () => {
      channel?.unsubscribe()
    }
  }, [setTodos, addTodo, updateStored, deleteStored])

  return {
    todos,
    isLoading,
    error,
    addTodo: async (title: string, description?: string) => {
      const newTodo: Omit<Todo, 'id' | 'createdAt'> = {
        title,
        description,
        priority: 'medium',
        status: 'todo',
        assigneeId: 'user-1',
        tags: [],
        order: todos.length,
      }
      return createTodo(newTodo)
    },
    updateTodo: updateTodo,
    deleteTodo: deleteTodo,
  }
}
