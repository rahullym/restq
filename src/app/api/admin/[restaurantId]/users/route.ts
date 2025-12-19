import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/shared/types/api'
import { handleError } from '@/presentation/middleware/error-handler'
import { requireRole } from '@/presentation/middleware/auth.middleware'
import { RestaurantRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { validatePassword } from '@/lib/password-validation'

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(RestaurantRole),
})

/**
 * GET /api/admin/[restaurantId]/users
 * Get all users assigned to a restaurant
 * Requires: RESTAURANT_ADMIN or SUPER_ADMIN
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params

    // Require RESTAURANT_ADMIN or SUPER_ADMIN
    await requireRole(restaurantId, RestaurantRole.RESTAURANT_ADMIN)

    // Get all users for this restaurant
    const userRestaurants = await prisma.userRestaurant.findMany({
      where: {
        restaurantId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const users = userRestaurants.map((ur) => ({
      id: ur.user.id,
      name: ur.user.name,
      email: ur.user.email,
      status: ur.user.status,
      role: ur.role,
      createdAt: ur.user.createdAt.toISOString(),
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: users,
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/admin/[restaurantId]/users
 * Create a new user and assign to restaurant, or assign existing user
 * Requires: RESTAURANT_ADMIN or SUPER_ADMIN
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params

    // Require RESTAURANT_ADMIN or SUPER_ADMIN
    await requireRole(restaurantId, RestaurantRole.RESTAURANT_ADMIN)

    const body = await request.json()
    const { name, email, password, role } = createUserSchema.parse(body)

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: passwordValidation.errors.join(', '),
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Create new user
      const passwordHash = await bcrypt.hash(password, 10)
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          status: 'ACTIVE',
        },
      })
    } else {
      // Check if user is already assigned to this restaurant
      const existingMapping = await prisma.userRestaurant.findUnique({
        where: {
          userId_restaurantId: {
            userId: user.id,
            restaurantId,
          },
        },
      })

      if (existingMapping) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'User is already assigned to this restaurant',
          },
          { status: 400 }
        )
      }
    }

    // Assign user to restaurant with role
    await prisma.userRestaurant.create({
      data: {
        userId: user.id,
        restaurantId,
        role,
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'User assigned to restaurant successfully',
        data: {
          userId: user.id,
          email: user.email,
          role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error)
  }
}
