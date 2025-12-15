import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireRestaurantAccess } from '@/presentation/middleware/auth.middleware'
import { queueEntryRepo, restaurantRepo, getQueuePositionUseCase } from '@/infrastructure/di/container'
import { WaitTimeCalculator } from '@/domain/services/wait-time-calculator'

/**
 * Get Queue List API
 * Refactored to use clean architecture
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params

    // Authentication and authorization
    await requireRestaurantAccess(restaurantId)

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

    // Get all queue entries
    const entries = await queueEntryRepo.findByRestaurantId(restaurantId)

    // Enrich with position and wait time
    const enrichedEntries = await Promise.all(
      entries.map(async (entry) => {
        const positionResult = await getQueuePositionUseCase.execute(
          entry.id,
          restaurantId
        )
        const position = positionResult.success ? positionResult.data.position : 0

        const waitTime = WaitTimeCalculator.calculate(
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: enrichedEntries,
    })
  } catch (error) {
    return handleError(error)
  }
}
