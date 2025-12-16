/**
 * Token Sequence Repository Interface
 * For atomic token generation
 */
import { Result } from '@/shared/types/result'

import { Prisma } from '@prisma/client'

export interface ITokenSequenceRepository {
  getNextToken(restaurantId: string, tx?: Prisma.TransactionClient): Promise<Result<string>>
  initialize(restaurantId: string): Promise<Result<void>>
}
