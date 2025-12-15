import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireRestaurantAccess } from '@/presentation/middleware/auth.middleware'
import { queueEntryRepo } from '@/infrastructure/di/container'

/**
 * Clear Completed Entries API
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

    // Clear completed entries
    const result = await queueEntryRepo.clearCompleted(restaurantId)

    if (!result.success) {
      return handleError(result.error, { restaurantId })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Cleared ${result.data} completed entries`,
      data: { deletedCount: result.data },
    })
  } catch (error) {
    return handleError(error)
  }
}
