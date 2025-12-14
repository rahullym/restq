# Setting Up Supabase Database for RESq

This guide will help you set up a Supabase PostgreSQL database for your RESq application.

## Why Supabase?

- **Free Tier**: 500 MB database, 2 GB bandwidth, unlimited API requests
- **Easy Setup**: Simple dashboard and connection strings
- **Great Performance**: Fast PostgreSQL database
- **Additional Features**: Built-in auth, storage, and real-time subscriptions (not used in this project but available)

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

## Step 2: Create a New Project

1. In Supabase Dashboard, click **"New Project"**
2. Fill in the details:
   - **Name**: `resq` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your Render deployment region
   - **Pricing Plan**: **Free** (or Pro if you need more)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be created

## Step 3: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **"Connection string"** section
3. Select **"URI"** tab
4. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. **Important**: Replace `[YOUR-PASSWORD]` with the password you set in Step 2

### Connection String Format

The connection string should look like:
```
postgresql://postgres.xxxxx:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**For Prisma**, you might need to use the **Direct connection** (port 5432) instead of the pooler (port 6543):

1. In Supabase Dashboard → Settings → Database
2. Under **"Connection string"**, select **"Direct connection"**
3. Copy the URI connection string
4. It should use port `5432` instead of `6543`

## Step 4: Configure Prisma for Supabase

Your Prisma schema should work with Supabase as-is. However, you may need to add connection pooling parameters:

### Option 1: Direct Connection (Recommended for Prisma)

Use the direct connection string (port 5432):
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Option 2: Connection Pooling

If using Supabase's connection pooler (port 6543), add `?pgbouncer=true`:
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Note**: Prisma works better with direct connections. Use the pooler only if you have connection limit issues.

## Step 5: Set Up Environment Variables

### For Local Development

Update your `.env` file:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### For Render Deployment

1. Go to Render Dashboard → Your Web Service → Environment
2. Add `DATABASE_URL` with your Supabase connection string
3. Make sure to use the **direct connection** (port 5432) for Prisma

## Step 6: Test Connection Locally

1. Update your `.env` file with the Supabase connection string
2. Test the connection:
   ```bash
   npx prisma db pull
   ```
   This should connect successfully

3. Push your schema:
   ```bash
   npm run db:push
   ```

4. Seed the database:
   ```bash
   npm run db:seed
   ```

## Step 7: Run Migrations on Supabase

After deploying to Render:

1. Go to Render Dashboard → Your Web Service → **Shell**
2. Run:
   ```bash
   npx prisma migrate deploy
   ```
3. This will create all tables in your Supabase database

## Step 8: Verify Database Setup

1. In Supabase Dashboard, go to **Table Editor**
2. You should see tables:
   - `Restaurant`
   - `User`
   - `UserRestaurant`
   - `QueueEntry`
   - `_prisma_migrations`

## Supabase Free Tier Limits

- **Database Size**: 500 MB
- **Bandwidth**: 2 GB/month
- **API Requests**: Unlimited
- **Database Connections**: 60 direct connections, 200 pooler connections
- **Backups**: Daily backups (7 days retention)

## Security Best Practices

1. **Never commit** your database password or connection string
2. Use **environment variables** for all sensitive data
3. Enable **Row Level Security (RLS)** if needed (not required for this app)
4. Regularly rotate your database password

## Connection String Examples

### Direct Connection (Recommended)
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Connection Pooler
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### With SSL (Production)
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

## Troubleshooting

### Connection Timeout

- Check if your IP is allowed (Supabase allows all IPs by default)
- Verify the connection string is correct
- Try using direct connection instead of pooler

### Authentication Failed

- Verify the password is correct
- Make sure you replaced `[YOUR-PASSWORD]` in the connection string
- Check if the project is active (not paused)

### SSL Required

- Add `?sslmode=require` to your connection string
- Supabase requires SSL for external connections

### Prisma Migration Issues

- Use direct connection (port 5432) for migrations
- Don't use `pgbouncer=true` for migrations
- Run migrations from Render Shell, not locally

## Upgrading Supabase Plan

If you need more resources:

1. Go to Supabase Dashboard → Settings → Billing
2. Upgrade to **Pro** plan ($25/month):
   - 8 GB database
   - 50 GB bandwidth
   - Daily backups (30 days retention)
   - More connection limits

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase PostgreSQL Guide](https://supabase.com/docs/guides/database)
- [Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres)

## Next Steps

After setting up Supabase:

1. Update Render environment variables with Supabase connection string
2. Deploy your application to Render
3. Run migrations: `npx prisma migrate deploy`
4. Seed database: `npm run db:seed`
5. Test your application

Your RESq application is now ready to use Supabase as the database!
