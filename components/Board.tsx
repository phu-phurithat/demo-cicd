'use client'

import { useState, useRef, useEffect } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { useTodoStore } from '@/lib/store'
import { TodoCard } from './TodoCard'
import { EditTodoDialog } from './EditTodoDialog'
import { usePresence } from '@/hooks/usePresence'
import { getOrGenerateUserName, getColorForUserId } from '@/lib/randomNames'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { Todo } from '@/lib/types'

export function Board() {
  const { deleteTodo, updateTodo: updateTodoAPI } = useTodos()
  const { getFilteredTodos, updateTodo: updateTodoLocal } = useTodoStore()
  
  // Initialize with actual values from sessionStorage after hydration
  const [userId] = useState(() => {
    const stored = sessionStorage.getItem('boardUserId')
    if (stored) return stored
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    sessionStorage.setItem('boardUserId', id)
    return id
  })

  const [userName] = useState(() => {
    const stored = sessionStorage.getItem('boardUserName')
    if (stored) return stored
    const name = getOrGenerateUserName()
    sessionStorage.setItem('boardUserName', name)
    return name
  })
  
  // Get deterministic color based on userId (ensures no duplicate colors)
  const userColor = getColorForUserId(userId)
  
  // Only call usePresence once userId is set
  const { others, isConnected, setSelfCursor, setEditingTask } = usePresence(userId, userName, userColor)
  
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [dragOverColumnStatus, setDragOverColumnStatus] = useState<string | null>(null)
  const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  // Track and broadcast mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Light throttle (10ms) at UI layer - hook does batch throttling (40ms) at network layer
      if (cursorThrottleRef.current) return
      
      setSelfCursor(e.clientX, e.clientY)
      cursorThrottleRef.current = setTimeout(() => {
        cursorThrottleRef.current = null
      }, 10)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [setSelfCursor])

  // Track when editing a task
  useEffect(() => {
    if (showEditDialog && editingTodo) {
      setEditingTask(editingTodo.id)
    } else {
      setEditingTask(null)
    }
  }, [showEditDialog, editingTodo, setEditingTask])

  const filteredTodos = getFilteredTodos()

  const todosByStatus = {
    todo: filteredTodos.filter((t) => t.status === 'todo'),
    'in-progress': filteredTodos.filter((t) => t.status === 'in-progress'),
    done: filteredTodos.filter((t) => t.status === 'done'),
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setShowEditDialog(true)
  }

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumnStatus(status)
  }

  const handleDragLeave = () => {
    setDragOverColumnStatus(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    setDragOverColumnStatus(null)
    const todoId = e.dataTransfer?.getData('todoId')
    if (todoId && filteredTodos) {
      const todo = filteredTodos.find(t => t.id === todoId)
      if (todo && todo.status !== targetStatus) {
        // Optimistic update - instant feedback
        updateTodoLocal(todoId, { status: targetStatus as 'todo' | 'in-progress' | 'done' })
        
        // Send to server in background (no debounce)
        updateTodoAPI(todoId, { status: targetStatus as 'todo' | 'in-progress' | 'done' }).catch(() => {
          // If it fails, revert will happen via real-time subscription
        })
      }
    }
  }

  const handleStatusChange = (id: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    const todo = filteredTodos.find(t => t.id === id)
    if (todo && todo.status !== newStatus) {
      // Optimistic update - instant feedback
      updateTodoLocal(id, { status: newStatus })
      
      // Send to server in background
      updateTodoAPI(id, { status: newStatus }).catch(() => {
        // If it fails, revert will happen via real-time subscription
      })
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

  const statusConfig = {
    todo: {
      icon: AlertCircle,
      label: 'To Do',
      color: 'from-amber-500/20 to-amber-600/10',
      borderColor: 'border-amber-500/30',
    },
    'in-progress': {
      icon: Clock,
      label: 'In Progress',
      color: 'from-violet-500/20 to-violet-600/10',
      borderColor: 'border-violet-500/30',
    },
    done: {
      icon: CheckCircle2,
      label: 'Completed',
      color: 'from-emerald-500/20 to-emerald-600/10',
      borderColor: 'border-emerald-500/30',
    },
  }

  return (
    <div ref={boardRef} className="min-h-screen bg-gradient-to-br from-[#0f1119] via-[#1a1b27] to-[#0f1119] p-8 relative">
      <div className="mx-auto max-w-7xl">
        {/* Stats bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {(['todo', 'in-progress', 'done'] as const).map((status) => {
            const config = statusConfig[status]
            const Icon = config.icon
            return (
              <div
                key={status}
                className={`relative overflow-hidden rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.color} backdrop-blur-md p-6 transition-all duration-300 hover:border-opacity-50`}
              >
                <div className="absolute -right-8 -top-8 opacity-10">
                  <Icon size={120} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} className="opacity-70" />
                    <p className="text-sm font-medium opacity-80">{config.label}</p>
                  </div>
                  <p className="text-3xl font-bold">{todosByStatus[status].length}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Todo columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['todo', 'in-progress', 'done'] as const).map((status) => (
            <div key={status} className="flex flex-col">
              {/* Column header */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-white mb-1">
                  {statusConfig[status].label}
                </h2>
                <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" />
              </div>

              {/* Cards container */}
              <div
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
                className={`flex-1 space-y-3 rounded-2xl bg-gradient-to-b from-slate-900/30 to-slate-950/30 border backdrop-blur-sm p-4 min-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent transition-all duration-200 ${
                  dragOverColumnStatus === status
                    ? 'border-cyan-400/50 bg-gradient-to-b from-cyan-500/10 to-cyan-600/5'
                    : 'border-slate-800/50'
                }`}
              >
                {todosByStatus[status].length === 0 ? (
                  <div className="flex items-center justify-center h-full opacity-40">
                    <p className="text-sm text-slate-400">No tasks yet</p>
                  </div>
                ) : (
                  todosByStatus[status].map((todo) => {
                    const editingUsers = others
                      .filter(u => u.editingTaskId === todo.id)
                      .map(u => ({ name: u.name, color: u.color }))
                    return (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                        editingUsers={editingUsers}
                      />
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Other users' cursors */}
        {others.map((user) =>
          user.cursor ? (
            <div
              key={user.userId}
              className="fixed pointer-events-none z-50 transition-all duration-500 ease-out"
              style={{
                left: `${user.cursor.x}px`,
                top: `${user.cursor.y}px`,
                willChange: 'left, top',
              }}
            >
              <div className="relative -ml-1 -mt-1">
                {/* Cursor pointer */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  className="drop-shadow-lg"
                  style={{ fill: user.color }}
                >
                  <path d="M0 0 L4.36 14.86 L8.07 7.93 L16 0 Z" />
                </svg>
                {/* User label */}
                <div
                  className="absolute top-6 left-0 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap pointer-events-none"
                  style={{
                    backgroundColor: user.color,
                    boxShadow: `0 0 8px ${user.color}40`,
                  }}
                >
                  {user.name}
                </div>
              </div>
            </div>
          ) : null
        )}

        {/* Connection & presence bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/50 bg-gradient-to-r from-slate-900/40 to-slate-950/40 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-medium text-slate-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-400">
              Total: <span className="text-cyan-400">{filteredTodos.length}</span> | Active: <span className="text-violet-400">{others.length + 1}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <span>👥 Viewing:</span>
            <div className="flex flex-wrap items-center gap-2">
              {/* Current user */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-700/50 border border-slate-600/50">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: userColor }}
                />
                <span style={{ color: userColor }}>{userName}</span>
              </div>
              {/* Other users */}
              {others.map((user) => (
                <div 
                  key={user.userId}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-700/50 border border-slate-600/50"
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: user.color }}
                  />
                  <span style={{ color: user.color }}>{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Todo Dialog */}
      <EditTodoDialog 
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        todo={editingTodo}
      />
    </div>
  )
}
