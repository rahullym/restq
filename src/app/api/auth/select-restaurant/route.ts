import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { z } from 'zod'

const selectRestaurantSchema = z.object({
  restaurantId: z.string().min(1),
})

/**
 * POST /api/auth/select-restaurant
 * Store selected restaurant in secure cookie
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { restaurantId } = selectRestaurantSchema.parse(body)

    // Validate user has access to this restaurant
    const hasAccess = session.user.restaurantMappings.some(
      (m) => m.restaurantId === restaurantId
    )

    if (!hasAccess) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'You do not have access to this restaurant',
        },
        { status: 403 }
      )
    }

    // Update session with selected restaurant
    // This will be stored in the JWT token via the session update callback
    // Note: We need to trigger a session update, but NextAuth doesn't support this directly in API routes
    // So we'll use a cookie as a workaround, but read from session in components
    
    // Store in cookie as fallback (for immediate access)
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: 'Restaurant selected successfully',
      data: { restaurantId },
    })
    
    // Set cookie for immediate access
    response.cookies.set('selectedRestaurantId', restaurantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    
    return response
  } catch (error) {
    return handleError(error)
  }
}
