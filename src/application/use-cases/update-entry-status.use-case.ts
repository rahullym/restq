/**
 * Update Entry Status Use Case
 * Validates status transitions using domain logic
 */
import { QueueEntry } from '@/domain/entities/queue-entry'
import { IQueueEntryRepository } from '@/infrastructure/repositories/queue-entry.repository'
import { QueueEntryStatus } from '@prisma/client'
import { Result } from '@/shared/types/result'

export class UpdateEntryStatusUseCase {
  constructor(private queueEntryRepo: IQueueEntryRepository) {}

  async execute(
    entryId: string,
    restaurantId: string,
    newStatus: QueueEntryStatus
  ): Promise<Result<QueueEntry>> {
    // Fetch entry
    const entry = await this.queueEntryRepo.findById(entryId)
    if (!entry) {
      return Result.error(new Error('Queue entry not found'))
    }

    // Verify restaurant ownership
    if (entry.restaurantId !== restaurantId) {
      return Result.error(new Error('Queue entry not found'))
    }

    // Validate transition using domain logic
    if (!entry.canTransitionTo(newStatus)) {
      return Result.error(
        new Error(`Invalid status transition from ${entry.status} to ${newStatus}`)
      )
    }

    // Update status using domain method
    entry.transitionTo(newStatus)

    // Persist changes
    const updateResult = await this.queueEntryRepo.update(entry)
    if (!updateResult.success) {
      return updateResult
    }

    return Result.ok(updateResult.data)
  }
}

