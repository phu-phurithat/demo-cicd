'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTodos } from '@/hooks/useTodos'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { getTodayLocalDate, getUserTimezone } from '@/lib/dateUtils'

interface CreateTodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTodoDialog({ open, onOpenChange }: CreateTodoDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const { addTodo } = useTodos()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setPriority('medium')
      // Set due date to today in user's local timezone
      setDueDate(getTodayLocalDate())
      setTags('')
      setError(null)
      setSuccess(false)
      // Focus title input after dialog opens
      setTimeout(() => titleInputRef.current?.focus(), 100)
    }
  }, [open])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Enter or Ctrl+Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        // Create and dispatch a submit event on the form element
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
        document.querySelector('form')?.dispatchEvent(submitEvent)
      }
      // Escape to close (handled by Dialog component)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Task title is required')
      return
    }

    if (trimmedTitle.length > 255) {
      setError('Task title must be less than 255 characters')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      await addTodo(trimmedTitle, description.trim(), priority, dueDate || undefined, tagArray)

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
      }, 800)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task. Please try again.'
      setError(errorMessage)
      console.error('Failed to create todo:', err)
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
            <Wand2 size={20} />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 rounded-full bg-emerald-500/20 p-3">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <p className="text-center text-slate-50">Task created successfully! 🎉</p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
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
              <div className="text-xs text-slate-400">
                {title.length}/255
              </div>
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

            {/* Two column layout for priority and due date */}
            <div className="grid grid-cols-2 gap-4">
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
                {/* Priority color indicator */}
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full ${
                    priority === 'high' ? 'bg-red-400' :
                    priority === 'medium' ? 'bg-amber-400' :
                    'bg-emerald-400'
                  }`} />
                  <span className="text-slate-400">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                  </span>
                </div>
              </div>

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
            </div>

            {/* Tags input */}
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-semibold text-slate-50">
                Tags
              </label>
              <Input
                id="tags"
                placeholder="Separate with commas (e.g. urgent, frontend, bug)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
                className="border-slate-600/50 bg-slate-800/50 text-slate-50 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-colors"
              />
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
            </div>

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
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Creating...
                  </span>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>

            {/* Keyboard shortcut hint */}
            <div className="text-center text-xs text-slate-500">
              💡 Press <kbd className="rounded bg-slate-700 px-1.5 py-0.5 font-mono">Cmd+Enter</kbd> to submit
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
