'use client'

import { useTodos } from '@/hooks/useTodos'
import { useTodoStore } from '@/lib/store'
import { TodoCard } from './TodoCard'
import { usePresence } from '@/hooks/usePresence'

export function Board() {
  const { todos, isLoading } = useTodos()
  const { getFilteredTodos } = useTodoStore()
  const { others } = usePresence('user-1', 'Current User', '#0052CC')

  const filteredTodos = getFilteredTodos()

  const todosByStatus = {
    todo: filteredTodos.filter((t) => t.status === 'todo'),
    'in-progress': filteredTodos.filter((t) => t.status === 'in-progress'),
    done: filteredTodos.filter((t) => t.status === 'done'),
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0079BF] to-[#0052CC] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['todo', 'in-progress', 'done'] as const).map((status) => (
            <div
              key={status}
              className="bg-[#EBECF0] rounded-lg p-4 min-h-96 flex flex-col"
            >
              <h2 className="font-bold text-gray-700 mb-3 capitalize">
                {status === 'in-progress' ? 'In Progress' : status}
              </h2>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {todosByStatus[status].map((todo) => (
                  <TodoCard key={todo.id} todo={todo} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Online users indicator */}
        {others.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm font-semibold text-gray-600">
              Online users: {others.map((u) => u.name).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
