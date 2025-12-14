import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextInQueue } from '@/lib/queue-logic'
import { sendQueueCalledNotification } from '@/lib/notifications'
import { QueueEntryStatus } from '@prisma/client'
import { ApiResponse, QueueEntryResponse } from '@/types'
import { getPositionInQueue, calculateWaitTime } from '@/lib/queue-logic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
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

    const { restaurantId } = await params

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

    // Get restaurant
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

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Find the next waiting entry
      const nextEntry = await tx.queueEntry.findFirst({
        where: {
          restaurantId,
          status: QueueEntryStatus.WAITING,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      if (!nextEntry) {
        return null
      }

      // Update status to CALLED
      const updatedEntry = await tx.queueEntry.update({
        where: { id: nextEntry.id },
        data: {
          status: QueueEntryStatus.CALLED,
        },
      })

      return updatedEntry
    })

    if (!result) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No customers waiting in queue',
        },
        { status: 404 }
      )
    }

    // Send notification (optional, can be toggled in settings)
    try {
      await sendQueueCalledNotification(
        result.mobileNumber,
        result.tokenNumber,
        restaurant.name
      )
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // Don't fail the request if notification fails
    }

    // Get position and wait time for response
    const position = await getPositionInQueue(result.id, restaurantId)
    const waitTime = calculateWaitTime(
      Math.max(0, position - 1),
      restaurant.averageMinutesPerParty
    )

    const response: QueueEntryResponse = {
      id: result.id,
      tokenNumber: result.tokenNumber,
      name: result.name,
      mobileNumber: result.mobileNumber,
      partySize: result.partySize,
      seatingType: result.seatingType,
      status: result.status,
      position,
      estimatedWaitMinutes: waitTime.minutes,
      createdAt: result.createdAt.toISOString(),
    }

    return NextResponse.json<ApiResponse<QueueEntryResponse>>({
      success: true,
      data: response,
      message: `Called customer ${result.tokenNumber}`,
    })
  } catch (error) {
    console.error('Error calling next customer:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

