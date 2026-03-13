'use client'

import { Card } from '@/components/ui/card'
import { Trash2, GripHorizontal } from 'lucide-react'
import type { Todo } from '@/lib/types'
import { useState } from 'react'

const priorityIcons = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
}

interface TodoCardProps {
  todo: Todo
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: 'todo' | 'in-progress' | 'done') => void
}

export function TodoCard({ todo, onDelete, onStatusChange }: TodoCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('todoId', todo.id)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <GripHorizontal className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 break-words">{todo.title}</h3>
            {todo.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{todo.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {priorityIcons[todo.priority]} {todo.priority}
            </span>
            {todo.due_date && (
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">
                {new Date(todo.due_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(todo.id)}
              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status buttons */}
        {onStatusChange && (
          <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
            {(['todo', 'in-progress', 'done'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(todo.id, status)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  todo.status === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={`Move to ${status}`}
              >
                {status === 'in-progress' ? 'In Progress' : status}
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
