# Quick Deployment Checklist for Render

## Pre-Deployment ✅

- [ ] Code is committed and pushed to GitHub
- [ ] `.env` file is in `.gitignore` (should be already)
- [ ] All tests pass locally

## Render Setup Steps

### 1. Supabase Database Setup
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project in Supabase
- [ ] Get **Direct connection** string (port 5432) from Settings → Database
- [ ] Replace `[YOUR-PASSWORD]` in connection string with actual password
- [ ] Test connection locally (optional but recommended)

### 2. Web Service Setup
- [ ] Create Web Service from GitHub repo
- [ ] Or use Blueprint with `render.yaml` (easier!)

### 3. Environment Variables
Set these in Render dashboard:

- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = `[Supabase Direct Connection String]` ⚠️ Use Direct connection (port 5432)
- [ ] `NEXTAUTH_SECRET` = `[Generate with: openssl rand -base64 32]`
- [ ] `NEXTAUTH_URL` = `https://your-app-name.onrender.com` ⚠️ Update after first deploy
- [ ] `NOTIFICATION_PROVIDER` = `mock` (optional)

### 4. Database Setup
After first deployment:

- [ ] Open Web Service → Shell
- [ ] Run: `npx prisma migrate deploy`
- [ ] Run: `npm run db:seed` (optional, creates demo data)

### 5. Final Steps
- [ ] Update `NEXTAUTH_URL` to match your actual Render URL
- [ ] Test the application
- [ ] Change admin password from default

## Quick Commands

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

## Important Notes

⚠️ **Use Supabase Direct Connection** - Use port 5432, not pooler port 6543
⚠️ **Replace Password in Connection String** - Make sure `[YOUR-PASSWORD]` is replaced
⚠️ **Update NEXTAUTH_URL** - Must match your exact Render URL
⚠️ **First deployment takes 5-10 minutes**
⚠️ **Free tier apps spin down** - First request after inactivity takes ~30 seconds
⚠️ **Supabase Setup** - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions

## Need Help?

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions.
