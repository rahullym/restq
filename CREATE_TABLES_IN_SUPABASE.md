# Create Tables in Supabase

## Step 1: Fix Database Connection

Before creating tables, you need a working database connection.

### Get Correct Connection String from Supabase

1. **Go to Supabase Dashboard**
   - https://yuiuvesktysmjiieakte.supabase.co
   - Log in

2. **Navigate to Database Settings**
   - Click **Settings** (gear icon) → **Database**
   - Or go directly: https://yuiuvesktysmjiieakte.supabase.co/project/_/settings/database

3. **Get Connection String**
   - Scroll to **"Connection string"** section
   - Click **"URI"** tab
   - Select **"Direct connection"** (port 5432)
   - Copy the connection string

4. **Update .env File**
   ```env
   DATABASE_URL="[PASTE_CONNECTION_STRING_HERE]"
   ```

## Step 2: Create Tables

Once the connection works, you have two options:

### Option A: Quick Setup (Recommended for First Time)

Use `prisma db push` to create tables directly from your schema:

```bash
# This will create all tables in Supabase
npm run db:push
```

**What this does:**
- Creates all tables from your Prisma schema
- Fast and simple
- Good for initial setup

### Option B: Using Migrations (Recommended for Production)

Create and run migrations:

```bash
# Create a new migration
npx prisma migrate dev --name init

# This will:
# 1. Create migration files
# 2. Apply migration to database
# 3. Generate Prisma Client
```

## Step 3: Verify Tables Created

### Check in Supabase Dashboard

1. Go to Supabase Dashboard
2. Click **Table Editor** in the left sidebar
3. You should see these tables:
   - ✅ `Restaurant`
   - ✅ `User`
   - ✅ `UserRestaurant`
   - ✅ `QueueEntry`
   - ✅ `TokenSequence`
   - ✅ `RateLimitEntry`
   - ✅ `_prisma_migrations` (if using migrations)

### Or Test with Prisma

```bash
# Test connection and see tables
npx prisma db pull
```

## Step 4: Seed Database (Optional)

After tables are created, you can seed with sample data:

```bash
npm run db:seed
```

This will create:
- Sample restaurants
- Admin users
- Test data

## Troubleshooting

### Error: "Can't reach database server"

**Solution:**
1. Verify connection string is correct
2. Check if Supabase project is active (not paused)
3. Try connection pooler as alternative

### Error: "Authentication failed"

**Solution:**
1. Verify password is correct
2. Make sure password is URL-encoded (e.g., `@` → `%40`)
3. Check username is `postgres`

### Error: "SSL required"

**Solution:**
Add `?sslmode=require` to connection string:
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

## Quick Commands Summary

```bash
# 1. Test connection
npx prisma db pull

# 2. Create tables (quick method)
npm run db:push

# OR create tables (migration method)
npx prisma migrate dev --name init

# 3. Generate Prisma Client
npx prisma generate

# 4. Seed database (optional)
npm run db:seed

# 5. Open Prisma Studio (view data)
npm run db:studio
```

## Tables That Will Be Created

Based on your schema, these tables will be created:

1. **Restaurant** - Restaurant information
2. **User** - Admin users
3. **UserRestaurant** - User-restaurant relationships
4. **QueueEntry** - Queue entries (waiting list)
5. **TokenSequence** - Token number generation
6. **RateLimitEntry** - Rate limiting data

## After Tables Are Created

1. ✅ Your application will work with database
2. ✅ You can create restaurants via admin panel
3. ✅ Users can join queue
4. ✅ Admin can manage queue

## Need Help?

If connection still fails:
1. Check Supabase project status (not paused)
2. Verify connection string format
3. Try connection pooler (port 6543)
4. Check network/firewall settings
