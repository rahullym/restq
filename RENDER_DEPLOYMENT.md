# Deploying RESq to Render (Free Tier)

This guide will walk you through deploying your RESq application to Render's free tier.

## Prerequisites

- A GitHub account
- A Render account (sign up at [render.com](https://render.com))
- Your code pushed to a GitHub repository

## Step 1: Prepare Your Repository

1. Make sure your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. Ensure your `.env` file is in `.gitignore` (it should be already)

## Step 2: Set Up Supabase Database

**We're using Supabase instead of Render's PostgreSQL for better free tier limits.**

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions)
3. Get your connection string from Supabase Dashboard → Settings → Database
4. **Important**: Use the **Direct connection** (port 5432) for Prisma
5. Copy the connection string - you'll need it in Step 4

**Quick Setup**:
- Project name: `resq` (or any name)
- Database password: Create a strong password (save it!)
- Region: Choose closest to your Render deployment region
- Plan: **Free** (500 MB database, 2 GB bandwidth)

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete Supabase setup guide.

## Step 3: Deploy Web Service

### Option A: Using render.yaml (Recommended)

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will automatically detect `render.yaml`
4. Review the configuration and click **"Apply"**
5. **Note**: You'll need to manually add the `DATABASE_URL` environment variable with your Supabase connection string

### Option B: Manual Setup

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository and branch
4. Configure the service:
   - **Name**: `resq-web` (or any name)
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or `./` if needed)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free** (512 MB RAM, 0.1 CPU)

## Step 4: Configure Environment Variables

In your Web Service settings, go to **"Environment"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `DATABASE_URL` | `[Supabase connection string from Step 2]` | Use Direct connection (port 5432) |
| `NEXTAUTH_SECRET` | `[Generate a random string]` | See below |
| `NEXTAUTH_URL` | `https://your-app-name.onrender.com` | Replace with your actual Render URL |
| `NOTIFICATION_PROVIDER` | `mock` | Optional |

### Get Supabase Connection String

1. Go to Supabase Dashboard → Settings → Database
2. Under **"Connection string"**, select **"Direct connection"**
3. Copy the URI connection string
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### Generate NEXTAUTH_SECRET

Run this command locally:
```bash
openssl rand -base64 32
```

Or use an online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

**Important**: 
- Use the **Direct connection** from Supabase (port 5432, not pooler port 6543)
- The `NEXTAUTH_URL` should be your Render app URL (e.g., `https://resq-web.onrender.com`)
- Make sure to replace `[YOUR-PASSWORD]` in the Supabase connection string

## Step 5: Run Database Migrations

After the first deployment:

1. Go to your Web Service → **"Shell"** tab
2. Run:
   ```bash
   npx prisma migrate deploy
   ```
3. This will create all necessary tables

## Step 6: Seed the Database (Optional)

In the same Shell:

```bash
npm run db:seed
```

This creates:
- Demo restaurant with slug `demo-restaurant`
- Admin user: `admin@example.com` / `Admin@123`

## Step 7: Access Your Application

1. Your app will be available at: `https://your-app-name.onrender.com`
2. First deployment takes ~5-10 minutes
3. Free tier apps spin down after 15 minutes of inactivity (first request may take ~30 seconds)

## Step 8: Update NEXTAUTH_URL

After deployment, make sure `NEXTAUTH_URL` matches your actual Render URL:
- Go to Web Service → Environment
- Update `NEXTAUTH_URL` to your exact Render URL
- Save and redeploy

## Troubleshooting

### Build Fails

1. Check build logs in Render dashboard
2. Ensure `DATABASE_URL` is set correctly
3. Verify Node.js version (Render uses Node 18+ by default)

### Database Connection Errors

- Use **Direct connection** from Supabase (port 5432, not pooler port 6543)
- Connection string format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
- Make sure password is correctly set in the connection string
- Verify Supabase project is active (not paused)
- Check Supabase Dashboard → Settings → Database for correct connection string

### App Crashes on Start

1. Check logs in Render dashboard
2. Verify all environment variables are set
3. Ensure `NEXTAUTH_SECRET` is set
4. Check `NEXTAUTH_URL` matches your Render URL exactly

### Slow First Request

- Free tier apps spin down after inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to paid plan for always-on service

### Prisma Client Not Generated

- The `postinstall` script should handle this automatically
- If issues occur, add to build command: `npx prisma generate`

## Render Free Tier Limitations

- **512 MB RAM** - Should be sufficient for Next.js
- **0.1 CPU** - May cause slower builds
- **Spins down after 15 min inactivity** - First request after spin-down is slow
- **100 GB bandwidth/month** - Usually sufficient

## Supabase Free Tier Benefits

- **500 MB Database** - More than Render's 1 GB for most apps
- **2 GB Bandwidth/month** - Usually sufficient
- **Unlimited API Requests** - No request limits
- **Daily Backups** - 7 days retention
- **Better Performance** - Optimized PostgreSQL

## Upgrading to Paid Plan

If you need:
- Always-on service (no spin-down)
- More RAM/CPU
- Better performance

Upgrade in Render dashboard → Service → Settings → Change Plan

## Custom Domain (Optional)

1. Go to Web Service → Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

## Monitoring

- View logs: Web Service → Logs
- Monitor metrics: Web Service → Metrics
- Set up alerts: Settings → Alerts

## Next Steps

1. Update admin password after first login
2. Create production restaurant entries
3. Set up custom domain (optional)
4. Configure email notifications (if needed)

## Support

- Render Docs: [render.com/docs](https://render.com/docs)
- Render Community: [community.render.com](https://community.render.com)
- Render Status: [status.render.com](https://status.render.com)
