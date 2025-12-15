# Migrating Database to Supabase

This guide will help you migrate your existing database to Supabase.

## Prerequisites

- Existing database with data (if you have data to migrate)
- Supabase account (create at [supabase.com](https://supabase.com))
- `pg_dump` and `psql` installed (for data migration) or use Prisma migrations

## Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `resq` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your deployment region
   - **Pricing Plan**: **Free** (500 MB database)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project creation

## Step 2: Get Supabase Connection String

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **"Connection string"** section
3. Select **"Direct connection"** tab (port 5432)
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

**Format:**
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## Step 3: Export Data from Current Database (If You Have Data)

### Option A: Using pg_dump (Recommended if you have existing data)

1. Export your current database:
   ```bash
   # Replace with your current DATABASE_URL
   pg_dump "postgresql://user:password@host:port/database" > backup.sql
   ```

2. Or export specific tables:
   ```bash
   pg_dump "postgresql://user:password@host:port/database" \
     -t "Restaurant" \
     -t "User" \
     -t "UserRestaurant" \
     -t "QueueEntry" \
     > backup.sql
   ```

### Option B: Using Prisma Studio (For small datasets)

1. Open Prisma Studio:
   ```bash
   npm run db:studio
   ```
2. Manually export data from each table (copy/paste or use export feature)

### Option C: Create Migration Script

See `scripts/migrate-to-supabase.ts` for an automated migration script.

## Step 4: Update Environment Variables

### For Local Development

Update your `.env` file:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

**Important**: Replace `[YOUR-PASSWORD]` with your actual Supabase password.

### For Production (AWS Amplify or Vercel)

1. Go to your deployment platform's environment variables settings
2. Update `DATABASE_URL` with your Supabase connection string
3. Use **Direct connection** (port 5432) for Prisma

## Step 5: Create Database Schema in Supabase

### Option A: Using Prisma Migrate (Recommended)

1. Update your `.env` with Supabase connection string
2. Create initial migration:
   ```bash
   npm run db:migrate
   ```
   Name it: `init_supabase`

3. Or push schema directly (for development):
   ```bash
   npm run db:push
   ```

### Option B: Using SQL Import

If you exported your schema with `pg_dump`, you can import it:

```bash
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" < backup.sql
```

## Step 6: Import Data to Supabase

### If You Exported Data (Step 3)

1. Import data:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" < backup.sql
   ```

2. Or use the migration script:
   ```bash
   npm run migrate:to-supabase
   ```

### If Starting Fresh

Just seed the database:

```bash
npm run db:seed
```

## Step 7: Verify Migration

1. Test connection:
   ```bash
   npx prisma db pull
   ```

2. Open Prisma Studio to verify data:
   ```bash
   npm run db:studio
   ```

3. Or check in Supabase Dashboard → **Table Editor**

## Step 8: Update Production Environment

1. **AWS Amplify**: Update `DATABASE_URL` in App settings → Environment variables
2. **Vercel**: Update `DATABASE_URL` in project settings
3. Redeploy your application

## Step 9: Run Migrations in Production

After deployment, run migrations:

```bash
# In your deployment platform's shell or production environment
npx prisma migrate deploy
```

## Troubleshooting

### Connection Issues

- **Use Direct Connection**: Port 5432, not pooler port 6543
- **Check Password**: Make sure password is correctly set in connection string
- **SSL Mode**: Add `?sslmode=require` if needed:
  ```
  postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
  ```

### Migration Errors

- **Foreign Key Constraints**: Make sure to import tables in correct order:
  1. `Restaurant`
  2. `User`
  3. `UserRestaurant`
  4. `QueueEntry`

- **Duplicate Data**: Use `ON CONFLICT` clauses or clear existing data first

### Prisma Issues

- **Client Not Generated**: Run `npx prisma generate`
- **Schema Out of Sync**: Run `npx prisma db pull` to sync

## Data Migration Order

If importing manually, follow this order:

1. `Restaurant` (no dependencies)
2. `User` (no dependencies)
3. `UserRestaurant` (depends on User and Restaurant)
4. `QueueEntry` (depends on Restaurant)

## Rollback Plan

If something goes wrong:

1. Keep your old database connection string
2. Update `.env` back to old database
3. Verify app still works
4. Fix issues and retry migration

## Next Steps

After successful migration:

1. ✅ Verify all data is migrated correctly
2. ✅ Test application functionality
3. ✅ Update production environment variables
4. ✅ Monitor application logs for connection issues
5. ✅ Consider backing up old database before decommissioning

## Additional Resources

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Amplify Deployment Guide](./AMPLIFY_DEPLOYMENT.md)
- [Supabase Documentation](https://supabase.com/docs)
