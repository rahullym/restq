/**
 * Prisma implementation of Token Sequence Repository
 */
import { PrismaClient, Prisma } from '@prisma/client'
import { ITokenSequenceRepository } from '../token-sequence.repository'
import { Result } from '@/shared/types/result'

export class PrismaTokenSequenceRepository implements ITokenSequenceRepository {
  constructor(private prisma: PrismaClient) {}

  async getNextToken(restaurantId: string, tx?: Prisma.TransactionClient): Promise<Result<string>> {
    const client = tx || this.prisma

    try {
      // Get or create token sequence for this restaurant
      const sequence = await client.tokenSequence.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          currentValue: BigInt(0),
        },
        update: {},
      })

      // Atomically increment and get the new value
      const result = await (tx || this.prisma).$queryRaw<Array<{ currentValue: bigint }>>`
        UPDATE "TokenSequence"
        SET "currentValue" = "currentValue" + 1,
            "updatedAt" = NOW()
        WHERE "restaurantId" = ${restaurantId}
        RETURNING "currentValue"
      `

      const newValue =
        result && result.length > 0
          ? result[0].currentValue
          : sequence.currentValue + BigInt(1)

      // Format: R{restaurantPrefix}-{sequenceNumber}
      const restaurantPrefix = restaurantId.substring(0, 8).toUpperCase()
      const tokenNumber = `${restaurantPrefix}-${newValue.toString().padStart(6, '0')}`

      return Result.ok(tokenNumber)
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
