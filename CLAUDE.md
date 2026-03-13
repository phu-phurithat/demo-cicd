# Claude Code Guidelines

## Project Context

**Collaborative Todo List** - A real-time collaborative task management application built with Next.js 15, Supabase, and Tailwind CSS. Features include real-time todo synchronization, cursor tracking, and a Trello-style Kanban board UI.

- **Tech Stack**: Next.js 15, TypeScript, Supabase (PostgreSQL + Realtime), Zustand, Tailwind CSS v4, Kibo UI
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **CI/CD**: GitHub Actions

## Working Style Preferences

### Code Quality Standards

1. **Always use snake_case for database field names** - The Supabase schema uses snake_case (`assignee_id`, `due_date`, `created_at`). TypeScript types must match this exactly to avoid PGRST204 errors.

2. **Keep TypeScript strict** - All code must pass `npm run lint` and `npm run typecheck` without errors or warnings. Use explicit types, avoid `any`, and remove unused imports.

3. **Server Components by default** - Follow Vercel React best practices: use Server Components for layout, data fetching, and static content. Only make components `'use client'` when they need interactivity or client-side state.

4. **One component per file** - Each component gets its own file. Keep files focused and under 200 lines when possible.

## Architecture Decisions

### Component Boundaries

- **Server Components**: `Header` (layout), `TodoCard` (rendering)
- **Client Components**: `Board`, `CreateTodoDialog` (state/interactivity), all hooks

**Why:** Minimal JavaScript sent to browser, faster initial page load, automatic code-splitting.

### Data Flow

1. **Local State (Zustand)**: UI state (filters, active user)
2. **Remote State (Supabase)**: Persistent data (todos, via Realtime)
3. **Realtime Sync**: `useTodos` hook subscribes to database changes

**Pattern:** Never duplicate data between Zustand and Supabase. Store only derives from fetched todos.

### Database Schema

All todo operations must respect:

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

**Critical**: Use exact column names. Snake_case ONLY.

## Common Tasks

### Adding a Feature

1. **Define types first** in `lib/types.ts`
2. **Add Zustand store logic** in `lib/store.ts` if needed
3. **Implement API in `lib/supabase.ts`** (CRUD operations)
4. **Create hook in `hooks/` if needed** (realtime subscription)
5. **Build UI component** with proper `'use client'` boundary
6. **Test**: `npm run lint && npm run build`

### Fixing Bugs

1. **Always run `npm run lint` first** to catch TypeScript/ESLint errors
2. **Check Supabase console** for RLS policy issues or schema mismatches
3. **Look at browser console** for client-side errors
4. **Verify field names** - snake_case in DB, camelCase forbidden

### Testing Locally

```bash
npm run dev              # Start dev server on http://localhost:3001
npm run lint             # Check for TS/ESLint errors
npm run typecheck        # Run TypeScript type checker
npm run build            # Full production build
```

## Do's and Don'ts

### ✅ DO

- Use `const` for all variable declarations
- Import types with `import type {}`
- Pass handlers through component props
- Keep components focused on single responsibility
- Test with real Supabase project (not mocks)
- Update both frontend types AND Supabase schema when changing data structure

### ❌ DON'T

- Use camelCase for database field names (use snake_case)
- Create unused imports or variables
- Use `any` type (use explicit types)
- Duplicate state between Zustand and Supabase
- Mock Supabase in tests (use real database)
- Add features beyond what was requested
- Change TypeScript config without asking

## File Structure

```
.worktrees/collaborative-todo/
├── app/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (metadata here)
│   └── globals.css        # Tailwind + theme
├── components/
│   ├── Board.tsx          # Main Kanban board (client)
│   ├── Header.tsx         # Top header with create button (client)
│   ├── TodoCard.tsx       # Todo card component (client)
│   ├── CreateTodoDialog.tsx # Create todo modal (client)
│   ├── kibo-ui/           # Kibo UI components
│   └── ui/                # shadcn/ui base components
├── lib/
│   ├── supabase.ts        # Supabase client + CRUD
│   ├── store.ts           # Zustand state management
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Utility functions
├── hooks/
│   ├── useTodos.ts        # Realtime todos subscription
│   └── usePresence.ts     # Cursor tracking hook
├── .github/workflows/
│   ├── ci.yml             # Lint + build on PR
│   └── deploy.yml         # Deploy to Vercel on push main
└── docs/
    └── architecture.md    # System design docs
```

## Deployment

**CI/CD Pipeline:**
1. Push to feature branch → GitHub Actions runs CI (lint, build)
2. Push to `main` → Automatic Vercel deployment
3. Environment variables required in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Before merging to main:**
- ✅ `npm run lint` passes
- ✅ `npm run build` passes
- ✅ All tests pass
- ✅ No console errors

## When in Doubt

1. **Check existing code** for patterns (TodoCard, CreateTodoDialog, useTodos)
2. **Read error messages carefully** - they usually point to the exact issue
3. **Verify field names** - 90% of bugs are snake_case vs camelCase mismatches
4. **Test with real Supabase** - never use mocks
5. **Ask me** if you're unsure about architecture or requirements
