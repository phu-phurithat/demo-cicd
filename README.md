# Collaborative Todo List

A real-time collaborative todo application built with Next.js, Supabase, and Kibo UI. Features real-time task synchronization and cursor tracking across multiple users.

## Features

- ✅ **Real-time Collaboration**: Todos sync instantly across all connected users via Supabase Realtime
- 👥 **Cursor Tracking**: See other users' cursor positions and names in real-time
- 🎨 **Trello-Style UI**: Clean Kanban board layout with three columns (To Do, In Progress, Done)
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔐 **Row-Level Security**: Supabase RLS policies protect user data
- ⚡ **Server Components**: Optimized with Vercel React best practices

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: Kibo UI (shadcn/ui) + Tailwind CSS v4
- **Backend**: Supabase PostgreSQL + Realtime
- **State**: Zustand + Supabase
- **Hosting**: Vercel + Supabase
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites
- Node.js 20+
- Supabase account (free at [supabase.com](https://supabase.com))

### 1. Setup

```bash
npm install
```

### 2. Create Supabase Project

1. Create free project at [supabase.com](https://supabase.com)
2. Copy project URL and anon key

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Setup Database

In Supabase SQL Editor, run:

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  assignee_id UUID,
  due_date TIMESTAMP,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  "order" INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users to view todos"
  ON todos FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage todos"
  ON todos FOR ALL USING (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE todos;
```

### 5. Run

```bash
npm run dev
```

Visit http://localhost:3000

## Scripts

```bash
npm run dev        # Development server
npm run build      # Build for production
npm run lint       # Lint with ESLint
npm run typecheck  # Type check
npm run test       # Run tests
```

## Deployment

### Vercel

1. Connect GitHub repo to Vercel
2. Add environment variables
3. Deploy

### GitHub Actions

Requires secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## License

MIT
