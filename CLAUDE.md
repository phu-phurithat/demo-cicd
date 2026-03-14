# Claude Code Guidelines

## Project Context

**Collaborative Todo List** - A real-time collaborative task management application built with Next.js 15, Prisma, Supabase Realtime, and Tailwind CSS. Features include real-time todo synchronization, cursor tracking with smooth animation, task-specific editing indicators, and a modern dark mode Kanban-inspired UI.

**Current Status:**
- ✅ Real-time todo sync with optimistic updates (instant UI feedback)
- ✅ Cursor tracking with smooth 500ms ease-out animation
- ✅ Task-specific editing indicators (amber "Editing: Name" badge)
- ✅ Hydration-safe SSR rendering (no server/client mismatch)
- ✅ Dual-layer throttling (10ms UI + 100ms network = smooth motion)
- ✅ Unique user IDs per tab with deterministic colors
- ✅ Timezone-aware date handling

- **Tech Stack**: Next.js 15, TypeScript, Prisma ORM, PostgreSQL (via Supabase), Supabase Realtime, Zustand, Tailwind CSS v4, Kibo UI
- **Hosting**: Vercel (frontend) + Supabase (backend)
- **CI/CD**: GitHub Actions

## Working Style Preferences

### Code Quality Standards

1. **Always use snake_case for database field names** - The Supabase schema uses snake_case (`assignee_id`, `due_date`, `created_at`). TypeScript types must match this exactly to avoid PGRST204 errors.

2. **Keep TypeScript strict** - All code must pass `npm run lint` and `npm run typecheck` without errors or warnings. Use explicit types, avoid `any`, and remove unused imports.

3. **Server Components by default** - Follow Vercel React best practices: use Server Components for layout, data fetching, and static content. Only make components `'use client'` when they need interactivity or client-side state.

4. **One component per file** - Each component gets its own file. Keep files focused and under 200 lines when possible.

5. **Hydration Safety (SSR Critical)** - Avoid server/client mismatches:
   - ❌ DON'T: Use `typeof window !== 'undefined'` in state initializers
   - ❌ DON'T: Use `Math.random()`, `Date.now()`, or `sessionStorage` in state initializers
   - ❌ DON'T: Use locale-dependent formatting like `toLocaleDateString()` without checks
   - ✅ DO: Defer all client-only logic (random, sessionStorage, locale) to `useEffect`
   - ✅ DO: Initialize state with placeholder values, update in useEffect
   - ✅ DO: Use utility functions like `formatDateWithTimezone()` for consistent formatting

6. **Presence System (usePresence Hook)** - Cursor tracking optimizations:
   - Use **refs** (`editingTaskIdRef`) instead of state for values needed in closures
   - Implement **dual-layer throttling**: 10ms UI throttle + 100ms network throttle
   - Store last cursor position in `lastCursorRef` to avoid losing position on quick updates
   - When exiting edit mode, restore cursor position from `lastCursorRef`
   - Cursor animation: 500ms ease-out (natural deceleration, not jerky)

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
5. **Presence System** (`usePresence` hook):
   - Tracks other users' cursors and editing states
   - Uses Supabase Presence API for ephemeral user session data
   - Single shared presence channel `'presence:board'` for all users
   - Broadcasts: `{ userId, name, color, cursor: {x, y}, editingTaskId }`
   - Cursor updates throttled: 10ms UI layer + 100ms network layer (batching)
   - Editing state: When user opens edit dialog → broadcasts `editingTaskId`, hides cursor
   - 1-second polling for robust presence state sync

**Pattern:** Client → API Routes → Prisma → PostgreSQL. Realtime subscriptions + Presence handled separately via Supabase.

### Cursor Tracking & Smooth Motion

**Animation Stack:**
1. **Board.tsx**: Maps `others.cursor` positions to CSS `left`/`top` with `transition-all duration-500 ease-out`
2. **usePresence.ts**: Throttles updates to match animation curve (100ms network batches → matches 500ms animation)
3. **Result**: Smooth gliding cursor motion, no jumps or stutters

**Key Values (DO NOT CHANGE WITHOUT TESTING):**
- Cursor animation: `duration-500 ease-out` (feels natural, not robotic)
- UI throttle: `10ms` (captures frequent mouse moves without lag)
- Network throttle: `100ms` (batches updates to match animation rhythm)
- Presence poll: `1000ms` (syncs active count, doesn't need to be frequent)

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
- **Defer client-only logic to useEffect** (random, sessionStorage, locale)
- **Use refs for closure-dependent values** in hooks (editingTaskIdRef, not editingTaskId state)
- **Use formatDateWithTimezone()** for consistent date display across locales
- **Animate cursor smoothly** - maintain 500ms ease-out timing for natural motion

### ❌ DON'T

- Use camelCase for database field names (use snake_case)
- Create unused imports or variables
- Use `any` type (use explicit types)
- Duplicate state between Zustand and Supabase
- Mock Supabase in tests (use real database)
- Add features beyond what was requested
- Change TypeScript config without asking
- **Use client-only logic in state initializers** (causes hydration mismatches)
- **Use toLocaleDateString() directly** (varies by browser locale - use formatDateWithTimezone)
- **Use state instead of refs** for values in throttle/batching functions
- **Change cursor animation timing** without testing smooth motion in multiple browsers

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

## Troubleshooting

### Hydration Mismatch Errors
**Symptom:** "Hydration failed because the server rendered text didn't match the client"
- **Cause**: `typeof window`, `sessionStorage`, `Math.random()`, or `Date.now()` in state initializers
- **Fix**: Move to `useEffect`. Initialize state with placeholder, update after mount
- **Example**: `const [userId, setUserId] = useState('placeholder'); useEffect(() => { setUserId(actual); }, [])`

### Cursor Disappears on Edit
**Symptom:** Cursor vanishes when opening edit dialog
- **Cause**: `setEditingTask` clears cursor without restoring position on close
- **Fix**: Use `lastCursorRef.current` to restore cursor position when exiting edit mode
- **Code**: In `setEditingTask`, set `cursor: lastCursorRef.current` when `taskId === null`

### Cursor Motion Too Jerky/Rough
**Symptom:** Cursor jumps instead of smoothly gliding
- **Cause**: `ease-linear` or `duration-300` too short, or UI throttle doesn't match network throttle
- **Fix**: Use `ease-out` + `duration-500` on cursor div, `100ms` network throttle in usePresence
- **Test**: Move cursor in one tab, watch smooth gliding in another tab

### Presence Updates Not Syncing
**Symptom:** Other users' cursors don't appear or are stale
- **Cause**: Presence channel not subscribing, or userId not unique per tab
- **Check**: 
  - BoardUserId stored and retrieved from sessionStorage correctly
  - `setupPresenceChannel(userId)` called with consistent userId
  - Supabase URL/key valid in `.env.local`
  - Open browser DevTools → Network tab → WebSocket should show wss connection

### Build Fails with TypeScript Errors
**Symptom:** `npm run build` fails with type errors
- **Fix**: Run `npm run lint` first to see all issues, then address one by one
- **Common**: Mismatched types (`string` vs `'todo' | 'in-progress' | 'done'`), unused variables, missing types
