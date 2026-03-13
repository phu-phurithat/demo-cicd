# Claude Code Guidelines

## Project Context

**Collaborative Todo List** - A real-time collaborative task management application built with Next.js 15, Prisma, Supabase Realtime, and Tailwind CSS. Features include real-time todo synchronization, cursor tracking, and a modern dark mode Kanban-inspired UI.

- **Tech Stack**: Next.js 15, TypeScript, Prisma ORM, PostgreSQL (via Supabase), Supabase Realtime, Zustand, Tailwind CSS v4, Kibo UI
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
2. **API Layer (Next.js)**: Data mutations via `/app/api/todos/*` routes with Prisma ORM
3. **Database (PostgreSQL)**: Persistent storage via Prisma
4. **Realtime Sync**: `useTodos` hook subscribes to Supabase Realtime for collaborative features

**Pattern:** Client → API Routes → Prisma → PostgreSQL. Realtime subscriptions handled separately via Supabase.

### Database Schema (Prisma)

All todo operations use Prisma ORM. Schema defined in `prisma/schema.prisma`:

```prisma
model Todo {
  id        String    @id @default(uuid())
  title     String    @db.VarChar(255)
  description String?
  priority  String    @default("medium") // high|medium|low
  status    String    @default("todo") // todo|in-progress|done
  assignee_id String?
  due_date  DateTime?
  tags      String[]  @default([])
  order     Int       @default(0)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

**Database Operations**: Use API routes in `/app/api/todos` instead of direct client calls. Prisma handles all query generation and type safety.

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
│   ├── globals.css        # Tailwind + theme
│   └── api/
│       └── todos/
│           └── route.ts   # Todo CRUD API endpoints
├── components/
│   ├── Board.tsx          # Main board (client)
│   ├── Header.tsx         # Top header (client)
│   ├── TodoCard.tsx       # Todo card component (client)
│   ├── CreateTodoDialog.tsx # Create modal (client)
│   ├── kibo-ui/           # Kibo UI components
│   └── ui/                # shadcn/ui base components
├── lib/
│   ├── prisma.ts          # Prisma ORM singleton
│   ├── supabase.ts        # Supabase realtime + API wrapper
│   ├── store.ts           # Zustand state management
│   ├── types.ts           # TypeScript interfaces
│   └── utils.ts           # Utility functions
├── hooks/
│   ├── useTodos.ts        # Realtime todos subscription
│   └── usePresence.ts     # Cursor tracking hook
├── prisma/
│   ├── schema.prisma      # Prisma ORM schema
│   ├── README.md          # Prisma setup guide
│   └── migrations/        # Database migrations
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
   - `POSTGRES_PRISMA_URL` (for Prisma database)

**Database Setup:**
- Run migrations before first deploy: `npx prisma migrate deploy`
- Prisma schema in `prisma/schema.prisma` defines database structure
- API routes handle all data operations through Prisma ORM

**Before merging to main:**
- ✅ `npm run lint` passes
- ✅ `npm run build` passes
- ✅ Prisma schema is valid
- ✅ All tests pass
- ✅ No console errors

## When in Doubt

1. **Check existing code** for patterns (TodoCard, CreateTodoDialog, useTodos)
2. **Read error messages carefully** - they usually point to the exact issue
3. **Verify field names** - 90% of bugs are snake_case vs camelCase mismatches
4. **Test with real Supabase** - never use mocks
5. **Ask me** if you're unsure about architecture or requirements
