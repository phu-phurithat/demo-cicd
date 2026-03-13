import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import type { Todo } from '@/lib/types'

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
}

const statusLabels = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
}

interface TodoCardProps {
  todo: Todo
  onDelete?: (id: string) => void
}

export function TodoCard({ todo, onDelete }: TodoCardProps) {
  return (
    <Card className="bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">{todo.title}</h3>
        {todo.description && <p className="text-sm text-gray-600">{todo.description}</p>}

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            <Badge className={`text-xs ${priorityColors[todo.priority]}`}>
              {todo.priority}
            </Badge>
            {todo.dueDate && (
              <Badge variant="outline" className="text-xs">
                {new Date(todo.dueDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(todo.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
