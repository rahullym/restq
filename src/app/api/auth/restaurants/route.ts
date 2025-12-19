import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'

/**
 * GET /api/auth/restaurants
 * Get restaurants user has access to with roles
 */
export async function GET() {
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

    // Return restaurants from session with roles
    const restaurants = session.user.restaurantMappings.map((mapping) => ({
      restaurantId: mapping.restaurantId,
      name: mapping.restaurantName,
      slug: mapping.restaurantSlug,
      role: mapping.role,
    }))

    // Sort by name
    restaurants.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: restaurants,
    })
  } catch (error) {
    return handleError(error)
  }
}
