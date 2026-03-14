'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTodos } from '@/hooks/useTodos'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, X } from 'lucide-react'
import { getUserTimezone, getDateInputValue } from '@/lib/dateUtils'
import type { Todo } from '@/lib/types'

interface EditTodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo: Todo | null
}

export function EditTodoDialog({ open, onOpenChange, todo }: EditTodoDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const { updateTodo } = useTodos()

  // Populate form when todo changes
  useEffect(() => {
    if (open && todo) {
      setTitle(todo.title)
      setDescription(todo.description || '')
      setPriority(todo.priority as 'high' | 'medium' | 'low')
      setStatus(todo.status as 'todo' | 'in-progress' | 'done')
      setDueDate(getDateInputValue(todo.due_date))
      setTags(todo.tags.join(', '))
      setError(null)
      setTimeout(() => titleInputRef.current?.focus(), 100)
    }
  }, [open, todo])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Task title is required')
      return
    }

    if (!todo) return

    try {
      setLoading(true)
      setError(null)

      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      await updateTodo(todo.id, {
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        status,
        due_date: dueDate || undefined,
        tags: tagArray,
      })

      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save task. Please try again.'
      setError(errorMessage)
      console.error('Failed to update todo:', err)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = title.trim().length > 0 && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-slate-700/50 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-400">
            ✏️ Edit Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <AlertCircle size={18} className="flex-shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-300"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Title input */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-50">
              Task Title <span className="text-red-400">*</span>
            </label>
            <Input
              ref={titleInputRef}
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError(null)
              }}
              disabled={loading}
              maxLength={255}
              className="border-slate-600/50 bg-slate-800/50 text-slate-50 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-colors"
            />
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-50">
              Description
            </label>
            <Input
              id="description"
              placeholder="Add details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="border-slate-600/50 bg-slate-800/50 text-slate-50 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-colors"
            />
          </div>

          {/* Status, Priority grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status select */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-semibold text-slate-50">
                Status
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'todo' | 'in-progress' | 'done')} disabled={loading}>
                <SelectTrigger id="status" className="border-slate-600/50 bg-slate-800/50 text-slate-50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-slate-50">
                  <SelectItem value="todo" className="hover:bg-slate-700">📋 To Do</SelectItem>
                  <SelectItem value="in-progress" className="hover:bg-slate-700">⚙️ In Progress</SelectItem>
                  <SelectItem value="done" className="hover:bg-slate-700">✅ Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority select with color */}
            <div className="space-y-2">
              <label htmlFor="priority" className="block text-sm font-semibold text-slate-50">
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'high' | 'medium' | 'low')} disabled={loading}>
                <SelectTrigger id="priority" className={`border-slate-600/50 text-slate-50 transition-colors ${
                  priority === 'high' ? 'bg-red-500/20 border-red-500/50' :
                  priority === 'medium' ? 'bg-amber-500/20 border-amber-500/50' :
                  'bg-emerald-500/20 border-emerald-500/50'
                } focus:border-cyan-500/50 focus:ring-cyan-500/20`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-slate-50">
                  <SelectItem value="low" className="hover:bg-slate-700">🟢 Low</SelectItem>
                  <SelectItem value="medium" className="hover:bg-slate-700">🟡 Medium</SelectItem>
                  <SelectItem value="high" className="hover:bg-slate-700">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date and tags grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due date input */}
            <div className="space-y-2">
              <label htmlFor="due-date" className="block text-sm font-semibold text-slate-50">
                Due Date
              </label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
                className="border-slate-600/50 bg-slate-800/50 text-slate-50 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-colors"
              />
              <p className="text-xs text-slate-400">Timezone: {getUserTimezone()}</p>
            </div>

            {/* Tags input */}
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-semibold text-slate-50">
                Tags
              </label>
              <Input
                id="tags"
                placeholder="Separate with commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
                className="border-slate-600/50 bg-slate-800/50 text-slate-50 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Tag preview */}
          {tags && (
            <div className="flex flex-wrap gap-2">
              {tags
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
                .map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-slate-600/50 text-slate-300 hover:bg-slate-700/30 hover:text-slate-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '💾 Saving...' : '💾 Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
