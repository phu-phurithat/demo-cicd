'use client'

import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { CreateTodoDialog } from './CreateTodoDialog'

export function Header() {
  const [showDialog, setShowDialog] = useState(false)

  // Global keyboard shortcut to open dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open dialog
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowDialog(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-800/50 bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative px-3 py-2 bg-slate-900 rounded-lg">
                  <Sparkles size={20} className="text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Task Board
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">Real-time collaborative tasks</p>
              </div>
            </div>

            {/* Create button */}
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/40 hover:scale-105"
              onClick={() => setShowDialog(true)}
              title="Or press Cmd+K / Ctrl+K"
            >
              <Plus size={18} />
              Add Task
            </Button>
          </div>
        </div>
      </header>
      <CreateTodoDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  )
}
