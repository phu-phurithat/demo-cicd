'use client'

import { useTodos } from '@/hooks/useTodos'
import { useTodoStore } from '@/lib/store'
import { TodoCard } from './TodoCard'
import { usePresence } from '@/hooks/usePresence'

export function Board() {
  const { deleteTodo, updateTodo } = useTodos()
  const { getFilteredTodos } = useTodoStore()
  const { others, isConnected } = usePresence('user-1', 'Current User', '#0052CC')

  const filteredTodos = getFilteredTodos()

  const todosByStatus = {
    todo: filteredTodos.filter((t) => t.status === 'todo'),
    'in-progress': filteredTodos.filter((t) => t.status === 'in-progress'),
    done: filteredTodos.filter((t) => t.status === 'done'),
  }

  const handleStatusChange = async (id: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      await updateTodo(id, { status: newStatus })
    } catch (error) {
      console.error('Failed to update todo status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this card?')) {
      try {
        await deleteTodo(id)
      } catch (error) {
        console.error('Failed to delete todo:', error)
      }
    }
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
              <h2 className="font-bold text-gray-900 mb-3">
                {status === 'in-progress' ? 'In Progress' : status === 'todo' ? 'To Do' : 'Done'}{' '}
                <span className="text-gray-500 font-normal">({todosByStatus[status].length})</span>
              </h2>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {todosByStatus[status].map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-white text-sm">
            <span>Total cards: {filteredTodos.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
            <span className="text-white text-xs">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Online users indicator */}
        {others.length > 0 && (
          <div className="mt-4 bg-white bg-opacity-10 backdrop-blur rounded-lg p-3 shadow-md">
            <p className="text-white text-sm font-semibold">
              👥 Viewing: {others.map((u) => u.name).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
