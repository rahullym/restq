import { prisma } from './prisma'
import { QueueEntryStatus } from '@prisma/client'

/**
 * Gets the next customer in queue (earliest WAITING entry)
 */
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
 * Generates a sequential token number for a restaurant
 * Format: A001, A002, etc.
 */
export async function generateTokenNumber(restaurantId: string): Promise<string> {
  // Get the latest token number for this restaurant
  const latestEntry = await prisma.queueEntry.findFirst({
    where: {
      restaurantId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      tokenNumber: true,
    },
  })

  if (!latestEntry) {
    return 'A001'
  }

  // Extract the number part (e.g., "A023" -> 23)
  const match = latestEntry.tokenNumber.match(/A(\d+)/)
  if (!match) {
    // Fallback if format is unexpected
    return 'A001'
  }

  const nextNumber = parseInt(match[1], 10) + 1
  return `A${nextNumber.toString().padStart(3, '0')}`
}

/**
 * Gets the current position of an entry in the queue
 * Position is based on number of WAITING entries created before this one
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


