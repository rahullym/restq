# Quick Migration Guide: Moving to Supabase

## Fast Track (5 minutes)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Save your database password

### 2. Get Connection String
- Supabase Dashboard → Settings → Database
- Copy **Direct connection** (port 5432)
- Format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### 3. Update `.env`
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### 4. Create Schema
```bash
npm run db:push
```

### 5. Seed Data (Optional)
```bash
npm run db:seed
```

## If You Have Existing Data

### Option 1: Automated Script (Recommended)
1. Add to `.env`:
   ```env
   OLD_DATABASE_URL="postgresql://old-db-url"
   DATABASE_URL="postgresql://supabase-url"
   ```
2. Run migration:
   ```bash
   npm run migrate:to-supabase
   ```

### Option 2: Manual Export/Import
See [MIGRATE_TO_SUPABASE.md](./MIGRATE_TO_SUPABASE.md) for detailed instructions.

## Update Production

1. **Render**: Update `DATABASE_URL` in environment variables
2. **Vercel**: Update `DATABASE_URL` in project settings
3. Redeploy

## Verify

```bash
npm run db:studio
```

Check that all tables and data are present.

## Need Help?

- Full guide: [MIGRATE_TO_SUPABASE.md](./MIGRATE_TO_SUPABASE.md)
- Supabase setup: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
