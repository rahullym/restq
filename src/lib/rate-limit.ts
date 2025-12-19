import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'

/**
 * RATE LIMITING SYSTEM
 * 
 * Protects against abuse on public QR code endpoints.
 * 
 * Strategy:
 * - Uses database for rate limiting (works across multiple instances)
 * - Falls back to in-memory if database unavailable
 * - Tracks by IP address and mobile number
 * - Sliding window approach
 * 
 * Rate Limits:
 * - Max 3 queue entries per mobile number per hour
 * - Max 20 requests per IP per minute
 * - Max 100 requests per IP per hour
 */

interface RateLimitConfig {
  identifier: string // IP or mobile number
  type: 'ip' | 'mobile'
  restaurantId?: string
  maxRequests: number
  windowMinutes: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

// In-memory fallback for rate limiting (if DB unavailable)
const memoryStore = new Map<string, { count: number; resetAt: Date }>()

/**
 * Checks rate limit using database (primary) or memory (fallback)
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowMinutes * 60 * 1000)
  const resetAt = new Date(now.getTime() + config.windowMinutes * 60 * 1000)

  try {
    // Try database first (works across instances)
    return await checkRateLimitDatabase(config, windowStart, resetAt)
  } catch (error) {
    // Fallback to in-memory if database fails
    console.warn('Rate limit database check failed, using memory fallback:', error)
    return checkRateLimitMemory(config, resetAt)
  }
}

/**
 * Database-backed rate limiting (works across multiple instances)
 */
async function checkRateLimitDatabase(
  config: RateLimitConfig,
  windowStart: Date,
  resetAt: Date
): Promise<RateLimitResult> {
  // Clean up old entries (async, don't wait)
  prisma.rateLimitEntry
    .deleteMany({
      where: {
        windowStart: {
          lt: windowStart,
        },
      },
    })
    .catch((err) => console.error('Rate limit cleanup failed:', err))

  // Find existing entry in current window
  const existing = await prisma.rateLimitEntry.findFirst({
    where: {
      identifier: config.identifier,
      type: config.type,
      restaurantId: config.restaurantId || null,
      windowStart: {
        gte: windowStart,
      },
    },
  })

  let entry
  if (existing) {
    // Increment existing entry
    entry = await prisma.rateLimitEntry.update({
      where: { id: existing.id },
      data: {
        count: {
          increment: 1,
        },
      },
    })
  } else {
    // Create new entry
    entry = await prisma.rateLimitEntry.create({
      data: {
        identifier: config.identifier,
        type: config.type,
        restaurantId: config.restaurantId || null,
        count: 1,
        windowStart,
      },
    })
  }

  // Check if limit exceeded
  const allowed = entry.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)

  return {
    allowed,
    remaining,
    resetAt,
  }
}

/**
 * In-memory rate limiting (fallback when DB unavailable)
 * 
 * Tradeoffs:
 * - Fast (no DB roundtrip)
 * - Doesn't work across instances (each server has own counter)
 * - Lost on server restart
 * - Good for single-instance deployments or as fallback
 */
function checkRateLimitMemory(
  config: RateLimitConfig,
  resetAt: Date
): RateLimitResult {
  const key = `${config.type}:${config.identifier}:${config.restaurantId || 'global'}`

  const existing = memoryStore.get(key)

  if (!existing || existing.resetAt < new Date()) {
    // New window or expired
    memoryStore.set(key, {
      count: 1,
      resetAt,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    }
  }

  // Increment count
  existing.count++

  const allowed = existing.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - existing.count)

  return {
    allowed,
    remaining,
    resetAt: existing.resetAt,
  }
}

/**
 * Middleware to check rate limits for queue creation
 */
export async function checkQueueCreationRateLimit(
  request: NextRequest,
  mobileNumber: string,
  restaurantId?: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'

  // Check IP rate limit: 20 requests per minute
  const ipLimit = await checkRateLimit({
    identifier: ip,
    type: 'ip',
    restaurantId,
    maxRequests: 20,
    windowMinutes: 1,
  })

  if (!ipLimit.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': ipLimit.resetAt.toISOString(),
            'Retry-After': Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      ),
    }
  }

  // Check mobile number rate limit: 3 entries per hour
  const mobileLimit = await checkRateLimit({
    identifier: mobileNumber,
    type: 'mobile',
    restaurantId,
    maxRequests: 3,
    windowMinutes: 60,
  })

  if (!mobileLimit.allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Maximum queue entries reached for this phone number. Please wait before joining again.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': mobileLimit.resetAt.toISOString(),
            'Retry-After': Math.ceil((mobileLimit.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        }
      ),
    }
  }

  return { allowed: true }
}



