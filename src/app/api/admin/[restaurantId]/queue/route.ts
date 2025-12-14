import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPositionInQueue, calculateWaitTime } from '@/lib/queue-logic'
import { ApiResponse, QueueEntryResponse } from '@/types'

export async function GET(
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

    // Get all queue entries
    const queueEntries = await prisma.queueEntry.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Enrich with position and wait time
    const enrichedEntries: QueueEntryResponse[] = await Promise.all(
      queueEntries.map(async (entry) => {
        const position = await getPositionInQueue(entry.id, restaurantId)
        const waitTime = calculateWaitTime(
          Math.max(0, position - 1),
          restaurant.averageMinutesPerParty
        )

        return {
          id: entry.id,
          tokenNumber: entry.tokenNumber,
          name: entry.name,
          mobileNumber: entry.mobileNumber,
          partySize: entry.partySize,
          seatingType: entry.seatingType,
          status: entry.status,
          position,
          estimatedWaitMinutes: waitTime.minutes,
          createdAt: entry.createdAt.toISOString(),
        }
      })
    )

    return NextResponse.json<ApiResponse<QueueEntryResponse[]>>({
      success: true,
      data: enrichedEntries,
    })
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

