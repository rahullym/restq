/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server Actions are enabled by default in Next.js 14+
  // Suppress React key warnings during build (these are false positives from Next.js metadata)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Ensure error pages don't cause build failures
  experimental: {
    optimizePackageImports: ['@tanstack/react-query'],
  },
}

module.exports = nextConfig


