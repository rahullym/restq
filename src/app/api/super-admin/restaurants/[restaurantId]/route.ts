import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/shared/types/api'
import { handleError, RestaurantNotFoundError } from '@/presentation/middleware/error-handler'
import { requireSuperAdmin } from '@/presentation/middleware/auth.middleware'
import { RestaurantStatus } from '@prisma/client'
import { z } from 'zod'

const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  averageMinutesPerParty: z.number().int().positive().optional(),
  status: z.nativeEnum(RestaurantStatus).optional(),
})

/**
 * PATCH /api/super-admin/restaurants/[restaurantId]
 * Update restaurant details
 * Requires: SUPER_ADMIN
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    await requireSuperAdmin()

    const { restaurantId } = await params
    const body = await request.json()
    const updateData = updateRestaurantSchema.parse(body)

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })

    if (!restaurant) {
      throw new RestaurantNotFoundError(restaurantId)
    }

    // Check if slug is being changed and if it conflicts
    if (updateData.slug && updateData.slug !== restaurant.slug) {
      const existing = await prisma.restaurant.findUnique({
        where: { slug: updateData.slug },
      })

      if (existing) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Restaurant with this slug already exists',
          },
          { status: 400 }
        )
      }
    }

    // Update restaurant
    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: updateData,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Restaurant updated successfully',
      data: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        status: updated.status,
        averageMinutesPerParty: updated.averageMinutesPerParty,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
