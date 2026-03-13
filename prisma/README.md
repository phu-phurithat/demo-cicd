# Prisma Setup Guide

This project now uses Prisma as the ORM for database operations.

## Prerequisites

- Node.js 18+ installed
- Database connection URL configured in `.env.local` as `POSTGRES_PRISMA_URL`

## Setup Steps

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

3. **Apply migrations**:
   ```bash
   npm run prisma:migrate
   ```

   Or to apply with a specific name:
   ```bash
   npx prisma migrate deploy
   ```

4. **View the database** (Local development):
   ```bash
   npm run prisma:studio
   ```

## Key Changes

### Architecture
- Prisma replaces direct Supabase client calls for data operations
- API routes handle all database mutations (`/app/api/todos/route.ts`)
- Realtime subscriptions still use Supabase Realtime for collaborative features

### Files Created
- `prisma/schema.prisma` - Database schema definition
- `lib/prisma.ts` - Prisma client singleton
- `app/api/todos/route.ts` - API routes for CRUD operations
- `prisma/migrations/0_init/migration.sql` - Initial database migration

### Environment Variables
Ensure your `.env.local` has:
```
POSTGRES_PRISMA_URL="your-database-url"
```

## API Routes

All database operations go through these endpoints:

- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos?id={id}` - Update a todo
- `DELETE /api/todos?id={id}` - Delete a todo

## Database Schema

### Todo
- `id` (String, UUID)
- `title` (String, required)
- `description` (String, optional)
- `priority` (String: high|medium|low)
- `status` (String: todo|in-progress|done)
- `assignee_id` (String, optional - UUID reference)
- `due_date` (DateTime, optional)
- `tags` (String array)
- `order` (Integer)
- `created_at` (DateTime, auto-set)
- `updated_at` (DateTime, auto-updated)

### User
- `id` (String, UUID)
- `name` (String)
- `email` (String, unique, optional)
- `color` (String, default: #7c3aed)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Presence
- `id` (String, UUID)
- `userId` (String)
- `cursor_x` (Int)
- `cursor_y` (Int)
- `online` (Boolean)
- `updated_at` (DateTime)

## Troubleshooting

### "Cannot connect to database"
- Check that `POSTGRES_PRISMA_URL` is set correctly in `.env.local`
- Verify database is accessible
- Run: `npm run prisma:generate`

### "PrismaClientKnownRequestError"
- Check API route logs for detailed error messages
- Verify database schema matches Prisma schema
- Ensure migrations are applied: `npx prisma migrate deploy`

## Development Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply a new migration
npm run prisma:migrate

# View database in UI
npm run prisma:studio

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Build the project
npm run build

# Start dev server
npm run dev
```

For more information, visit [Prisma Documentation](https://www.prisma.io/docs)
