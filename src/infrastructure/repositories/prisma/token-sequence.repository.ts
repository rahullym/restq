/**
 * Prisma implementation of Token Sequence Repository
 */
import { PrismaClient, Prisma } from '@prisma/client'
import { ITokenSequenceRepository } from '../token-sequence.repository'
import { Result } from '@/shared/types/result'

export class PrismaTokenSequenceRepository implements ITokenSequenceRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generates a random 4-character alphanumeric token
   * Characters: A-Z, 0-9 (36 possible characters)
   */
  private generateRandomToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let token = ''
    for (let i = 0; i < 4; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }

  async getNextToken(restaurantId: string, tx?: Prisma.TransactionClient): Promise<Result<string>> {
    const client = tx || this.prisma
    const maxAttempts = 10

    try {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Generate a random 4-character alphanumeric token
        const token = this.generateRandomToken()

        // Check if token already exists for this restaurant
        const existing = await client.queueEntry.findFirst({
          where: {
            restaurantId,
            tokenNumber: token,
          },
          select: {
            id: true,
          },
        })

        // If token doesn't exist, return it
        if (!existing) {
          return Result.ok(token)
        }

        // If we've exhausted attempts, return an error
        if (attempt === maxAttempts - 1) {
          return Result.error(
            new Error(
              `Failed to generate unique token after ${maxAttempts} attempts. This is extremely rare.`
            )
          )
        }
      }

      // This should never be reached, but TypeScript needs it
      return Result.error(new Error('Token generation failed'))
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async initialize(restaurantId: string): Promise<Result<void>> {
    try {
      await this.prisma.tokenSequence.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          currentValue: BigInt(0),
        },
        update: {},
      })
      return Result.ok(undefined)
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
