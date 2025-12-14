#!/bin/bash

# Script to expose localhost to internet
# Supports multiple tunneling services

PORT=${1:-3000}  # Default to port 3000

echo "🚀 Exposing localhost:$PORT to internet..."
echo ""

# Check which tools are available
if command -v ngrok &> /dev/null; then
    echo "✅ Found ngrok"
    echo "Starting ngrok tunnel on port $PORT..."
    echo "Web interface will be available at http://127.0.0.1:4040"
    echo ""
    ngrok http $PORT
elif command -v cloudflared &> /dev/null; then
    echo "✅ Found cloudflared (Cloudflare Tunnel)"
    echo "Starting Cloudflare tunnel on port $PORT..."
    echo ""
    cloudflared tunnel --url http://localhost:$PORT
elif command -v lt &> /dev/null; then
    echo "✅ Found localtunnel"
    echo "Starting localtunnel on port $PORT..."
    echo ""
    lt --port $PORT
else
    echo "❌ No tunneling tool found!"
    echo ""
    echo "Please install one of the following:"
    echo ""
    echo "1. ngrok (recommended):"
    echo "   brew install ngrok/ngrok/ngrok"
    echo "   Sign up at https://ngrok.com"
    echo ""
    echo "2. cloudflared (Cloudflare Tunnel):"
    echo "   brew install cloudflare/cloudflare/cloudflared"
    echo ""
    echo "3. localtunnel:"
    echo "   npm install -g localtunnel"
    echo ""
    echo "See LOCALHOST_TUNNEL.md for detailed instructions."
    exit 1
fi
