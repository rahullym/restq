/**
 * Prisma implementation of Queue Entry Repository
 */
import { PrismaClient, QueueEntryStatus, QueueEntry as PrismaQueueEntry } from '@prisma/client'
import { QueueEntry } from '@/domain/entities/queue-entry'
import { IQueueEntryRepository } from '../queue-entry.repository'
import { Result } from '@/shared/types/result'

export class PrismaQueueEntryRepository implements IQueueEntryRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomain(prismaEntry: PrismaQueueEntry): QueueEntry {
    return new QueueEntry({
      id: prismaEntry.id,
      restaurantId: prismaEntry.restaurantId,
      name: prismaEntry.name,
      mobileNumber: prismaEntry.mobileNumber,
      partySize: prismaEntry.partySize,
      seatingType: prismaEntry.seatingType,
      status: prismaEntry.status,
      tokenNumber: prismaEntry.tokenNumber,
      positionSnapshot: prismaEntry.positionSnapshot,
      idempotencyKey: prismaEntry.idempotencyKey,
      createdAt: prismaEntry.createdAt,
      updatedAt: prismaEntry.updatedAt,
    })
  }

  async findById(id: string): Promise<QueueEntry | null> {
    const entry = await this.prisma.queueEntry.findUnique({
      where: { id },
    })
    return entry ? this.toDomain(entry) : null
  }

  async findByRestaurantId(restaurantId: string): Promise<QueueEntry[]> {
    const entries = await this.prisma.queueEntry.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'asc' },
    })
    return entries.map((e) => this.toDomain(e))
  }

  async findByStatus(
    restaurantId: string,
    status: QueueEntryStatus
  ): Promise<QueueEntry[]> {
    const entries = await this.prisma.queueEntry.findMany({
      where: { restaurantId, status },
      orderBy: { createdAt: 'asc' },
    })
    return entries.map((e) => this.toDomain(e))
  }

  async findByTokenNumber(
    restaurantId: string,
    tokenNumber: string
  ): Promise<QueueEntry | null> {
    const entry = await this.prisma.queueEntry.findFirst({
      where: { restaurantId, tokenNumber },
    })
    return entry ? this.toDomain(entry) : null
  }

  async findByIdempotencyKey(
    idempotencyKey: string
  ): Promise<QueueEntry | null> {
    const entry = await this.prisma.queueEntry.findUnique({
      where: { idempotencyKey },
    })
    return entry ? this.toDomain(entry) : null
  }

  async findNextWaiting(restaurantId: string): Promise<QueueEntry | null> {
    // This will be used with FOR UPDATE SKIP LOCKED in the service layer
    const entry = await this.prisma.queueEntry.findFirst({
      where: {
        restaurantId,
        status: QueueEntryStatus.WAITING,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    return entry ? this.toDomain(entry) : null
  }

  async countWaiting(restaurantId: string): Promise<number> {
    return this.prisma.queueEntry.count({
      where: {
        restaurantId,
        status: QueueEntryStatus.WAITING,
      },
    })
  }

  async countWaitingBefore(
    restaurantId: string,
    createdAt: Date
  ): Promise<number> {
    return this.prisma.queueEntry.count({
      where: {
        restaurantId,
        status: QueueEntryStatus.WAITING,
        createdAt: {
          lt: createdAt,
        },
      },
    })
  }

  async create(entry: QueueEntry): Promise<Result<QueueEntry>> {
    try {
      const created = await this.prisma.queueEntry.create({
        data: {
          restaurantId: entry.restaurantId,
          name: entry.name,
          mobileNumber: entry.mobileNumber,
          partySize: entry.partySize,
          seatingType: entry.seatingType,
          status: entry.status,
          tokenNumber: entry.tokenNumber,
          positionSnapshot: entry.positionSnapshot,
          idempotencyKey: entry.idempotencyKey || null,
        },
      })
      return Result.ok(this.toDomain(created))
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async update(entry: QueueEntry): Promise<Result<QueueEntry>> {
    try {
      const updated = await this.prisma.queueEntry.update({
        where: { id: entry.id },
        data: {
          status: entry.status,
          updatedAt: entry.updatedAt,
        },
      })
      return Result.ok(this.toDomain(updated))
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.queueEntry.delete({ where: { id } })
      return Result.ok(undefined)
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async clearCompleted(restaurantId: string): Promise<Result<number>> {
    try {
      const result = await this.prisma.queueEntry.deleteMany({
        where: {
          restaurantId,
          status: {
            in: ['SEATED', 'NO_SHOW', 'CANCELLED'],
          },
        },
      })
      return Result.ok(result.count)
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
