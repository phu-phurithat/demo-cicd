# Architecture Overview

## Component Hierarchy

### Server Components (Zero Client JS)
- `app/layout.tsx` - Root layout with fonts and metadata
- `app/page.tsx` - Main page with Suspense boundary
- `components/Header.tsx` - Page header and title
- `components/TodoCard.tsx` - Pure rendering component

### Client Components (`'use client'`)
- `components/Board.tsx` - Kanban board using useTodos + usePresence hooks
- All hooks: `useTodos`, `usePresence`

This split ensures:
- Minimal JavaScript sent to browser
- Fast initial load
- Efficient re-renders only on necessary client components

## Data Flow

### Realtime Todo Synchronization

```
┌─────────────────┐
│   User A        │
│  (Client 1)     │
└────────┬────────┘
         │
         │ Add Todo
         ↓
    ┌─────────────────────┐
    │  Supabase Realtime  │
    │  postgres_changes   │
    └────────┬────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
┌─────────────┐   ┌──────────────┐
│  User B     │   │  User C      │
│ (Client 2)  │   │ (Client 3)   │
└─────────────┘   └──────────────┘

Auto-sync via subscribeToTodos hook
```

### Cursor Presence

```
┌─────────────────┐
│  User A moves   │
│    cursor       │
└────────┬────────┘
         │
         │ mousemove event
         ↓
┌─────────────────────┐
│  Supabase Presence  │
│  (ephemeral state)  │
└────────┬────────────┘
         │
         ├────→ Broadcast to all connected users
         │
    ┌────┴────┐
    ↓         ↓
User B,C see cursor with name label at (x,y) position
```

## State Management

### Zustand Store (useTodoStore)

Local UI state:
- `todos: Todo[]` - Filtered todos
- `filters: FilterState` - Current filters
- `activeUserId: string` - Selected user

Actions:
- CRUD operations (add, update, delete, reorder)
- Filter management

### Supabase Integration

Persistent state:
- **Realtime Subscriptions**: Listen to todos table changes
- **Presence API**: Track online users and cursor positions
- **Row-Level Security**: Enforce data access rules

## Database Schema

### todos table

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT (high|medium|low),
  status TEXT (todo|in-progress|done),
  assignee_id UUID,
  due_date TIMESTAMP,
  tags TEXT[],
  created_at TIMESTAMP,
  order INT,
  updated_at TIMESTAMP
);
```

### Row-Level Security

```sql
-- Users can see all todos (collaborative)
CREATE POLICY "view_all"
  ON todos FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can modify all todos (collaborative editing)
CREATE POLICY "manage_all"
  ON todos FOR ALL
  USING (auth.role() = 'authenticated');
```

## Real-time Protocol

### Realtime Subscription (postgres_changes)

```typescript
supabase
  .channel('todos')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      // eventType: INSERT, UPDATE, DELETE
      // new: updated record
      // old: previous record
    })
  .subscribe()
```

### Presence (Cursor Tracking)

```typescript
supabase.channel(`presence:${userId}`, {
  config: {
    presence: { key: userId },
    broadcast: { self: true }
  }
})
  .on('presence', { event: 'sync' }, () => {
    // Get all online users
    const state = channel.presenceState()
  })
  .track({
    userId, name, color,
    cursor: { x, y }
  })
```

## Performance Optimizations

1. **Server Components by Default**: Reduces client bundle size
2. **Suspense Boundaries**: Allows streaming rendering
3. **useCallback Dependencies**: Prevents unnecessary hook re-runs
4. **Zustand Store**: Direct state mutations (no immutability overhead)
5. **Realtime Subscriptions**: Only receive deltas, not full refetch

## Security Model

- **RLS Policies**: Enforce row-level access control
- **Public Anon Key**: Safe to expose in browser (RLS protects data)
- **Authenticated Users Only**: All policies require `auth.role() = 'authenticated'`
- **No Secrets in Client**: Environment variables never leaked

## CI/CD Pipeline

```
Push to GitHub
      ↓
GitHub Actions CI
  ├─ Lint (ESLint)
  ├─ Type Check (TypeScript)
  ├─ Build (Next.js)
  └─ Tests (Vitest)
      ↓
All pass?
      ├─ NO: Fail the workflow
      └─ YES: Continue to deploy (if main branch)
           ↓
        Vercel Deploy
           ↓
        Production Live
```

## Deployment Architecture

```
┌──────────────────────────────────────────┐
│          GitHub Repository               │
│  ├─ Code                                 │
│  └─ .github/workflows/                   │
│      ├─ ci.yml   (lint, test, build)     │
│      └─ deploy.yml (Vercel deployment)   │
└──────────────────────────────────────────┘
           │
           ├────────────────────┐
           ↓                    ↓
      ┌──────────┐        ┌──────────────┐
      │ Vercel   │        │ Supabase     │
      │ (App)    │────→   │ (Backend)    │
      │ CDN      │        │ PostgreSQL   │
      │ Edge     │        │ Realtime     │
      │ Func     │        │ Auth         │
      └──────────┘        └──────────────┘
           │                   │
           └───────┬───────────┘
                   ↓
            ┌────────────────┐
            │ Browser        │
            │ (Client)       │
            │ Next.js App    │
            └────────────────┘
```

## Key Dependencies

- **next**: Framework
- **react**: UI library
- **zustand**: State management
- **@supabase/supabase-js**: Backend client
- **kibo-ui**: Component registry
- **tailwindcss**: Styling
- **typescript**: Type safety

