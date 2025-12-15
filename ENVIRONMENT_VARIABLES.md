# Environment Variables Reference

This document lists all required and optional environment variables for RESq application.

## Required Environment Variables

### 1. `DATABASE_URL` (Required)
**Purpose**: PostgreSQL connection string for Supabase

**Format**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**How to get it**:
1. Go to Supabase Dashboard → Settings → Database
2. Scroll to "Connection string" section
3. Select **"Direct connection"** tab (port 5432)
4. Copy the URI connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password

**Example**:
```env
DATABASE_URL="postgresql://postgres:MySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

**Important Notes**:
- Use **Direct connection** (port 5432), not the pooler (port 6543)
- Make sure to replace `[YOUR-PASSWORD]` with your actual password
- For production, you may need to add `?sslmode=require`:
  ```
  postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
  ```

---

### 2. `NEXTAUTH_SECRET` (Required)
**Purpose**: Secret key for JWT signing and encryption

**How to generate**:
```bash
openssl rand -base64 32
```

**Or use online generator**: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

**Example**:
```env
NEXTAUTH_SECRET="aBc123XyZ789Def456Ghi012Jkl345Mno678Pqr901Stu234Vwx567"
```

**Important**: 
- Must be at least 32 characters
- Keep this secret - never commit to git
- Use different values for development and production

---

### 3. `NEXTAUTH_URL` (Required)
**Purpose**: The canonical URL of your application

**For Local Development**:
```env
NEXTAUTH_URL="http://localhost:3000"
```

**For Production (Render)**:
```env
NEXTAUTH_URL="https://your-app-name.onrender.com"
```

**Important**: 
- Must match your actual application URL exactly
- Include `http://` or `https://`
- No trailing slash

---

### 4. `NODE_ENV` (Required)
**Purpose**: Environment mode

**Values**:
- `development` - For local development
- `production` - For production deployment

**Example**:
```env
NODE_ENV="production"
```

---

## Optional Environment Variables

### 5. `NOTIFICATION_PROVIDER` (Optional)
**Purpose**: Notification service provider

**Default**: `mock`

**Example**:
```env
NOTIFICATION_PROVIDER="mock"
```

**Note**: Currently uses mock provider. Can be extended for real notifications (Twilio, SendGrid, etc.)

---

## Migration-Specific Variables

### 6. `OLD_DATABASE_URL` (Optional - Only for Migration)
**Purpose**: Connection string to your old/existing database (only needed when migrating data)

**When to use**: Only when running `npm run migrate:to-supabase`

**Example**:
```env
OLD_DATABASE_URL="postgresql://user:password@old-host:5432/old-database"
```

**Note**: Remove this after migration is complete

---

## Complete `.env` File Example

### For Local Development
```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:YourPassword123@db.xxxxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-key-here-minimum-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"

# Optional
NOTIFICATION_PROVIDER="mock"
```

### For Production (Render)
```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:YourPassword123@db.xxxxx.supabase.co:5432/postgres?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-production-secret-key-different-from-dev"
NEXTAUTH_URL="https://your-app-name.onrender.com"

# Environment
NODE_ENV="production"

# Optional
NOTIFICATION_PROVIDER="mock"
```

### For Migration (Temporary)
```env
# Old Database (temporary - remove after migration)
OLD_DATABASE_URL="postgresql://user:password@old-host:5432/old-database"

# New Database (Supabase)
DATABASE_URL="postgresql://postgres:YourPassword123@db.xxxxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

---

## Setting Environment Variables

### Local Development
Create a `.env` file in the project root:
```bash
# Copy example (if you have one)
cp .env.example .env

# Or create manually
touch .env
```

Then add all variables to `.env` file.

### Render (Production)
1. Go to Render Dashboard
2. Select your Web Service
3. Go to **Environment** tab
4. Click **"Add Environment Variable"**
5. Add each variable:
   - Key: `DATABASE_URL`
   - Value: Your Supabase connection string
   - Repeat for all required variables

### Vercel (Alternative)
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable for Production, Preview, and Development environments

---

## Security Best Practices

1. **Never commit `.env` file** - It should be in `.gitignore`
2. **Use different secrets** for development and production
3. **Rotate secrets regularly** - Especially `NEXTAUTH_SECRET`
4. **Use strong passwords** - For database and secrets
5. **Restrict database access** - Use Supabase's IP allowlist if needed
6. **Use SSL** - Always use `?sslmode=require` in production

---

## Verification

After setting environment variables:

1. **Test database connection**:
   ```bash
   npx prisma db pull
   ```

2. **Verify Prisma can connect**:
   ```bash
   npm run db:studio
   ```

3. **Check application starts**:
   ```bash
   npm run dev
   ```

---

## Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` format is correct
- Verify password is correct (no extra spaces)
- Ensure using Direct connection (port 5432)
- Check Supabase project is active (not paused)

### NextAuth Errors
- Verify `NEXTAUTH_SECRET` is set and at least 32 characters
- Check `NEXTAUTH_URL` matches your actual URL exactly
- Ensure no trailing slash in URL

### Environment Variable Not Found
- Check `.env` file exists in project root
- Verify variable name spelling (case-sensitive)
- Restart development server after changing `.env`

---

## Quick Checklist

- [ ] `DATABASE_URL` - Supabase connection string (Direct, port 5432)
- [ ] `NEXTAUTH_SECRET` - Generated secret (32+ characters)
- [ ] `NEXTAUTH_URL` - Your app URL (matches actual URL)
- [ ] `NODE_ENV` - Set to `development` or `production`
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] Production variables set in Render/Vercel dashboard
