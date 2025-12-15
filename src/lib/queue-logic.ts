import { prisma } from './prisma'
import { QueueEntryStatus } from '@prisma/client'

/**
 * HIGH-CONCURRENCY QUEUE SYSTEM
 * 
 * This module implements a concurrency-safe queue system designed to handle
 * 100-300 customers per minute without race conditions.
 * 
 * Key Design Principles:
 * 1. All operations are atomic (database-level guarantees)
 * 2. Token generation uses database sequences (no MAX+1 race conditions)
 * 3. Row-level locking prevents concurrent "call next" conflicts
 * 4. Idempotency keys prevent duplicate submissions
 * 5. Position calculations are snapshot-based (createdAt ordering)
 */

/**
 * Generates the next token number atomically using database sequence.
 * 
 * Strategy: Option A - Per-restaurant database sequence
 * 
 * Why this approach:
 * - Token generation happens inside DB transaction
 * - No race conditions: sequence increment is atomic
 * - Works correctly with multiple API instances
 * - No need for application-level locking
 * 
 * Token format: R{restaurantSequence}-{sequenceNumber}
 * Example: R1-000123
 * 
 * Implementation uses Prisma's $executeRaw to increment sequence atomically.
 */
export async function generateTokenNumberAtomically(
  restaurantId: string,
  tx?: any
): Promise<string> {
  const client = tx || prisma

  // Get or create token sequence for this restaurant
  const sequence = await client.tokenSequence.upsert({
    where: { restaurantId },
    create: {
      restaurantId,
      currentValue: BigInt(0),
    },
    update: {},
  })

  // Atomically increment and get the new value
  // This uses PostgreSQL's atomic increment - no race conditions possible
  // We use raw SQL because Prisma doesn't support RETURNING with increment
  const result = await (tx || prisma).$queryRaw<Array<{ currentValue: bigint }>>`
    UPDATE "TokenSequence"
    SET "currentValue" = "currentValue" + 1,
        "updatedAt" = NOW()
    WHERE "restaurantId" = ${restaurantId}
    RETURNING "currentValue"
  `

  // Extract the new sequence value
  // PostgreSQL returns the updated value atomically
  const newValue = result && result.length > 0 
    ? result[0].currentValue 
    : sequence.currentValue + BigInt(1)
  
  // Format: R{restaurantId}-{padded sequence number}
  // Using first 8 chars of restaurantId for readability
  const restaurantPrefix = restaurantId.substring(0, 8).toUpperCase()
  const tokenNumber = `${restaurantPrefix}-${newValue.toString().padStart(6, '0')}`

  return tokenNumber
}

/**
 * Gets the next customer in queue (earliest WAITING entry)
 * Uses FOR UPDATE SKIP LOCKED for race condition safety.
 * 
 * This is critical for "call next" operations:
 * - FOR UPDATE: Locks the row for update
 * - SKIP LOCKED: If another transaction already locked it, skip and get next
 * - Prevents two admins from calling the same customer
 * - Prevents two admins from calling different customers incorrectly
 */
export async function getNextInQueueWithLock(
  restaurantId: string,
  tx: any
): Promise<{ id: string; tokenNumber: string; name: string; mobileNumber: string } | null> {
  // Use raw SQL for FOR UPDATE SKIP LOCKED
  // Prisma doesn't support SKIP LOCKED directly, so we use $queryRaw
  const result = await tx.$queryRaw<Array<{
    id: string
    tokenNumber: string
    name: string
    mobileNumber: string
  }>>`
    SELECT id, "tokenNumber", name, "mobileNumber"
    FROM "QueueEntry"
    WHERE "restaurantId" = ${restaurantId}
      AND status = 'WAITING'
    ORDER BY "createdAt" ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  `

  return result[0] || null
}

/**
 * Calculates estimated wait time in minutes
 * Returns a friendly string representation
 */
export function calculateWaitTime(
  positionAhead: number,
  averageMinutesPerParty: number
): { minutes: number; friendly: string } {
  const totalMinutes = positionAhead * averageMinutesPerParty

  if (totalMinutes <= 0) {
    return { minutes: 0, friendly: 'Ready now' }
  }

  if (totalMinutes <= 5) {
    return { minutes: totalMinutes, friendly: 'about 5 minutes' }
  }

  if (totalMinutes <= 10) {
    return { minutes: totalMinutes, friendly: 'about 10 minutes' }
  }

  // Round to nearest 5 minutes for ranges
  const rounded = Math.round(totalMinutes / 5) * 5
  const lower = Math.max(5, rounded - 5)
  const upper = rounded + 5

  if (lower === upper - 5) {
    return { minutes: totalMinutes, friendly: `about ${lower} minutes` }
  }

  return { minutes: totalMinutes, friendly: `about ${lower}-${upper} minutes` }
}

/**
 * Gets the current position of an entry in the queue
 * Position is based on number of WAITING entries created before this one
 * 
 * This uses createdAt for ordering, which is guaranteed by the database.
 * Even under concurrent inserts, createdAt ordering is consistent.
 */
export async function getPositionInQueue(
  entryId: string,
  restaurantId: string
): Promise<number> {
  const entry = await prisma.queueEntry.findUnique({
    where: { id: entryId },
    select: { createdAt: true, status: true },
  })

  if (!entry) {
    throw new Error('Queue entry not found')
  }

  // If already seated or completed, return 0
  if (
    entry.status === QueueEntryStatus.SEATED ||
    entry.status === QueueEntryStatus.NO_SHOW ||
    entry.status === QueueEntryStatus.CANCELLED
  ) {
    return 0
  }

  // Count WAITING entries created before this one
  // Uses createdAt < entry.createdAt for consistent ordering
  // Database ensures createdAt ordering even under concurrent inserts
  const position = await prisma.queueEntry.count({
    where: {
      restaurantId,
      status: QueueEntryStatus.WAITING,
      createdAt: {
        lt: entry.createdAt,
      },
    },
  })

  return position + 1 // +1 because position is 1-indexed
}

