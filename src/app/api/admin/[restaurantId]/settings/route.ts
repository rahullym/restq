import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ApiResponse } from '@/types'

const settingsSchema = z.object({
  averageMinutesPerParty: z.number().int().min(1).max(60),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
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

    const { restaurantId } = await params

    // Verify user has access to this restaurant
    if (!session.user.restaurantIds.includes(restaurantId)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { averageMinutesPerParty } = settingsSchema.parse(body)

    // Update restaurant settings
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        averageMinutesPerParty,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.errors[0].message,
        },
        { status: 400 }
      )
    }

    console.error('Error updating settings:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

