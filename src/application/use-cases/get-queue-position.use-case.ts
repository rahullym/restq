/**
 * Get Queue Position Use Case
 */
import { IQueueEntryRepository } from '@/infrastructure/repositories/queue-entry.repository'
import { Result } from '@/shared/types/result'

export interface QueuePositionResult {
  position: number
  isTerminal: boolean
}

export class GetQueuePositionUseCase {
  constructor(private queueEntryRepo: IQueueEntryRepository) {}

  async execute(
    entryId: string,
    restaurantId: string
  ): Promise<Result<QueuePositionResult>> {
    const entry = await this.queueEntryRepo.findById(entryId)
    if (!entry) {
      return Result.error(new Error('Queue entry not found'))
    }

    // If terminal state, position is 0
    if (entry.isTerminal()) {
      return Result.ok({
        position: 0,
        isTerminal: true,
      })
    }

    // Count waiting entries created before this one
    const position = await this.queueEntryRepo.countWaitingBefore(
      restaurantId,
      entry.createdAt
    )

    return Result.ok({
      position: position + 1, // 1-indexed
      isTerminal: false,
    })
  }
}



