import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTokenNumber, getPositionInQueue, calculateWaitTime } from '@/lib/queue-logic'
import { QueueEntryStatus } from '@prisma/client'
import { z } from 'zod'
import { ApiResponse, QueueEntryResponse } from '@/types'

const queueEntrySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number'),
  partySize: z.number().int().min(1).max(20).optional().default(2),
  seatingType: z.enum(['Indoor', 'Outdoor', 'Any']).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantSlug: string }> }
) {
  try {
    const { restaurantSlug } = await params

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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = queueEntrySchema.parse(body)

    // Generate token number
    const tokenNumber = await generateTokenNumber(restaurant.id)

    // Count waiting entries before this one to get position
    const waitingCount = await prisma.queueEntry.count({
      where: {
        restaurantId: restaurant.id,
        status: QueueEntryStatus.WAITING,
      },
    })

    const positionSnapshot = waitingCount + 1

    // Create queue entry
    const queueEntry = await prisma.queueEntry.create({
      data: {
        restaurantId: restaurant.id,
        name: validatedData.name,
        mobileNumber: validatedData.mobileNumber,
        partySize: validatedData.partySize,
        seatingType: validatedData.seatingType || null,
        status: QueueEntryStatus.WAITING,
        tokenNumber,
        positionSnapshot,
      },
    })

    // Calculate wait time
    const waitTime = calculateWaitTime(
      waitingCount,
      restaurant.averageMinutesPerParty
    )

    const response: QueueEntryResponse = {
      id: queueEntry.id,
      tokenNumber: queueEntry.tokenNumber,
      name: queueEntry.name,
      mobileNumber: queueEntry.mobileNumber,
      partySize: queueEntry.partySize,
      seatingType: queueEntry.seatingType,
      status: queueEntry.status,
      position: positionSnapshot,
      estimatedWaitMinutes: waitTime.minutes,
      createdAt: queueEntry.createdAt.toISOString(),
    }

    return NextResponse.json<ApiResponse<QueueEntryResponse>>(
      {
        success: true,
        data: response,
      },
      { status: 201 }
    )
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

    console.error('Error creating queue entry:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

