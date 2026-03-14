import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import { TodoCard } from '../TodoCard'
import type { Todo } from '@/lib/types'

describe('TodoCard', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test description',
    priority: 'high',
    status: 'todo',
    assignee_id: 'user-1',
    tags: ['work'],
    created_at: new Date().toISOString(),
    order: 0,
  }

  it('renders todo title', () => {
    render(<TodoCard todo={mockTodo} />)
    expect(screen.getByText('Test Todo')).toBeInTheDocument()
  })

  it('displays priority badge', () => {
    render(<TodoCard todo={mockTodo} />)
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<TodoCard todo={mockTodo} />)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
})
