# Exposing Localhost to Internet

This guide shows you how to expose your local development server to the internet for remote access.

## Option 1: ngrok (Recommended - Most Popular)

### Installation

1. **Install ngrok:**
   ```bash
   # Using Homebrew (macOS)
   brew install ngrok/ngrok/ngrok
   
   # Or download from: https://ngrok.com/download
   ```

2. **Sign up for free account:**
   - Go to https://ngrok.com/signup
   - Get your authtoken from the dashboard

3. **Authenticate:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### Usage

**For Next.js dev server (port 3000):**
```bash
ngrok http 3000
```

**For production build (port 3000):**
```bash
npm run build
npm start
# In another terminal:
ngrok http 3000
```

**With custom domain (paid plans):**
```bash
ngrok http 3000 --domain=your-domain.ngrok.io
```

### Features
- ✅ Free tier available
- ✅ HTTPS by default
- ✅ Web interface at http://127.0.0.1:4040
- ✅ Request inspection
- ✅ Custom domains (paid)

---

## Option 2: Cloudflare Tunnel (cloudflared) - Free, No Signup

### Installation

```bash
# Using Homebrew (macOS)
brew install cloudflare/cloudflare/cloudflared

# Or download from: https://github.com/cloudflare/cloudflared/releases
```

### Usage

**Quick start (no signup needed):**
```bash
cloudflared tunnel --url http://localhost:3000
```

**With custom domain (requires Cloudflare account):**
```bash
cloudflared tunnel --url http://localhost:3000 --hostname your-domain.com
```

### Features
- ✅ Completely free
- ✅ No signup required for basic use
- ✅ HTTPS by default
- ✅ Fast and reliable

---

## Option 3: localtunnel (npm package)

### Installation

```bash
npm install -g localtunnel
```

### Usage

```bash
# Expose port 3000
lt --port 3000

# With custom subdomain (if available)
lt --port 3000 --subdomain your-subdomain
```

### Features
- ✅ Free
- ✅ Easy npm install
- ✅ Custom subdomains (when available)

---

## Option 4: localhost.run (SSH-based, No Installation)

### Usage

```bash
# If you have SSH access, you can use:
ssh -R 80:localhost:3000 ssh.localhost.run
```

### Features
- ✅ No installation needed
- ✅ Uses SSH
- ✅ Free

---

## Quick Start Script

I've created a helper script (`expose-localhost.sh`) that you can use:

```bash
chmod +x expose-localhost.sh
./expose-localhost.sh
```

---

## Important Notes

1. **Security**: Only expose localhost when needed. Don't leave tunnels running unnecessarily.

2. **Environment Variables**: If your app uses `NEXTAUTH_URL` or similar, you may need to update it to the tunnel URL temporarily.

3. **Database**: Make sure your database allows connections from the tunnel IP (if applicable).

4. **CORS**: You may need to configure CORS settings if making API calls from remote locations.

5. **Port**: Default Next.js dev server runs on port 3000. Change if your app uses a different port.

---

## Recommended: ngrok

For most use cases, **ngrok** is the best choice because:
- Most reliable
- Great web interface for debugging
- Easy to use
- Good free tier
- Widely used and well-documented