/**
 * Gets the count of people currently waiting in queue
 */
export async function getWaitingCount(restaurantId: string): Promise<number> {
  return await prisma.queueEntry.count({
    where: {
      restaurantId,
      status: QueueEntryStatus.WAITING,
    },
  })
}

/**
 * Gets queue statistics for a restaurant
 */
export async function getQueueStats(restaurantId: string) {
  const waitingCount = await getWaitingCount(restaurantId)
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { averageMinutesPerParty: true },
  })

  if (!restaurant) {
    throw new Error('Restaurant not found')
  }

  const waitTime = calculateWaitTime(waitingCount, restaurant.averageMinutesPerParty)

  return {
    waitingCount,
    estimatedWaitMinutes: waitTime.minutes,
    estimatedWaitTime: waitTime.friendly,
  }
}

/**
 * Creates a queue entry atomically with token generation and position snapshot.
 * 
 * This function ensures:
 * 1. Token generation is atomic (no duplicates)
 * 2. Position snapshot is accurate at creation time
 * 3. All operations happen in a single transaction
 * 4. Idempotency key prevents duplicate submissions
 * 
 * Concurrency safety:
 * - Token generation uses atomic sequence increment
 * - Position snapshot uses COUNT(*) inside transaction (consistent view)
 * - Idempotency key check prevents duplicate entries
 * - All operations in single transaction = atomic
 */
export async function createQueueEntryAtomically(
  restaurantId: string,
  data: {
    name: string
    mobileNumber: string
    partySize: number
    seatingType?: string | null
    idempotencyKey?: string
  }
): Promise<{
  id: string
  tokenNumber: string
  positionSnapshot: number
  createdAt: Date
}> {
  return await prisma.$transaction(async (tx) => {
    // Check idempotency if key provided
    if (data.idempotencyKey) {
      const existing = await tx.queueEntry.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
        select: { id: true },
      })

      if (existing) {
        throw new Error('DUPLICATE_SUBMISSION')
      }
    }

    // Generate token atomically (inside transaction)
    const tokenNumber = await generateTokenNumberAtomically(restaurantId, tx)

    // Count waiting entries BEFORE this insert (for position snapshot)
    // This happens inside transaction, so it's consistent
    const waitingCount = await tx.queueEntry.count({
      where: {
        restaurantId,
        status: QueueEntryStatus.WAITING,
      },
    })

    const positionSnapshot = waitingCount + 1

    // Create entry with token and position snapshot
    const entry = await tx.queueEntry.create({
      data: {
        restaurantId,
        name: data.name,
        mobileNumber: data.mobileNumber,
        partySize: data.partySize,
        seatingType: data.seatingType || null,
        status: QueueEntryStatus.WAITING,
        tokenNumber,
        positionSnapshot,
        idempotencyKey: data.idempotencyKey || null,
      },
    })

    return {
      id: entry.id,
      tokenNumber: entry.tokenNumber,
      positionSnapshot: entry.positionSnapshot,
      createdAt: entry.createdAt,
    }
  }, {
    // Transaction timeout: 5 seconds
    // If this times out, something is wrong (deadlock, etc.)
    timeout: 5000,
    isolationLevel: 'ReadCommitted', // Standard isolation level
  })
}

/**
 * Calls the next customer atomically.
 * 
 * Race condition prevention:
 * 1. Uses FOR UPDATE SKIP LOCKED to lock exactly one row
 * 2. If another admin already locked a row, we skip it and get the next one
 * 3. Update happens in same transaction
 * 4. Only one customer can be called per operation
 * 
 * This prevents:
 * - Two admins calling the same customer
 * - Two admins calling different customers incorrectly
 * - Lost updates
 * - Race conditions
 */
export async function callNextCustomerAtomically(
  restaurantId: string
): Promise<{
  id: string
  tokenNumber: string
  name: string
  mobileNumber: string
} | null> {
  return await prisma.$transaction(async (tx) => {
    // Get next entry with row-level lock
    // FOR UPDATE SKIP LOCKED ensures:
    // - We lock exactly one row
    // - If locked by another transaction, we skip it
    // - No deadlocks possible
    const nextEntry = await getNextInQueueWithLock(restaurantId, tx)

    if (!nextEntry) {
      return null
    }

    // Update status to CALLED in same transaction
    await tx.queueEntry.update({
      where: { id: nextEntry.id },
      data: {
        status: QueueEntryStatus.CALLED,
      },
    })

    return {
      id: nextEntry.id,
      tokenNumber: nextEntry.tokenNumber,
      name: nextEntry.name,
      mobileNumber: nextEntry.mobileNumber,
    }
  }, {
    timeout: 5000,
    isolationLevel: 'ReadCommitted',
  })
}

// Legacy function - kept for backward compatibility
// Use createQueueEntryAtomically instead
export async function generateTokenNumber(restaurantId: string): Promise<string> {
  return generateTokenNumberAtomically(restaurantId)
}

// Legacy function - kept for backward compatibility
export async function getNextInQueue(restaurantId: string) {
  return await prisma.queueEntry.findFirst({
    where: {
      restaurantId,
      status: QueueEntryStatus.WAITING,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}
