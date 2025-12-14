import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPositionInQueue, calculateWaitTime } from '@/lib/queue-logic'
import { ApiResponse, QueueStatusResponse } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantSlug: string }> }
) {
  try {
    const { restaurantSlug } = await params
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')

    if (!entryId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'entryId is required',
        },
        { status: 400 }
      )
    }

    // Find restaurant by slug
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
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

    // Find queue entry
    const queueEntry = await prisma.queueEntry.findUnique({
      where: { id: entryId },
    })

    if (!queueEntry || queueEntry.restaurantId !== restaurant.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Queue entry not found',
        },
        { status: 404 }
      )
    }

    // Get current position
    const position = await getPositionInQueue(queueEntry.id, restaurant.id)

    // Calculate wait time
    const waitTime = calculateWaitTime(
      Math.max(0, position - 1),
      restaurant.averageMinutesPerParty
    )

    let message = ''
    if (queueEntry.status === 'SEATED') {
      message = 'You have been seated!'
    } else if (queueEntry.status === 'CALLED') {
      message = 'Your table is ready! Please proceed to the entrance.'
    } else if (queueEntry.status === 'NO_SHOW' || queueEntry.status === 'CANCELLED') {
      message = 'This entry has been cancelled.'
    } else {
      message = `You are ${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'} in line.`
    }

    const response: QueueStatusResponse = {
      tokenNumber: queueEntry.tokenNumber,
      position,
      estimatedWaitMinutes: waitTime.minutes,
      status: queueEntry.status,
      message,
    }

    return NextResponse.json<ApiResponse<QueueStatusResponse>>({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('Error fetching queue status:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

