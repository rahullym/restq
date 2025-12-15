import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { queueEntrySchema } from '@/shared/validation/schemas'
import { ApiResponse } from '@/shared/types/api'
import { checkQueueCreationRateLimit } from '@/lib/rate-limit'
import { logQueueCreation, incrementMetric } from '@/lib/logger'
import { handleError } from '@/presentation/middleware/error-handler'
import { createQueueEntryUseCase, restaurantRepo } from '@/infrastructure/di/container'
import { WaitTimeCalculator } from '@/domain/services/wait-time-calculator'
import { getQueuePositionUseCase } from '@/infrastructure/di/container'

/**
 * Create Queue Entry API
 * Refactored to use clean architecture layers
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantSlug: string }> }
) {
  const startTime = Date.now()

  try {
    const { restaurantSlug } = await params

    // Find restaurant by slug
    const restaurant = await restaurantRepo.findBySlug(restaurantSlug)
    if (!restaurant) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Restaurant not found',
        },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = queueEntrySchema.parse(body)

    // Rate limiting check
    const rateLimitResult = await checkQueueCreationRateLimit(
      request,
      validatedData.mobileNumber,
      restaurant.id
    )

    if (!rateLimitResult.allowed) {
      incrementMetric('rateLimitHits')
      return rateLimitResult.response!
    }

    // Execute use case
    const result = await createQueueEntryUseCase.execute(
      restaurant.id,
      validatedData
    )

    if (!result.success) {
      return handleError(result.error, { restaurantId: restaurant.id })
    }

    // Get current position (may have changed)
    const positionResult = await getQueuePositionUseCase.execute(
      result.data.entry.id,
      restaurant.id
    )

    const position = positionResult.success ? positionResult.data.position : result.data.position

    // Calculate wait time
    const waitTime = WaitTimeCalculator.calculate(
      Math.max(0, position - 1),
      restaurant.averageMinutesPerParty
    )

    const duration = Date.now() - startTime

    // Log successful creation
    logQueueCreation({
      restaurantId: restaurant.id,
      entryId: result.data.entry.id,
      tokenNumber: result.data.entry.tokenNumber,
      mobileNumber: validatedData.mobileNumber,
      position,
      duration,
    })

    incrementMetric('queueJoins')

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: result.data.entry.id,
          tokenNumber: result.data.entry.tokenNumber,
          name: result.data.entry.name,
          mobileNumber: result.data.entry.mobileNumber,
          partySize: result.data.entry.partySize,
          seatingType: result.data.entry.seatingType,
          status: result.data.entry.status,
          position,
          estimatedWaitMinutes: waitTime.minutes,
          createdAt: result.data.entry.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error, { duration: Date.now() - startTime })
  }
}
