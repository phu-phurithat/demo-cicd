'use client'

import { Trash2, Zap, Clock, Circle, Edit2 } from 'lucide-react'
import type { Todo } from '@/lib/types'
import { useState } from 'react'
import { formatDateWithTimezone } from '@/lib/dateUtils'

const priorityConfig = {
  high: {
    icon: Zap,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    label: 'High',
  },
  medium: {
    icon: Circle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    label: 'Medium',
  },
  low: {
    icon: Circle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    label: 'Low',
  },
}

const statusColors = {
  todo: 'hover:border-amber-500/40',
  'in-progress': 'hover:border-violet-500/40',
  done: 'hover:border-emerald-500/40',
}

interface TodoCardProps {
  todo: Todo
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: 'todo' | 'in-progress' | 'done') => void
  onEdit?: (todo: Todo) => void
  editingUsers?: Array<{ name: string; color: string }>
}

export function TodoCard({ todo, onDelete, onStatusChange, onEdit, editingUsers }: TodoCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const priorityInfo = priorityConfig[todo.priority]
  const PriorityIcon = priorityInfo.icon

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('todoId', todo.id)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleStatusChangeClick = (status: 'todo' | 'in-progress' | 'done') => {
    if (todo.status !== status) {
      onStatusChange?.(todo.id, status)
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEdit?.(todo)}
      className={`group relative overflow-hidden rounded-xl border border-slate-700/40 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md p-4 shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-2xl hover:border-slate-600/60 ${statusColors[todo.status]} ${isDragging ? 'opacity-50' : ''} hover:ring-2 hover:ring-cyan-500/20`}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-transparent opacity-60" />

      <div className="space-y-3">
        {/* Title */}
        <div className="pr-8">
          <h3 className="font-semibold text-slate-50 text-base leading-snug break-words">
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{todo.description}</p>
          )}
        </div>

        {/* Tags */}
        {todo.tags && todo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {todo.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full bg-slate-700/30 border border-slate-600/30 text-xs text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Editing users indicator */}
        {editingUsers && editingUsers.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
            <span className="text-xs font-medium text-amber-400">✏️ Editing:</span>
            <div className="flex gap-1">
              {editingUsers.map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700/50"
                  style={{ borderBottom: `2px solid ${user.color}` }}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-xs font-medium" style={{ color: user.color }}>
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta info and controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${priorityInfo.bgColor} group-hover:bg-opacity-100 transition-all`}>
            <PriorityIcon size={14} className={priorityInfo.color} />
            <span className={`text-xs font-medium ${priorityInfo.color}`}>
              {priorityInfo.label}
            </span>
          </div>

          {/* Due date badge */}
          {todo.due_date && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all">
              <Clock size={13} className="text-cyan-400" />
              <span className="text-xs font-medium text-cyan-400">
                {formatDateWithTimezone(todo.due_date)}
              </span>
            </div>
          )}

          {/* Edit and Delete buttons */}
          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(todo)
                }}
                className="text-slate-500 hover:text-cyan-400 transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(todo.id)
                }}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Status buttons */}
        {onStatusChange && (
          <div className="flex gap-1.5 pt-2 border-t border-slate-700/30 mt-2">
            {(['todo', 'in-progress', 'done'] as const).map((status) => {
              const isActive = todo.status === status
              const statusButtonConfig = {
                todo: { label: 'To Do', bgActive: 'bg-amber-500/20 border-amber-500/50', bgInactive: 'hover:bg-slate-700/30' },
                'in-progress': { label: 'In Progress', bgActive: 'bg-violet-500/20 border-violet-500/50', bgInactive: 'hover:bg-slate-700/30' },
                done: { label: 'Done', bgActive: 'bg-emerald-500/20 border-emerald-500/50', bgInactive: 'hover:bg-slate-700/30' },
              }
              const config = statusButtonConfig[status]

              return (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChangeClick(status)
                  }}
                  className={`flex-1 text-xs px-2 py-1.5 rounded-lg font-medium transition-all duration-200 border ${
                    isActive
                      ? config.bgActive + ' border-opacity-100 text-white'
                      : `border-transparent text-slate-400 ${config.bgInactive}`
                  }`}
                  title={`Move to ${status}`}
                >
                  {config.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
