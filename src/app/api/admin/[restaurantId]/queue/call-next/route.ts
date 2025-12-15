import { NextRequest, NextResponse } from 'next/server'
import { sendQueueCalledNotification } from '@/lib/notifications'
import { ApiResponse } from '@/shared/types/api'
import { logCallNext, incrementMetric } from '@/lib/logger'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireRestaurantAccess } from '@/presentation/middleware/auth.middleware'
import { callNextCustomerUseCase, restaurantRepo, getQueuePositionUseCase } from '@/infrastructure/di/container'
import { WaitTimeCalculator } from '@/domain/services/wait-time-calculator'

/**
 * Call Next Customer API
 * Refactored to use clean architecture
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const startTime = Date.now()

  try {
    const { restaurantId } = await params

    // Authentication and authorization
    const session = await requireRestaurantAccess(restaurantId)

    // Get restaurant
    const restaurant = await restaurantRepo.findById(restaurantId)
    if (!restaurant) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Restaurant not found',
        },
        { status: 404 }
      )
    }

    // Execute use case
    const result = await callNextCustomerUseCase.execute(restaurantId)

    if (!result.success) {
      if (result.error.message === 'No customers waiting in queue') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: result.error.message,
          },
          { status: 404 }
        )
      }
      return handleError(result.error, { restaurantId })
    }

    const entry = result.data

    // Send notification (non-blocking)
    try {
      await sendQueueCalledNotification(
        entry.mobileNumber,
        entry.tokenNumber,
        restaurant.name
      )
    } catch (notificationError) {
      // Log but don't fail request
      handleError(notificationError, {
        restaurantId,
        entryId: entry.id,
        tokenNumber: entry.tokenNumber,
      })
    }

    // Get position and wait time
    const positionResult = await getQueuePositionUseCase.execute(
      entry.id,
      restaurantId
    )
    const position = positionResult.success ? positionResult.data.position : 0

    const waitTime = WaitTimeCalculator.calculate(
      Math.max(0, position - 1),
      restaurant.averageMinutesPerParty
    )

    const duration = Date.now() - startTime

    // Log successful call
    logCallNext({
      restaurantId,
      entryId: entry.id,
      tokenNumber: entry.tokenNumber,
      userId: session.user.id,
      duration,
    })

    incrementMetric('callNexts')

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
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
      },
      message: `Called customer ${entry.tokenNumber}`,
    })
  } catch (error) {
    return handleError(error, { duration: Date.now() - startTime })
  }
}
