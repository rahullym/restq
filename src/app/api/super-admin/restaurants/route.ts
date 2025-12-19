import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireSuperAdmin } from '@/presentation/middleware/auth.middleware'
import { RestaurantStatus } from '@prisma/client'
import { z } from 'zod'

const createRestaurantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  averageMinutesPerParty: z.number().int().positive().default(10),
})

/**
 * POST /api/super-admin/restaurants
 * Create a new restaurant
 * Requires: SUPER_ADMIN
 */
export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin()

    const body = await request.json()
    const { name, slug, averageMinutesPerParty } = createRestaurantSchema.parse(body)

    // Check if slug already exists
    const existing = await prisma.restaurant.findUnique({
      where: { slug },
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

    // Create restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        averageMinutesPerParty,
        status: RestaurantStatus.ACTIVE,
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Restaurant created successfully',
        data: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          status: restaurant.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error)
  }
}

/**
 * GET /api/super-admin/restaurants
 * Get all restaurants with stats
 * Requires: SUPER_ADMIN
 */
export async function GET() {
  try {
    await requireSuperAdmin()

    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: {
            queueEntries: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const restaurantsWithStats = restaurants.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      status: r.status,
      averageMinutesPerParty: r.averageMinutesPerParty,
      userCount: r._count.users,
      queueEntryCount: r._count.queueEntries,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: restaurantsWithStats,
    })
  } catch (error) {
    return handleError(error)
  }
}
