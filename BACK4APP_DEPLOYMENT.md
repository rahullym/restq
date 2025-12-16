# Back4App Deployment Guide

This guide will help you deploy your Next.js application to Back4App.

## Prerequisites

- Back4App account ([sign up here](https://www.back4app.com/))
- GitHub repository with your code
- Supabase database (or other PostgreSQL database)
- Environment variables ready

## Step 1: Prepare Your Repository

Your repository should include:
- ✅ `Dockerfile` (already created)
- ✅ `.dockerignore` (already created)
- ✅ `package.json` with build scripts
- ✅ `next.config.js` with standalone output enabled

## Step 2: Push Code to GitHub

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add Back4App deployment configuration"
git push origin amplify-deployment
```

## Step 3: Create Application on Back4App

1. **Log in to Back4App**
   - Go to [Back4App Dashboard](https://www.back4app.com/)
   - Sign in or create an account

2. **Create New Application**
   - Click **"New Application"**
   - Select **"Container as a Service"** (CaaS)
   - Choose **"Deploy from GitHub"**

3. **Connect GitHub Repository**
   - Authorize Back4App to access your GitHub account
   - Select your repository: `Lymdata-Labs-Private-Limited/Restaurants-queue-system`
   - Select branch: `amplify-deployment`

4. **Configure Application**
   - **Application Name**: `resq` (or your preferred name)
   - **Build Command**: (Leave default - Dockerfile handles this)
   - **Start Command**: (Leave default - Dockerfile handles this)
   - **Port**: `3000` (default)

## Step 4: Configure Environment Variables

In Back4App Dashboard → Your App → **Environment Variables**, add:

### Required Variables

```env
DATABASE_URL=postgresql://postgres.yuiuvesktysmjiieakte:hard4soft%402025@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=your-generated-secret-key-minimum-32-chars
NEXTAUTH_URL=https://your-app-name.back4app.io
NODE_ENV=production
```

### How to Get Values

1. **DATABASE_URL**: 
   - From Supabase Dashboard → Settings → Database
   - Copy "Direct connection" URI (port 5432)
   - Password: `hard4soft@2025` (URL-encoded as `hard4soft%402025`)

2. **NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

3. **NEXTAUTH_URL**:
   - Your Back4App app URL (e.g., `https://resq.back4app.io`)
   - Will be provided after deployment

## Step 5: Deploy

1. Click **"Create Application"** or **"Deploy"**
2. Back4App will:
   - Clone your repository
   - Build the Docker image
   - Deploy the container
3. Wait for deployment to complete (5-10 minutes)

## Step 6: Run Database Migrations

After deployment, run migrations:

1. **Option A: Using Back4App Console**
   - Go to your app → **Console**
   - Run:
     ```bash
     npx prisma migrate deploy
     ```

2. **Option B: Using Back4App Shell**
   - Go to your app → **Shell**
   - Run:
     ```bash
     npx prisma migrate deploy
     ```

3. **Seed Database (Optional)**
   ```bash
   npm run db:seed
   ```

## Step 7: Update NEXTAUTH_URL

After deployment, Back4App will provide your app URL. Update the `NEXTAUTH_URL` environment variable:

1. Go to Back4App Dashboard → Your App → Environment Variables
2. Update `NEXTAUTH_URL` to your actual app URL
3. Redeploy or restart the app

## Step 8: Verify Deployment

1. Visit your app URL (provided by Back4App)
2. Test the application:
   - Home page loads
   - Admin login works
   - Database connections work

## Troubleshooting

### Build Fails with lightningcss Error

The Dockerfile already handles this by:
- Installing optional dependencies
- Rebuilding native binaries
- Using multi-stage build

If issues persist, check:
- Docker build logs in Back4App
- Ensure `--include=optional` is used in npm install

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active (not paused)
3. Ensure password is URL-encoded correctly
4. Test connection from Back4App Shell:
   ```bash
   npx prisma db pull
   ```

### Application Not Starting

1. Check logs in Back4App Dashboard
2. Verify environment variables are set
3. Check if port 3000 is exposed
4. Ensure `NODE_ENV=production` is set

### Prisma Client Not Found

The Dockerfile generates Prisma Client during build. If issues occur:
1. Check build logs for Prisma generation
2. Verify `prisma/schema.prisma` is included in Docker image
3. Run `npx prisma generate` in Back4App Shell

## Dockerfile Details

The Dockerfile uses a multi-stage build:
1. **deps**: Installs dependencies and native binaries
2. **builder**: Builds the Next.js application
3. **runner**: Creates minimal production image

This ensures:
- Native binaries (lightningcss, tailwindcss-oxide) work on Linux
- Prisma Client is generated
- Small final image size
- Fast builds with caching

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection | `postgresql://...` |
| `NEXTAUTH_SECRET` | JWT signing secret | Generated with openssl |
| `NEXTAUTH_URL` | Your app URL | `https://app.back4app.io` |
| `NODE_ENV` | Environment | `production` |

## Post-Deployment Checklist

- [ ] Application deployed successfully
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Database seeded (optional)
- [ ] `NEXTAUTH_URL` updated to production URL
- [ ] Application accessible via Back4App URL
- [ ] Admin login works
- [ ] Database connections working

## Support

- [Back4App Documentation](https://www.back4app.com/docs)
- [Back4App Support](https://www.back4app.com/support)

## Next Steps

After successful deployment:
1. Set up custom domain (if needed)
2. Configure SSL certificate
3. Set up monitoring and alerts
4. Configure auto-scaling (if needed)
