# AWS Amplify Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [x] Code is committed and pushed to GitHub
- [x] `amplify.yml` is in repository root
- [x] `.env` file is in `.gitignore`
- [x] All dependencies are in `package.json`
- [x] Build passes locally (`npm run build`)

### 2. Database Setup (Supabase)
- [ ] Supabase account created
- [ ] New project created in Supabase
- [ ] Database password saved securely
- [ ] Connection string obtained (Direct connection, port 5432)
- [ ] Connection string tested locally

### 3. Environment Variables Prepared
- [ ] `DATABASE_URL` - Supabase connection string (with `?sslmode=require`)
- [ ] `NEXTAUTH_SECRET` - Generated (32+ characters)
- [ ] `NEXTAUTH_URL` - Will be set after first deployment
- [ ] `NODE_ENV` - Set to `production`
- [ ] `NOTIFICATION_PROVIDER` - Set to `mock` (optional)

---

## 🚀 Deployment Steps

### Step 1: Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app"** → **"Host web app"**
3. Choose **"GitHub"** as your source
4. Authorize AWS Amplify to access your GitHub account
5. Select your repository: `Lymdata-Labs-Private-Limited/Restaurants-queue-system`
6. Select branch: `amplify-deployment` (or `main` if you've merged)
7. Click **"Next"**

### Step 2: Configure Build Settings

1. Amplify should auto-detect `amplify.yml`
2. If not detected, click **"Edit"** and paste the build spec
3. Verify build settings:
   - **Build command**: Should use `amplify.yml`
   - **Node version**: 18.x or higher (auto-detected)

### Step 3: Set Up Service Role (CRITICAL for SSR)

1. During app creation, you'll see **"Service role"** section
2. Click **"Create new role"** or **"Edit"** if role exists
3. Amplify will auto-configure permissions
4. **IMPORTANT**: This role is required for Next.js SSR to work
5. Click **"Save"**

### Step 4: Configure Environment Variables

Go to **App settings** → **Environment variables** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require` | Replace `[PASSWORD]` with actual password |
| `NEXTAUTH_SECRET` | `[Generated secret]` | Use: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://[your-app-id].amplifyapp.com` | **Set after first deployment** |
| `NOTIFICATION_PROVIDER` | `mock` | Optional |

**Important Notes**:
- Use **Direct connection** from Supabase (port 5432, not 6543)
- Add `?sslmode=require` to `DATABASE_URL` for production
- `NEXTAUTH_URL` will be your Amplify app URL (e.g., `https://main.d1234567890.amplifyapp.com`)

### Step 5: Review and Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Wait for build to complete (~5-10 minutes)
4. Monitor build logs for any issues

### Step 6: Update NEXTAUTH_URL

After first successful deployment:

1. Go to **App settings** → **General**
2. Find your app URL (e.g., `https://main.d1234567890.amplifyapp.com`)
3. Go to **Environment variables**
4. Update `NEXTAUTH_URL` to match your exact Amplify URL
5. Click **"Save"** (will trigger redeploy)

### Step 7: Run Database Migrations

After deployment:

1. Go to **App settings** → **General** → **Console** (or use AWS CloudShell)
2. Or use Amplify's build console to run:
   ```bash
   npx prisma migrate deploy
   ```

**Alternative**: Migrations will run automatically during build if:
- `prisma/migrations` directory exists
- `DATABASE_URL` is set

### Step 8: Seed Database (Optional)

To create demo data:

1. Use Amplify console or CloudShell
2. Run:
   ```bash
   npm run db:seed
   ```

This creates:
- Demo restaurant with slug `demo-restaurant`
- Admin user: `admin@example.com` / `Admin@123`

**⚠️ Change admin password after first login!**

---

## 🔍 Post-Deployment Verification

### Check Build Logs

1. Go to **Build history** in Amplify console
2. Verify:
   - ✅ Dependencies installed successfully
   - ✅ lightningcss binaries found/installed
   - ✅ tailwindcss oxide binaries found/installed
   - ✅ Prisma Client generated
   - ✅ Next.js build completed
   - ✅ No errors

### Test Application

1. Visit your Amplify app URL
2. Test public queue page: `https://your-app.amplifyapp.com/demo-restaurant`
3. Test admin login: `https://your-app.amplifyapp.com/admin/login`
4. Verify:
   - ✅ Pages load correctly
   - ✅ Database connection works
   - ✅ Authentication works
   - ✅ Queue creation works

### Verify SSR is Working

1. Go to **App settings** → **General**
2. Check **"Compute"** section
3. Should show: **"SSR enabled"** or similar
4. If not, check Service Role is configured

---

## 🐛 Troubleshooting

### Build Fails with "Cannot find module lightningcss"

**Solution**: Already fixed in `amplify.yml` - should install Linux binaries automatically.

### Build Fails with "Cannot find module tailwindcss-oxide"

**Solution**: Already fixed in `amplify.yml` - should install Linux binaries automatically.

### Database Connection Errors

- Verify `DATABASE_URL` format is correct
- Check password is correct (no extra spaces)
- Ensure using Direct connection (port 5432)
- Add `?sslmode=require` for production
- Verify Supabase project is active (not paused)

### NextAuth Errors

- Verify `NEXTAUTH_SECRET` is set and 32+ characters
- Check `NEXTAUTH_URL` matches your Amplify URL exactly
- Ensure no trailing slash in URL
- Check build logs for specific errors

### SSR Not Working

- Verify Service Role is configured
- Check **App settings** → **General** → **Compute** shows SSR enabled
- Ensure `amplify.yml` artifacts point to `.next` directory
- Check build logs for framework detection

### Migration Errors

- Ensure `DATABASE_URL` is set before migrations run
- Check Supabase connection is working
- Verify migrations are in `prisma/migrations` directory
- Check build logs for specific Prisma errors

---

## 📋 Quick Reference

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Supabase Connection String Format
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Amplify App URL Format
```
https://main.d[random-id].amplifyapp.com
```

### Environment Variables Summary
- `DATABASE_URL` - Required (Supabase Direct connection)
- `NEXTAUTH_SECRET` - Required (32+ characters)
- `NEXTAUTH_URL` - Required (Your Amplify URL)
- `NODE_ENV` - Required (`production`)
- `NOTIFICATION_PROVIDER` - Optional (`mock`)

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Application is accessible at Amplify URL
- ✅ Public queue page loads
- ✅ Admin login works
- ✅ Database operations work (create queue entry)
- ✅ SSR is enabled (check App settings)
- ✅ No console errors in browser

---

## 📚 Additional Resources

- [AMPLIFY_DEPLOYMENT.md](./AMPLIFY_DEPLOYMENT.md) - Detailed deployment guide
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase setup guide
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Environment variables reference
- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)

---

## 🎯 Next Steps After Deployment

1. **Change admin password** from default `Admin@123`
2. **Create production restaurant** entries
3. **Set up custom domain** (optional)
4. **Configure monitoring** and alerts
5. **Set up backups** for Supabase database
6. **Review security settings**

---

**Ready to deploy?** Follow the steps above and monitor the build logs. Good luck! 🚀
