# Database Setup Summary

## Configuration: Same Database for Local & Production

You're using the **same Supabase database** for both local development and production deployment.

## Connection String

**Use this connection string for BOTH local `.env` and AWS Amplify:**

```env
DATABASE_URL="postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require"
```

## Quick Setup

### 1. Local Development (.env file)

Create or update `.env` in project root:
```env
DATABASE_URL="postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require"
NEXTAUTH_SECRET="your-local-secret-key-minimum-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2. AWS Amplify Production

1. Go to AWS Amplify Console → Your App
2. Navigate to **App settings** → **Environment variables**
3. Click **"Manage variables"**
4. Add/Update:
   - `DATABASE_URL`: `postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require`
   - `NEXTAUTH_SECRET`: (different from local, minimum 32 chars)
   - `NEXTAUTH_URL`: Your Amplify app URL (e.g., `https://main.d1234567890.amplifyapp.com`)
   - `NODE_ENV`: `production`

## Important Notes

✅ **Same Database**: Both environments use the same Supabase database
✅ **Same Connection String**: Use identical `DATABASE_URL` in both places
⚠️ **Different Secrets**: Use different `NEXTAUTH_SECRET` for local vs production
⚠️ **Different URLs**: `NEXTAUTH_URL` differs (localhost vs production domain)

## Testing Connection

```bash
# Test from local
npx prisma db pull

# Run migrations
npm run db:push

# Seed database (optional)
npm run db:seed
```

## Benefits of Same Database

- ✅ No data migration needed
- ✅ Test with real data locally
- ✅ Consistent schema across environments
- ✅ Easier debugging

## Considerations

⚠️ **Development Data**: Be careful not to delete production data when testing locally
⚠️ **Migrations**: Run migrations carefully as they affect both environments
⚠️ **Seeding**: Only seed if you want the same test data in both environments

