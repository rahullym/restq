/**
 * Token Sequence Repository Interface
 * For atomic token generation
 */
import { Result } from '@/shared/types/result'

export interface ITokenSequenceRepository {
  getNextToken(restaurantId: string, tx?: any): Promise<Result<string>>
  initialize(restaurantId: string): Promise<Result<void>>
}
