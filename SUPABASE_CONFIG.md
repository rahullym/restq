# Supabase Configuration

## Your Supabase Project

- **Project URL**: `https://yuiuvesktysmjiieakte.supabase.co`
- **Project Reference**: `yuiuvesktysmjiieakte`

## Environment Variables

### Already Configured:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yuiuvesktysmjiieakte.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_0CbOl0wUijzSXEsp3SAEjg_Hb-v0P5O
```

### Database Connection String

You need to get the **DATABASE_URL** from Supabase Dashboard:

1. Go to: https://yuiuvesktysmjiieakte.supabase.co
2. Navigate to: **Settings** → **Database**
3. Scroll to: **"Connection string"** section
4. Select: **"URI"** tab
5. Select: **"Direct connection"** (port 5432)
6. Copy the connection string

**Expected format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres
```

**With your password (Hard4soft@20225), it should be:**
```
postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require
```

## Quick Access Links

- **Dashboard**: https://yuiuvesktysmjiieakte.supabase.co
- **Database Settings**: https://yuiuvesktysmjiieakte.supabase.co/project/_/settings/database
- **SQL Editor**: https://yuiuvesktysmjiieakte.supabase.co/project/_/sql

## Steps to Fix Connection

1. **Verify Project Status**
   - Go to your Supabase dashboard
   - Check if project is active (not paused)

2. **Get Connection String**
   - Settings → Database → Connection string
   - Copy "Direct connection" URI

3. **Update .env File**
   ```env
   DATABASE_URL="[PASTE_CONNECTION_STRING_HERE]"
   ```

4. **Test Connection**
   ```bash
   npx prisma db pull
   ```

## If Connection Still Fails

1. **Check Project Status**: Make sure project is not paused
2. **Verify Password**: Confirm password in Supabase Dashboard
3. **Try Connection Pooler**: Use port 6543 instead of 5432
4. **Check Network**: Try from different network or disable VPN

## Connection Pooler Alternative

If direct connection fails, try the pooler:

1. In Supabase Dashboard → Settings → Database
2. Select **"Connection pooling"** tab
3. Copy **"Session mode"** connection string
4. Format: `postgresql://postgres.yuiuvesktysmjiieakte:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`

**Note**: Pooler cannot be used for migrations. Use direct connection for `prisma migrate`.
