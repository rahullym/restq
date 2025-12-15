import { NextRequest, NextResponse } from 'next/server'
import { settingsSchema } from '@/shared/validation/schemas'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireRestaurantAccess } from '@/presentation/middleware/auth.middleware'
import { restaurantRepo } from '@/infrastructure/di/container'

/**
 * Update Restaurant Settings API
 * Refactored to use clean architecture
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params

    // Authentication and authorization
    await requireRestaurantAccess(restaurantId)

    // Parse and validate request body
    const body = await request.json()
    const { averageMinutesPerParty } = settingsSchema.parse(body)

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

    // Update settings using domain entity
    restaurant.averageMinutesPerParty = averageMinutesPerParty

    // Persist changes
    const result = await restaurantRepo.update(restaurant)
    if (!result.success) {
      return handleError(result.error, { restaurantId })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    return handleError(error)
  }
}
