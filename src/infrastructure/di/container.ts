/**
 * Dependency Injection Container
 * Centralized dependency management
 */
import { prisma } from '@/lib/prisma'
import { PrismaQueueEntryRepository } from '../repositories/prisma/queue-entry.repository'
import { PrismaRestaurantRepository } from '../repositories/prisma/restaurant.repository'
import { PrismaTokenSequenceRepository } from '../repositories/prisma/token-sequence.repository'
import { CreateQueueEntryUseCase } from '@/application/use-cases/create-queue-entry.use-case'
import { CallNextCustomerUseCase } from '@/application/use-cases/call-next-customer.use-case'
import { UpdateEntryStatusUseCase } from '@/application/use-cases/update-entry-status.use-case'
import { GetQueuePositionUseCase } from '@/application/use-cases/get-queue-position.use-case'

// Repositories
const queueEntryRepo = new PrismaQueueEntryRepository(prisma)
const restaurantRepo = new PrismaRestaurantRepository(prisma)
const tokenSequenceRepo = new PrismaTokenSequenceRepository(prisma)

// Use Cases
export const createQueueEntryUseCase = new CreateQueueEntryUseCase(
  queueEntryRepo,
  restaurantRepo,
  tokenSequenceRepo,
  prisma
)

export const callNextCustomerUseCase = new CallNextCustomerUseCase(
  queueEntryRepo,
  prisma
)

export const updateEntryStatusUseCase = new UpdateEntryStatusUseCase(
  queueEntryRepo
)

export const getQueuePositionUseCase = new GetQueuePositionUseCase(
  queueEntryRepo
)

// Export repositories for direct use if needed
export { queueEntryRepo, restaurantRepo, tokenSequenceRepo }
