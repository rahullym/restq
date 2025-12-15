# Deploying RESq to AWS Amplify

This guide will walk you through deploying your RESq application to AWS Amplify.

## Prerequisites

- An AWS account
- A GitHub account
- Your code pushed to a GitHub repository
- A Supabase account (for database)

## Step 1: Prepare Your Repository

1. Make sure your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Add Amplify deployment configuration"
   git push origin main
   ```

2. Ensure your `.env` file is in `.gitignore` (it should be already)

3. Verify that `amplify.yml` is in your repository root

## Step 2: Set Up Supabase Database

**We're using Supabase instead of AWS RDS for better free tier limits.**

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions)
3. Get your connection string from Supabase Dashboard → Settings → Database
4. **Important**: Use the **Direct connection** (port 5432) for Prisma
5. Copy the connection string - you'll need it in Step 4

**Quick Setup**:
- Project name: `resq` (or any name)
- Database password: Create a strong password (save it!)
- Region: Choose closest to your Amplify deployment region
- Plan: **Free** (500 MB database, 2 GB bandwidth)

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete Supabase setup guide.

## Step 3: Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app"** → **"Host web app"**
3. Choose **"GitHub"** as your source
4. Authorize AWS Amplify to access your GitHub account (if not already done)
5. Select your repository and branch (usually `main`)
6. Click **"Next"**

## Step 4: Configure Build Settings

Amplify should automatically detect `amplify.yml`. If not, you can manually configure:

### Build Settings

The `amplify.yml` file should contain:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - npm ci
        - echo "Generating Prisma client..."
        - npx prisma generate
    build:
      commands:
        - echo "Running database migrations..."
        - npx prisma migrate deploy
        - echo "Building Next.js application..."
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

**Note**: If Amplify doesn't detect the file automatically:
1. Click **"Edit"** in the build settings
2. Select **"Insert build specification"**
3. Paste the above YAML configuration

## Step 5: Configure Environment Variables

In the Amplify console, go to **"App settings"** → **"Environment variables"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `DATABASE_URL` | `[Supabase connection string]` | Use Direct connection (port 5432) |
| `NEXTAUTH_SECRET` | `[Generate a random string]` | See below |
| `NEXTAUTH_URL` | `https://[your-app-id].amplifyapp.com` | Will be set after first deployment |
| `NOTIFICATION_PROVIDER` | `mock` | Optional |

### Get Supabase Connection String

1. Go to Supabase Dashboard → Settings → Database
2. Under **"Connection string"**, select **"Direct connection"**
3. Copy the URI connection string
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
6. For production, add SSL: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require`

### Generate NEXTAUTH_SECRET

Run this command locally:
```bash
openssl rand -base64 32
```

Or use an online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

**Important**: 
- Use the **Direct connection** from Supabase (port 5432, not pooler port 6543)
- The `NEXTAUTH_URL` will be your Amplify app URL (e.g., `https://main.d1234567890.amplifyapp.com`)
- Make sure to replace `[YOUR-PASSWORD]` in the Supabase connection string
- Add `?sslmode=require` to the connection string for production

## Step 6: Deploy

1. Review your configuration
2. Click **"Save and deploy"**
3. Amplify will:
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Build your Next.js application
   - Deploy to a CDN

**First deployment takes ~5-10 minutes**

## Step 7: Update NEXTAUTH_URL

After the first deployment:

1. Go to **"App settings"** → **"Environment variables"**
2. Find your app URL in the Amplify console (e.g., `https://main.d1234567890.amplifyapp.com`)
3. Update `NEXTAUTH_URL` to match your exact Amplify URL
4. Click **"Save"**
5. Amplify will automatically redeploy

## Step 8: Access Your Application

1. Your app will be available at: `https://[your-app-id].amplifyapp.com`
2. You can find the exact URL in the Amplify console
3. Each branch gets its own URL (e.g., `https://main.d1234567890.amplifyapp.com`)

## Step 9: Seed the Database (Optional)

To seed initial data, you can use Amplify's build commands or run locally:

**Option 1: Add to amplify.yml (temporary)**
Add this to the build phase temporarily:
```yaml
build:
  commands:
    - npx prisma migrate deploy
    - npm run db:seed  # Add this temporarily
    - npm run build
```

