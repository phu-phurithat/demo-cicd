# Collaborative Todo App - Improvement Plan

**Last Updated:** March 14, 2026  
**Current Version:** v0.1.0 (MVP with real-time collaboration)  
**Status:** ✅ Hydration fixed, cursor smooth, editing indicators working

---

## Executive Summary

The collaborative todo app has solid real-time TCP/IP collaboration features in place (cursor tracking, task editing, live sync). The roadmap below outlines the next 4 phases to move from MVP to production-ready collaborative platform.

**Estimated Timeline:** 
- Phase 1-2: 2-3 weeks
- Phase 3-4: 2-3 weeks each

---

## 🔴 Phase 1: Foundation (HIGH PRIORITY)

### 1.1 User Authentication & Authorization
**Why:** Currently all users are anonymous with random names. Can't track ownership, permissions, or audit trails.

**What:**
- Integrate Supabase Auth (email/password + Google OAuth)
- Replace random `userId` with Supabase `auth.uid`
- Populate User model with real user data (`id`, `name`, `email`, `avatar_url`)
- Protect API routes with session token validation
- Update presence system to use authenticated user IDs

**Impact:**
- Unlock assignee management
- Enable permission control (read-only vs edit)
- Foundation for audit logging

**Effort:** ~3 days
**Files:** `auth/`, `middleware.ts`, `lib/supabase.ts`, API routes

**Implementation Checklist:**
- [ ] Add Supabase Auth from @supabase/auth-js
- [ ] Create auth context/provider
- [ ] Add login/signup pages
- [ ] Protect Board with requireAuth middleware
- [ ] Migrate userId references to auth.uid
- [ ] Update Presence to use real user emails

---

### 1.2 Assignee Management
**Why:** `assignee_id` field exists but is never used. Can't track who owns which task.

**What:**
- Add assignee picker to CreateTodoDialog and EditTodoDialog
- Display assignee avatar/name on TodoCard
- Add filter by assignee in Board
- Show assignee count in status cards
- Create assignee dropdown component

**Impact:**
- Team collaboration visibility
- Task ownership clarity
- Delegation workflow

**Effort:** ~2 days
**Files:** `components/AssigneeSelect.tsx`, `components/TodoCard.tsx`, `components/Board.tsx`, `/app/api/todos/route.ts`

**Implementation Checklist:**
- [ ] Create AssigneeSelect dropdown component
- [ ] Add assignee field to CreateTodoDialog/EditTodoDialog
- [ ] Render assignee on TodoCard with avatar
- [ ] Add assignee filter to Board.tsx
- [ ] Update API to support assignee_id queries
- [ ] Show assignee count in status cards

---

### 1.3 Search & Filtering UI
**Why:** Zustand store already has filter logic (`filters` state). UI buttons don't exist.

**What:**
- Add search input (title search, debounced)
- Add filter buttons:
  - By priority (High / Medium / Low)
  - By assignee (@user dropdowns)
  - By status (already in columns, but add toggle)
  - By date range (due date picker)
- Show active filters as badges
- Clear all filters button

**Impact:**
- Find tasks quickly
- Reduce scroll fatigue on large lists
- Better UX for power users

**Effort:** ~1.5 days
**Files:** `components/Board.tsx`, `lib/store.ts`

**Implementation Checklist:**
- [ ] Add search input to header
- [ ] Implement title search with debounce (300ms)
- [ ] Add FilterBar component with dropdowns
- [ ] Display active filters as removable badges
- [ ] Wire filters to Zustand store
- [ ] Test with 50+ todos

---

## 🟡 Phase 2: Quality & Performance (MEDIUM PRIORITY)

### 2.1 Testing Coverage
**Why:** `components/__tests__/` folder is empty. No unit/integration/E2E tests.

