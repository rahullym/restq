/**
 * STRUCTURED LOGGING FOR OBSERVABILITY
 * 
 * Provides structured logs for:
 * - Queue creation events
 * - Call next operations
 * - Status transitions
 * - Error tracking
 * 
 * Logs include:
 * - Timestamp
 * - Event type
 * - Context (restaurantId, entryId, etc.)
 * - Performance metrics (duration)
 * - Error details
 * 
 * Format: JSON for easy parsing by log aggregation tools
 */

interface LogContext {
  restaurantId?: string
  entryId?: string
  tokenNumber?: string
  mobileNumber?: string
  userId?: string
  [key: string]: any
}

interface LogEvent {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  event: string
  context: LogContext
  duration?: number // milliseconds
  error?: {
    message: string
    stack?: string
    code?: string
  }
}

/**
 * Logs a structured event
 */
function logEvent(level: 'info' | 'warn' | 'error', event: string, context: LogContext, duration?: number, error?: Error) {
  const logEntry: LogEvent = {
    timestamp: new Date().toISOString(),
    level,
    event,
    context,
    ...(duration !== undefined && { duration }),
    ...(error && {
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
    }),
  }

  // Output as JSON for structured logging
  const logString = JSON.stringify(logEntry)
  
  switch (level) {
    case 'error':
      console.error(logString)
      break
    case 'warn':
      console.warn(logString)
      break
    default:
      console.log(logString)
  }
}

/**
 * Log queue creation event
 */
export function logQueueCreation(
  context: {
    restaurantId: string
    entryId: string
    tokenNumber: string
    mobileNumber: string
    position: number
    duration: number
  }
) {
  logEvent('info', 'queue.created', {
    restaurantId: context.restaurantId,
    entryId: context.entryId,
    tokenNumber: context.tokenNumber,
    mobileNumber: context.mobileNumber,
    position: context.position,
  }, context.duration)
}

/**
 * Log call next operation
 */
export function logCallNext(
  context: {
    restaurantId: string
    entryId: string
    tokenNumber: string
    userId: string
    duration: number
  }
) {
  logEvent('info', 'queue.called', {
    restaurantId: context.restaurantId,
    entryId: context.entryId,
    tokenNumber: context.tokenNumber,
    userId: context.userId,
  }, context.duration)
}

/**
 * Log status transition
 */
export function logStatusTransition(
  context: {
    restaurantId: string
    entryId: string
    tokenNumber: string
    fromStatus: string
    toStatus: string
    userId?: string
  }
) {
  logEvent('info', 'queue.status_changed', {
    restaurantId: context.restaurantId,
    entryId: context.entryId,
    tokenNumber: context.tokenNumber,
    fromStatus: context.fromStatus,
    toStatus: context.toStatus,
    userId: context.userId,
  })
}

/**
 * Log rate limit hit
 */
export function logRateLimitHit(
  context: {
    identifier: string
    type: 'ip' | 'mobile'
    restaurantId?: string
  }
) {
  logEvent('warn', 'rate_limit.hit', {
    identifier: context.identifier,
    type: context.type,
    restaurantId: context.restaurantId,
  })
}

/**
 * Log error with context
 */
export function logError(
  event: string,
  error: Error,
  context: LogContext = {}
) {
  logEvent('error', event, context, undefined, error)
}

/**
 * Log idempotency key reuse
 */
export function logIdempotencyReuse(
  context: {
    idempotencyKey: string
    entryId: string
    restaurantId: string
  }
) {
  logEvent('info', 'queue.idempotency_reuse', {
    idempotencyKey: context.idempotencyKey,
    entryId: context.entryId,
    restaurantId: context.restaurantId,
  })
}

/**
 * Metrics tracking helpers
 * In production, these would send to a metrics service (Prometheus, DataDog, etc.)
 */

const metrics: {
  queueJoins: number
  callNexts: number
  errors: number
  rateLimitHits: number
} = {
  queueJoins: 0,
  callNexts: 0,
  errors: 0,
  rateLimitHits: 0,
}

export function incrementMetric(metric: keyof typeof metrics) {
  metrics[metric]++
  
  // In production, send to metrics service
  // Example: metricsClient.increment(`queue.${metric}`)
}

export function getMetrics() {
  return { ...metrics }
}