**Option 2: Run locally**
Connect to your Supabase database and run:
```bash
npm run db:seed
```

This creates:
- Demo restaurant with slug `demo-restaurant`
- Admin user: `admin@example.com` / `Admin@123`

**Remember**: Remove the seed command from `amplify.yml` after seeding!

## Troubleshooting

### Build Fails

1. Check build logs in Amplify console → **"Build history"**
2. Ensure `DATABASE_URL` is set correctly
3. Verify Node.js version (Amplify uses Node 18+ by default)
4. Check that `amplify.yml` syntax is correct

### Database Connection Errors

- Use **Direct connection** from Supabase (port 5432, not pooler port 6543)
- Connection string format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require`
- Make sure password is correctly set in the connection string
- Verify Supabase project is active (not paused)
- Check Supabase Dashboard → Settings → Database for correct connection string
- Ensure SSL mode is set: `?sslmode=require`

### Prisma Client Not Generated

- The `amplify.yml` includes `npx prisma generate` in preBuild
- Check build logs to verify it's running
- Ensure Prisma schema is valid: `npx prisma validate`

### NextAuth Errors

- Verify `NEXTAUTH_SECRET` is set and at least 32 characters
- Check `NEXTAUTH_URL` matches your actual Amplify URL exactly
- Ensure no trailing slash in URL
- Check Amplify console logs for specific error messages

### Migration Errors

- Ensure `DATABASE_URL` is set before migrations run
- Check Supabase connection is working
- Verify migrations are in `prisma/migrations` directory
- Check build logs for specific Prisma errors

### Build Timeout

- Amplify free tier has build time limits
- Optimize build by caching `node_modules` (already configured)
- Consider upgrading if builds consistently timeout

## AWS Amplify Free Tier

- **5 GB storage** - Usually sufficient
- **15 GB data transfer/month** - Usually sufficient
- **1,000 build minutes/month** - Usually sufficient for small projects
- **Automatic HTTPS** - Included
- **Global CDN** - Included

## Supabase Free Tier Benefits

- **500 MB Database** - More than AWS RDS free tier
- **2 GB Bandwidth/month** - Usually sufficient
- **Unlimited API Requests** - No request limits
- **Daily Backups** - 7 days retention
- **Better Performance** - Optimized PostgreSQL

## Custom Domain (Optional)

1. Go to **"Domain management"** in Amplify console
2. Click **"Add domain"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` environment variable to your custom domain
6. Amplify will automatically provision SSL certificate

## Branch Deployments

Amplify automatically creates preview deployments for each branch:

- **Main branch**: Production URL (e.g., `https://main.d1234567890.amplifyapp.com`)
- **Other branches**: Preview URLs (e.g., `https://feature-branch.d1234567890.amplifyapp.com`)

Each branch can have its own environment variables:
1. Go to **"App settings"** → **"Environment variables"**
2. Select branch from dropdown
3. Add branch-specific variables

## Monitoring

- **Build logs**: Amplify console → **"Build history"**
- **App logs**: Amplify console → **"Monitoring"**
- **Metrics**: Amplify console → **"Monitoring"** → **"Metrics"**
- **Alerts**: Set up CloudWatch alarms for build failures

## CI/CD Features

Amplify automatically:
- Builds on every push to connected branches
- Runs tests (if configured)
- Deploys preview environments for pull requests
- Sends notifications on build status

## Upgrading to Paid Plan

If you need:
- More build minutes
- More data transfer
- Advanced features

Upgrade in AWS Console → Amplify → App settings → Billing

## Next Steps

1. Update admin password after first login
2. Create production restaurant entries
3. Set up custom domain (optional)
4. Configure email notifications (if needed)
5. Set up monitoring and alerts
6. Configure branch protection rules

## Support

- AWS Amplify Docs: [docs.aws.amazon.com/amplify](https://docs.aws.amazon.com/amplify)
- AWS Amplify Forum: [forums.aws.amazon.com/amplify](https://forums.aws.amazon.com/amplify)
- AWS Support: [aws.amazon.com/support](https://aws.amazon.com/support)

## Additional Resources

- [Next.js on Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)
- [Environment Variables in Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [Custom Build Settings](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
