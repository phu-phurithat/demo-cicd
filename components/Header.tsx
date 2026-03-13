'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { CreateTodoDialog } from './CreateTodoDialog'

export function Header() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-10 bg-[#0079BF] text-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Collaborative Todos</h1>
            <Button
              size="sm"
              className="gap-2 bg-[#0052CC] hover:bg-[#003D99]"
              onClick={() => setShowDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          </div>
        </div>
      </header>
      <CreateTodoDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  )
}
