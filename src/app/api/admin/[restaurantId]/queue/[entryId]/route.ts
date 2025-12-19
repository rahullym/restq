import { NextRequest, NextResponse } from 'next/server'
import { updateStatusSchema } from '@/shared/validation/schemas'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireRole } from '@/presentation/middleware/auth.middleware'
import { RestaurantRole } from '@prisma/client'
import { updateEntryStatusUseCase, restaurantRepo, getQueuePositionUseCase } from '@/infrastructure/di/container'
import { WaitTimeCalculator } from '@/domain/services/wait-time-calculator'
import { logStatusTransition } from '@/lib/logger'

/**
 * Update Queue Entry Status API
 * Refactored to use clean architecture
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; entryId: string }> }
) {
  try {
    const { restaurantId, entryId } = await params

    // Authentication and authorization - requires STAFF or above
    const { session } = await requireRole(restaurantId, RestaurantRole.STAFF)

    // Parse and validate request body
    const body = await request.json()
    const { status: newStatus } = updateStatusSchema.parse(body)

    // Execute use case
    const result = await updateEntryStatusUseCase.execute(
      entryId,
      restaurantId,
      newStatus
    )

    if (!result.success) {
      return handleError(result.error, { restaurantId, entryId })
    }

    const entry = result.data

    // Get restaurant for wait time calculation
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

    // Log status transition
    logStatusTransition({
      restaurantId,
      entryId: entry.id,
      tokenNumber: entry.tokenNumber,
      fromStatus: entry.status, // Note: This shows new status, domain should track old
      toStatus: newStatus,
      userId: session.user.id,
    })

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
      message: `Status updated to ${newStatus}`,
    })
  } catch (error) {
    return handleError(error)
  }
}
