import { create } from 'zustand'
import type { Todo } from './types'

interface FilterState {
  status?: string
  priority?: string
  assigneeId?: string
}

interface TodoStore {
  todos: Todo[]
  filters: FilterState
  activeUserId: string

  // Actions
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  reorderTodo: (id: string, newOrder: number) => void

  setFilter: (filter: FilterState) => void
  clearFilters: () => void

  setActiveUser: (userId: string) => void

  // Computed
  getFilteredTodos: () => Todo[]
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  filters: {},
  activeUserId: 'user-1',

  setTodos: (todos) => set({ todos }),

  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
    })),

  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, ...updates } : todo
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  reorderTodo: (id, newOrder) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, order: newOrder } : todo
      ),
    })),

  setFilter: (filter) =>
    set((state) => ({
      filters: { ...state.filters, ...filter },
    })),

  clearFilters: () =>
    set({
      filters: {},
    }),

  setActiveUser: (userId) =>
    set({
      activeUserId: userId,
    }),

  getFilteredTodos: () => {
    const { todos, filters } = get()

    return todos.filter((todo) => {
      if (filters.status && todo.status !== filters.status) return false
      if (filters.priority && todo.priority !== filters.priority) return false
      if (filters.assigneeId && todo.assigneeId !== filters.assigneeId) return false
      return true
    })
  },
}))