**What:**
- Unit tests for hooks: `useTodos`, `usePresence` (Vitest)
- Component tests: `Board`, `TodoCard`, `CreateTodoDialog` (@testing-library/react)
- API integration tests: `/app/api/todos/*` routes
- E2E tests for collaborative features (Playwright)

**Coverage Target:** 70%+ line/branch coverage

**Effort:** ~4 days
**Files:** `components/__tests__/**`, `hooks/__tests__/**`, `__tests__/e2e/**`

**Implementation Checklist:**
- [ ] Set up Vitest + React Testing Library
- [ ] Write 10+ unit tests for useTodos hook
- [ ] Write 10+ unit tests for usePresence hook
- [ ] Write 5+ component tests for Board/TodoCard
- [ ] Write 3+ E2E tests for multi-user scenarios
- [ ] Set up GitHub Actions to run tests on PR

---

### 2.2 Database Pagination
**Why:** API fetches all todos. Will break with 1000+ tasks.

**What:**
- Add cursor-based pagination to `GET /api/todos`
- Implement infinite scroll or "Load More" button
- Paginate by `created_at` and `id` (stable cursor)
- Support filters + pagination together

**Effort:** ~1.5 days
**Files:** `/app/api/todos/route.ts`, `hooks/useTodos.ts`, `components/Board.tsx`

**Implementation Checklist:**
- [ ] Add `cursor` and `limit` params to API
- [ ] Implement cursor-based query in Prisma
- [ ] Add hasMore flag to response
- [ ] Update useTodos to accumulate pages
- [ ] Add "Load More" button or infinite scroll
- [ ] Test with 5000+ todos

---

### 2.3 API Error Handling
**Why:** Currently returns generic 500 errors. Hard to debug.

**What:**
- Structured error responses: `{ error: string, code: string, details?: object }`
- Specific error codes: `NOT_FOUND`, `UNAUTHORIZED`, `VALIDATION_ERROR`, `CONFLICT`, `RATE_LIMIT`
- Client-side retry logic with exponential backoff (max 3 retries)
- Error boundary component in Board
- Toast notifications for errors

**Effort:** ~2 days
**Files:** `/app/api/todos/route.ts`, `hooks/useTodos.ts`, `components/ErrorBoundary.tsx`, `lib/errors.ts`

**Implementation Checklist:**
- [ ] Create error types and response format
- [ ] Update all API routes to use structured errors
- [ ] Add retry logic to fetch calls
- [ ] Create ErrorBoundary component
- [ ] Add toast/notification for errors
- [ ] Document error codes in README

---

### 2.4 Conflict Resolution
**Why:** Multiple users editing same todo → last-write-wins, data loss risk.

**What:**
- Add `updated_at` optimistic concurrency check on PATCH
- Detect conflicts when `updated_at` mismatch
- Show "This task was modified by [name] — refresh?" warning
- Refetch task data on manual refresh
- Merge strategies: keep-local vs keep-remote

**Effort:** ~1.5 days
**Files:** `/app/api/todos/route.ts`, `hooks/useTodos.ts`, `components/ConflictDialog.tsx`

**Implementation Checklist:**
- [ ] Add `updated_at` field check in PATCH handler
- [ ] Return 409 Conflict status on mismatch
- [ ] Create ConflictDialog component
- [ ] Let user choose: Keep Local / Keep Remote / Merge
- [ ] Add visual indicator on conflicted tasks
- [ ] Test with simultaneous edits

---

## 🟢 Phase 3: Richness & Collaboration (OPTIONAL)

### 3.1 Comments on Tasks
**Why:** Context switching to Slack/email for task discussion. In-app comments needed.

**What:**
- Add `Comment` model to Prisma (userId, taskId, content, created_at)
- Create comment input + thread in TodoCard
- Real-time comment sync via Supabase
- Mention support (@user)
- Thread indicator badge

**Effort:** ~2.5 days
**Files:** `components/CommentThread.tsx`, `components/CommentInput.tsx`, `/app/api/todos/[id]/comments/route.ts`

