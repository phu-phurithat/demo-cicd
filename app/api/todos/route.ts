import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface TodoChangePayload {
  new: Record<string, unknown> | null
  old: Record<string, unknown> | null
}

// GET /api/todos - Fetch all todos
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: [{ order: 'asc' }, { created_at: 'desc' }],
    })
    return NextResponse.json(todos)
  } catch (error) {
    console.error('Failed to fetch todos:', error)
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

// Helper to broadcast realtime event
async function broadcastTodoChange(eventType: 'INSERT' | 'UPDATE' | 'DELETE', payload: TodoChangePayload) {
  try {
    await supabase.channel('todos').send({
      type: 'broadcast',
      event: `todo_${eventType.toLowerCase()}`,
      payload: { eventType, new: payload.new, old: payload.old },
    })
  } catch (error) {
    console.error('Failed to broadcast todo change:', error)
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, status, assignee_id, due_date, tags, order } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'medium',
        status: status || 'todo',
        assignee_id: assignee_id || null,
        due_date: due_date ? new Date(due_date) : null,
        tags: tags || [],
        order: order ?? 0,
      },
    })

    // Broadcast realtime event
    await broadcastTodoChange('INSERT', { new: todo, old: null })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    console.error('Failed to create todo:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}

// PATCH /api/todos/:id - Update a todo
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, priority, status, assignee_id, due_date, tags, order } = body

    // Get old values for broadcast
    const old = await prisma.todo.findUnique({ where: { id } })

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(assignee_id !== undefined && { assignee_id: assignee_id || null }),
        ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
        ...(tags !== undefined && { tags }),
        ...(order !== undefined && { order }),
      },
    })

    // Broadcast realtime event
    await broadcastTodoChange('UPDATE', { new: todo, old })

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Failed to update todo:', error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

// DELETE /api/todos/:id - Delete a todo
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const deleted = await prisma.todo.delete({
      where: { id },
    })

    // Broadcast realtime event
    await broadcastTodoChange('DELETE', { new: null, old: deleted })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete todo:', error)
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
