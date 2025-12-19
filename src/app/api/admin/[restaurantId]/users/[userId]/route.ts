import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireRole } from '@/presentation/middleware/auth.middleware'
import { RestaurantRole } from '@prisma/client'
import { z } from 'zod'

const updateUserSchema = z.object({
  role: z.nativeEnum(RestaurantRole).optional(),
})

/**
 * PATCH /api/admin/[restaurantId]/users/[userId]
 * Update user's role for a restaurant or remove from restaurant
 * Requires: RESTAURANT_ADMIN or SUPER_ADMIN
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; userId: string }> }
) {
  try {
    const { restaurantId, userId } = await params

    // Require RESTAURANT_ADMIN or SUPER_ADMIN
    await requireRole(restaurantId, RestaurantRole.RESTAURANT_ADMIN)

    const body = await request.json()
    const { role } = updateUserSchema.parse(body)

    // Check if mapping exists
    const mapping = await prisma.userRestaurant.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    })

    if (!mapping) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User is not assigned to this restaurant',
        },
        { status: 404 }
      )
    }

    // Prevent removing last admin
    if (role && role !== RestaurantRole.RESTAURANT_ADMIN && role !== RestaurantRole.SUPER_ADMIN) {
      const adminCount = await prisma.userRestaurant.count({
        where: {
          restaurantId,
          role: {
            in: [RestaurantRole.RESTAURANT_ADMIN, RestaurantRole.SUPER_ADMIN],
          },
        },
      })

      if (adminCount <= 1 && mapping.role === RestaurantRole.RESTAURANT_ADMIN) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Cannot remove the last admin from restaurant',
          },
          { status: 400 }
        )
      }
    }

    // Update role
    if (role) {
      await prisma.userRestaurant.update({
        where: {
          userId_restaurantId: {
            userId,
            restaurantId,
          },
        },
        data: {
          role,
        },
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User role updated successfully',
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/admin/[restaurantId]/users/[userId]
 * Remove user from restaurant (not delete globally)
 * Requires: RESTAURANT_ADMIN or SUPER_ADMIN
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string; userId: string }> }
) {
  try {
    const { restaurantId, userId } = await params

    // Require RESTAURANT_ADMIN or SUPER_ADMIN
    await requireRole(restaurantId, RestaurantRole.RESTAURANT_ADMIN)

    // Check if mapping exists
    const mapping = await prisma.userRestaurant.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    })

    if (!mapping) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User is not assigned to this restaurant',
        },
        { status: 404 }
      )
    }

    // Prevent removing last admin
    if (
      mapping.role === RestaurantRole.RESTAURANT_ADMIN ||
      mapping.role === RestaurantRole.SUPER_ADMIN
    ) {
      const adminCount = await prisma.userRestaurant.count({
        where: {
          restaurantId,
          role: {
            in: [RestaurantRole.RESTAURANT_ADMIN, RestaurantRole.SUPER_ADMIN],
          },
        },
      })

      if (adminCount <= 1) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Cannot remove the last admin from restaurant',
          },
          { status: 400 }
        )
      }
    }

    // Remove user from restaurant
    await prisma.userRestaurant.delete({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User removed from restaurant successfully',
    })
  } catch (error) {
    return handleError(error)
  }
}
