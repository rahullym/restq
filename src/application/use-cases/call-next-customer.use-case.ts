/**
 * Call Next Customer Use Case
 * Race condition-safe implementation using FOR UPDATE SKIP LOCKED
 */
import { QueueEntry } from '@/domain/entities/queue-entry'
import { IQueueEntryRepository } from '@/infrastructure/repositories/queue-entry.repository'
import { QueueEntryStatus } from '@prisma/client'
import { Result } from '@/shared/types/result'
import { PrismaClient } from '@prisma/client'

export class CallNextCustomerUseCase {
  constructor(
    private queueEntryRepo: IQueueEntryRepository,
    private prisma: PrismaClient
  ) {}

  async execute(restaurantId: string): Promise<Result<QueueEntry>> {
    return await this.prisma.$transaction(async (tx) => {
      // Use raw SQL for FOR UPDATE SKIP LOCKED
      // This ensures only one customer is called per operation
      const result = await tx.$queryRaw<Array<{
        id: string
        tokenNumber: string
        name: string
        mobileNumber: string
      }>>`
        SELECT id, "tokenNumber", name, "mobileNumber"
        FROM "QueueEntry"
        WHERE "restaurantId" = ${restaurantId}
          AND status = 'WAITING'
        ORDER BY "createdAt" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `

      if (!result || result.length === 0) {
        return Result.error(new Error('No customers waiting in queue'))
      }

      const entryId = result[0].id

      // Update status to CALLED
      await tx.queueEntry.update({
        where: { id: entryId },
        data: {
          status: QueueEntryStatus.CALLED,
        },
      })

      // Fetch updated entry
      const updated = await this.queueEntryRepo.findById(entryId)
      if (!updated) {
        return Result.error(new Error('Failed to update queue entry'))
      }

      return Result.ok(updated)
    }, {
      timeout: 5000,
      isolationLevel: 'ReadCommitted',
    })
  }
}