**Effort:** ~2.5 days

**Implementation Checklist:**
- [ ] Add Comment model to schema
- [ ] Create /api/todos/[id]/comments routes (CRUD)
- [ ] Build CommentThread component
- [ ] Add real-time sync for comments
- [ ] Implement @mentions parser
- [ ] Show comment count on TodoCard

---

### 3.2 Audit Log / Activity History
**Why:** No way to see who did what or when. Important for compliance.

**What:**
- Add `Activity` model (userId, type, taskId, before/after, timestamp)
- Log on create/update/delete
- Show activity panel: "Alex edited title: 'Fix bug' → 'Fix critical bug'"
- Filter activity by user/task/date
- Export audit log as CSV

**Effort:** ~2 days
**Files:** `components/ActivityPanel.tsx`, `/app/api/todos/[id]/activity/route.ts`, middleware

**Implementation Checklist:**
- [ ] Add Activity model to schema
- [ ] Create activity logger middleware
- [ ] Build ActivityPanel component
- [ ] Add /api/todos/[id]/activity endpoint
- [ ] Show change diffs (before/after)
- [ ] Add activity retention policy (90 days)

---

### 3.3 Recurring Tasks
**Why:** Many tasks repeat on schedule (daily standup, weekly review, etc.)

**What:**
- Add `recurrence` field to Todo (null, "daily", "weekly", "monthly")
- Add recurrence picker to CreateTodoDialog
- Auto-generate new task when current completes
- Show "Repeats: Every Monday" badge
- Bulk update recurring instances

**Effort:** ~2 days
**Files:** `components/RecurrenceSelect.tsx`, `lib/recurrence.ts`, `/app/api/todos/recur/route.ts`

**Implementation Checklist:**
- [ ] Add recurrence field to schema
- [ ] Create RecurrenceSelect component
- [ ] Build recurrence generator logic
- [ ] Add background job to create recurring tasks
- [ ] Show recurrence info on TodoCard
- [ ] Test with different frequencies

---

## 🟠 Phase 4: Polish & Mobile (LOWER PRIORITY)

### 4.1 Bulk Operations
**Why:** Power users need to manage multiple tasks at once.

**What:**
- Multi-select todos (checkbox or Cmd+Click)
- Bulk actions: status change, delete, assign, add tags
- "Select All" button
- Show selection count badge
- Undo bulk operations

**Effort:** ~1.5 days
**Files:** `components/Board.tsx`, `hooks/useBulkActions.ts`

**Implementation Checklist:**
- [ ] Add selection state to Zustand store
- [ ] Implement multi-select UI (checkboxes)
- [ ] Create bulk action menu
- [ ] Add batch API endpoints
- [ ] Implement undo for bulk operations
- [ ] Test with 100+ selections

---

### 4.2 PWA / Offline Support
**Why:** Mobile users need offline access, installable app.

**What:**
- Add `next-pwa` package
- Create service worker for offline caching
- Queue todo mutations while offline
- Sync when back online
- Add install prompt
- Show offline indicator

**Effort:** ~2 days
**Files:** `next.config.js`, `public/manifest.json`, `middleware.ts`

**Implementation Checklist:**
- [ ] Configure next-pwa
- [ ] Create manifest.json (app icons, metadata)
- [ ] Implement offline queue in Zustand
- [ ] Build sync logic for queued mutations
- [ ] Add "You're offline" banner
- [ ] Test on mobile browsers

---

### 4.3 Mobile Touch Optimization
**Why:** Drag-drop not touch-friendly. Buttons too small.

**What:**
- Use dnd-kit's touch sensors for drag-drop
- Increase touch target size (44px minimum)
- Optimize keyboard for mobile (date picker, priority)
- Improve modal size for mobile viewport
- Add swipe gestures (left = delete, right = mark done)

