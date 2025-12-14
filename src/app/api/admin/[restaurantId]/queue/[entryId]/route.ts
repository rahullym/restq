import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QueueEntryStatus } from '@prisma/client'
import { z } from 'zod'
import { ApiResponse, QueueEntryResponse } from '@/types'
import { getPositionInQueue, calculateWaitTime } from '@/lib/queue-logic'

const updateStatusSchema = z.object({
  status: z.nativeEnum(QueueEntryStatus),
})

// Valid status transitions
const validTransitions: Record<QueueEntryStatus, QueueEntryStatus[]> = {
  WAITING: [QueueEntryStatus.CALLED, QueueEntryStatus.CANCELLED],
  CALLED: [QueueEntryStatus.SEATED, QueueEntryStatus.NO_SHOW, QueueEntryStatus.CANCELLED],
  SEATED: [], // Terminal state
  NO_SHOW: [], // Terminal state
  CANCELLED: [], // Terminal state
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; entryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const { restaurantId, entryId } = await params

    // Verify user has access to this restaurant
    if (!session.user.restaurantIds.includes(restaurantId)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { status: newStatus } = updateStatusSchema.parse(body)

    // Get current entry
    const currentEntry = await prisma.queueEntry.findUnique({
      where: { id: entryId },
    })

    if (!currentEntry || currentEntry.restaurantId !== restaurantId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Queue entry not found',
        },
        { status: 404 }
      )
    }

    // Validate status transition
    const allowedTransitions = validTransitions[currentEntry.status]
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Invalid status transition from ${currentEntry.status} to ${newStatus}`,
        },
        { status: 400 }
      )
    }

    // Update entry
    const updatedEntry = await prisma.queueEntry.update({
      where: { id: entryId },
      data: {
        status: newStatus,
      },
    })

    // Get restaurant for wait time calculation
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Restaurant not found',
        },
        { status: 404 }
      )
    }

    // Get position and wait time for response
    const position = await getPositionInQueue(updatedEntry.id, restaurantId)
    const waitTime = calculateWaitTime(
      Math.max(0, position - 1),
      restaurant.averageMinutesPerParty
    )

    const response: QueueEntryResponse = {
      id: updatedEntry.id,
      tokenNumber: updatedEntry.tokenNumber,
      name: updatedEntry.name,
      mobileNumber: updatedEntry.mobileNumber,
      partySize: updatedEntry.partySize,
      seatingType: updatedEntry.seatingType,
      status: updatedEntry.status,
      position,
      estimatedWaitMinutes: waitTime.minutes,
      createdAt: updatedEntry.createdAt.toISOString(),
    }

    return NextResponse.json<ApiResponse<QueueEntryResponse>>({
      success: true,
      data: response,
      message: `Status updated to ${newStatus}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.errors[0].message,
        },
        { status: 400 }
      )
    }

    console.error('Error updating queue entry:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

