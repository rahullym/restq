# Render Deployment Fix

## Issue
Build failing with: `Cannot find module '../lightningcss.linux-x64-gnu.node'`

This is the same native binary issue we fixed for Amplify. Render needs the same fix.

## Solution

### Option 1: Update Render Build Command (Recommended)

In Render Dashboard → Your Service → Settings → Build Command, update to:

```bash
npm install --include=optional && npm rebuild lightningcss && npm rebuild @tailwindcss/oxide && npx prisma generate && npm run build
```

### Option 2: Use render.yaml (If using Render Blueprint)

The `render.yaml` file has been created with the correct build steps. If you're using Render Blueprint, it will automatically use this configuration.

### Option 3: Update package.json build script

Alternatively, you can update the build script in `package.json`:

```json
"build": "npm rebuild lightningcss && npm rebuild @tailwindcss/oxide && prisma generate && next build"
```

But this will slow down local builds, so Option 1 is preferred.

## Steps to Fix

1. **Go to Render Dashboard**
   - Navigate to your service
   - Click **Settings**

2. **Update Build Command**
   - Find **Build Command** field
   - Replace with:
     ```bash
     npm install --include=optional && npm rebuild lightningcss && npm rebuild @tailwindcss/oxide && npx prisma generate && npm run build
     ```

3. **Save and Redeploy**
   - Click **Save Changes**
   - Trigger a new deployment

## Why This Works

- `--include=optional` ensures platform-specific binaries are installed
- `npm rebuild lightningcss` rebuilds lightningcss with Linux binaries
- `npm rebuild @tailwindcss/oxide` rebuilds tailwindcss oxide with Linux binaries
- These steps ensure the native modules are available for the Linux build environment

## Verification

After deployment, the build should complete successfully without the `lightningcss` error.