**Effort:** ~1.5 days
**Files:** `components/Board.tsx`, `components/TodoCard.tsx`, `components/CreateTodoDialog.tsx`

**Implementation Checklist:**
- [ ] Enable dnd-kit touch sensors
- [ ] Increase button sizes on mobile (<768px)
- [ ] Test date picker on iOS/Android
- [ ] Add swipe gesture detection
- [ ] Test modals on small screens
- [ ] Profile performance on 3G

---

## Dependency Matrix

```
Phase 1 → Phase 2 → Phase 3 & 4

Auth ──┐
       ├─→ Assignees ──┐
Search ┘               ├─→ Comments (needs @mentions)
                       ├─→ Audit Log (depends on Auth)
   ┌────────────────┐  │
   │ Error Handling │──┤─→ Conflict Resolution
   │ Pagination    │  │
   │ Testing       │──┘─→ Bulk Operations (optional)
                       │
                       ├─→ Recurring Tasks
                       │
                       └─→ PWA / Mobile
```

---

## Success Metrics

### Phase 1 (Foundation)
- ✅ User registration and login working
- ✅ Assignee management used in 50% of tasks
- ✅ Search finds tasks in <200ms
- ✅ 0 anonymous users (all authenticated)

### Phase 2 (Quality)
- ✅ 70%+ test coverage
- ✅ Handles 10,000 todos without slowdown
- ✅ Error rate < 0.1%
- ✅ Conflict resolution in <100ms

### Phase 3 (Richness)
- ✅ 30% of tasks have comments
- ✅ Audit log retention = 90 days
- ✅ 20% of tasks are recurring
- ✅ Activity export used weekly

### Phase 4 (Polish)
- ✅ Mobile traffic = 40% of total
- ✅ PWA install rate = 20% of mobile users
- ✅ Offline sync success rate = 99%
- ✅ Avg session duration +50%

---

## Risk Assessment

| Risk | Phase | Likelihood | Impact | Mitigation |
|------|-------|-----------|--------|-----------|
| Auth migration complexity | 1 | Medium | High | Start with email-only, add OAuth later |
| Pagination breaks existing queries | 2 | Low | High | Maintain support for `limit=999` fallback |
| Conflict resolution UX confusing | 2 | Medium | Medium | User testing before ship |
| Comments spam/abuse | 3 | Medium | Medium | Add comment moderation, rate limiting |
| Offline sync data loss | 4 | Low | High | Extensive testing, transaction logging |

---

## Resource Requirements

- **Backend Dev:** 1 person, ~8 weeks (Phases 1-2)
- **Frontend Dev:** 1 person, ~8 weeks (Phases 1-4)
- **QA/Testing:** 1 person, ~4 weeks (Phase 2 + ongoing)
- **Product:** 1 person, ~2 weeks (spec writing + feedback)

**Tools Needed:**
- Supabase Auth (free tier capable)
- GitHub Actions for CI/CD (free)
- Sentry for error tracking (~$50/mo)
- Playwright for E2E testing (free)

---

## Next Steps

1. **Immediate:** Implement Phase 1.1 (Auth) - unblocks everything else
2. **Week 2:** Implement Phase 1.2-1.3 (Assignees + Search)
3. **Week 3:** Code review + Phase 2 planning
4. **Ongoing:** Collect user feedback, adjust roadmap

---

## Notes for Future Developers

- **Keep cursor smooth:** 500ms ease-out + 100ms network throttle. Don't optimize this away.
- **Hydration-safe patterns:** All client-only logic in useEffect. Update CLAUDE.md if you discover new patterns.
- **Database scaling:** Pagination is NOT optional for production. Implement before 1000 todos.
- **Testing debt:** Phase 2 testing might feel slow but prevents Phase 3 regressions. Worth it.
- **Mobile-first thinking:** Optimize for small screens from day 1, not as an afterthought.

---

**Questions?** Reference this file. Not here? Update it and share with the team.
