import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { QueueEntryStatus } from '@prisma/client'
import { ApiResponse } from '@/types'

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

    // Calculate date 24 hours ago
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Delete completed entries older than 24 hours
    const result = await prisma.queueEntry.deleteMany({
      where: {
        restaurantId,
        status: {
          in: [QueueEntryStatus.SEATED, QueueEntryStatus.NO_SHOW, QueueEntryStatus.CANCELLED],
        },
        updatedAt: {
          lt: twentyFourHoursAgo,
        },
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Cleared ${result.count} completed entries`,
      data: { deletedCount: result.count },
    })
  } catch (error) {
    console.error('Error clearing completed entries:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

