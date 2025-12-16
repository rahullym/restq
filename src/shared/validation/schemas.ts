/**
 * Zod validation schemas
 */
import { z } from 'zod'
import { QueueEntryStatus } from '@prisma/client'
import { QUEUE_CONFIG } from '../constants'

export const queueEntrySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number'),
  partySize: z
    .number()
    .int()
    .min(QUEUE_CONFIG.MIN_PARTY_SIZE)
    .max(QUEUE_CONFIG.MAX_PARTY_SIZE)
    .optional()
    .default(QUEUE_CONFIG.DEFAULT_PARTY_SIZE),
  seatingType: z.enum(['Indoor', 'Outdoor', 'Any']).optional(),
  idempotencyKey: z.string().uuid().optional(),
})

export const updateStatusSchema = z.object({
  status: z.nativeEnum(QueueEntryStatus),
})

export const settingsSchema = z.object({
  averageMinutesPerParty: z
    .number()
    .int()
    .min(QUEUE_CONFIG.MIN_AVERAGE_MINUTES)
    .max(QUEUE_CONFIG.MAX_AVERAGE_MINUTES),
})

export type QueueEntryInput = z.infer<typeof queueEntrySchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type SettingsInput = z.infer<typeof settingsSchema>

