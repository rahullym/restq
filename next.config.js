/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker
  output: 'standalone',
  // Server Actions are enabled by default in Next.js 14+
  experimental: {
    optimizePackageImports: ['@tanstack/react-query'],
  },
}

module.exports = nextConfig


