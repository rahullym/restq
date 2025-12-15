/**
 * Queue Entry Repository Interface
 * Abstraction for queue entry data access
 */
import { QueueEntry } from '@/domain/entities/queue-entry'
import { QueueEntryStatus } from '@prisma/client'
import { Result } from '@/shared/types/result'

export interface IQueueEntryRepository {
  findById(id: string): Promise<QueueEntry | null>
  findByRestaurantId(restaurantId: string): Promise<QueueEntry[]>
  findByStatus(
    restaurantId: string,
    status: QueueEntryStatus
  ): Promise<QueueEntry[]>
  findByTokenNumber(
    restaurantId: string,
    tokenNumber: string
  ): Promise<QueueEntry | null>
  findByIdempotencyKey(idempotencyKey: string): Promise<QueueEntry | null>
  findNextWaiting(restaurantId: string): Promise<QueueEntry | null>
  countWaiting(restaurantId: string): Promise<number>
  countWaitingBefore(restaurantId: string, createdAt: Date): Promise<number>
  create(entry: QueueEntry): Promise<Result<QueueEntry>>
  update(entry: QueueEntry): Promise<Result<QueueEntry>>
  delete(id: string): Promise<Result<void>>
  clearCompleted(restaurantId: string): Promise<Result<number>>
}
