import { NextRequest, NextResponse } from 'next/server'
import { settingsSchema } from '@/shared/validation/schemas'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireRole } from '@/presentation/middleware/auth.middleware'
import { RestaurantRole } from '@prisma/client'
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

    // Authentication and authorization - requires RESTAURANT_ADMIN or above
    await requireRole(restaurantId, RestaurantRole.RESTAURANT_ADMIN)

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
