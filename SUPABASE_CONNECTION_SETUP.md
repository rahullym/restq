# Supabase Connection String Setup

## Your Connection String

You provided:
```
postgresql://postgres:Hard4soft@@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres
```

## ⚠️ Important: Password URL Encoding

If your password contains special characters like `@`, `#`, `%`, etc., they **must be URL-encoded** in the connection string.

### Your Password: `Hard4soft@20225`

The `@` symbol in the password needs to be encoded as `%40`.

## ✅ Correct Connection String Format

### Same Database for Local Development AND Production

Since you're using the same Supabase database for both environments, use this connection string for both:

```env
DATABASE_URL="postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require"
```

**Note**: 
- Password `Hard4soft@20225` is encoded as `Hard4soft%4020225`
- SSL mode (`?sslmode=require`) is required for Supabase connections
- Use the **same connection string** for both local `.env` and AWS Amplify environment variables

## Quick Setup Steps

### 1. Update Local .env File

Update your `.env` file with the correct connection string:

```bash
# Open .env file
nano .env
# or
code .env
```

Replace the `DATABASE_URL` line with:
```env
DATABASE_URL="postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require"
```

### 2. Test Connection

```bash
# Test connection
npx prisma db pull

# Or test with Prisma Studio
npm run db:studio
```

### 3. Run Migrations

```bash
# Push schema to database
npm run db:push

# Or run migrations
npx prisma migrate deploy
```

### 4. Seed Database (Optional)

```bash
npm run db:seed
```

## Common Special Characters in Passwords

If your password contains these characters, encode them as shown:

| Character | URL Encoding |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| ` ` (space) | `%20` |

## Troubleshooting Connection Issues

### 1. Connection Timeout / Can't Reach Server

**Possible causes:**
- IP address not allowed in Supabase
- Network/firewall blocking connection
- Database is paused

**Solutions:**
1. **Check Supabase Dashboard**:
   - Go to Settings → Database
   - Check if your IP is allowed (Supabase allows all IPs by default)
   - Verify the project is active (not paused)

2. **Try Connection Pooler** (port 6543):
   ```
   postgresql://postgres.xxxxx:Hard4soft%40@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
   ```

3. **Check Network**:
   ```bash
   # Test if you can reach the server
   ping db.yuiuvesktysmjiieakte.supabase.co
   
   # Test port connectivity
   telnet db.yuiuvesktysmjiieakte.supabase.co 5432
   ```

### 2. Authentication Failed

**Possible causes:**
- Wrong password
- Password not URL-encoded correctly
- Wrong username

**Solutions:**
1. **Verify password** in Supabase Dashboard:
   - Settings → Database → Database password
   - Make sure you're using the correct password

2. **Check URL encoding**:
   - Use the format: `Hard4soft%4020225` (not `Hard4soft@20225`)
   - Test encoding: `node -e "console.log(encodeURIComponent('Hard4soft@20225'))"`

3. **Verify username**:
   - Should be `postgres` (default Supabase username)

### 3. SSL Required Error

**Solution**: Add `?sslmode=require` to connection string:
```
postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require
```

### 4. Prisma Migration Issues

**For migrations**, use **Direct connection** (port 5432), not pooler:
```
postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require
```

**Don't use**:
- Connection pooler (port 6543) for migrations
- `pgbouncer=true` parameter for migrations

## Setting Up in AWS Amplify

1. Go to **AWS Amplify Console** → Your App
2. Navigate to **App settings** → **Environment variables**
3. Click **"Manage variables"**
4. Add/Update `DATABASE_URL`:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require`
   - **Note**: Use the **same connection string** as your local `.env` file
5. Save and redeploy

## Verification Checklist

- [ ] Password is URL-encoded correctly (`Hard4soft@20225` → `Hard4soft%4020225`)
- [ ] Connection string uses Direct connection (port 5432)
- [ ] Production connection includes `?sslmode=require`
- [ ] `.env` file updated locally
- [ ] AWS Amplify environment variables updated
- [ ] Connection test successful (`npx prisma db pull`)
- [ ] Migrations run successfully
- [ ] Database seeded (if needed)

## Quick Test Script

Create a test file to verify connection:

```bash
# Create test script
cat > test-connection.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Connection successful!');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
EOF

# Run test
DATABASE_URL="postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require" node test-connection.js
```

## Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit** `.env` file to git
2. **Never share** connection strings publicly
3. **Use different passwords** for development and production
4. **Rotate passwords** regularly
5. **Use SSL** in production (`?sslmode=require`)

## Need Help?

If connection still fails:

1. **Check Supabase Dashboard**:
   - Verify project is active
   - Check database password
   - Review connection settings

2. **Verify Connection String**:
   - Copy from Supabase Dashboard → Settings → Database
   - Make sure to replace `[YOUR-PASSWORD]` with actual password
   - URL-encode special characters

3. **Test from Supabase Dashboard**:
   - Use Supabase's built-in SQL Editor
   - If that works, the issue is with the connection string format

4. **Contact Support**:
   - Supabase support if database issue
   - Check network/firewall settings

---

**Your Corrected Connection Strings:**

**For Both Local Development AND Production (Same Database):**
```
postgresql://postgres:Hard4soft%4020225@db.yuiuvesktysmjiieakte.supabase.co:5432/postgres?sslmode=require
```

**Important**: Use the **exact same connection string** in both:
- Local `.env` file
- AWS Amplify environment variables
