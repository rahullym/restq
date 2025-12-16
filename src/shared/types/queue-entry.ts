/**
 * Queue Entry DTOs for API responses
 */
import { QueueEntryStatus } from '@prisma/client'

export interface QueueEntryResponse {
  id: string
  tokenNumber: string
  name: string
  mobileNumber: string
  partySize: number
  seatingType?: string | null
  status: QueueEntryStatus
  position: number
  estimatedWaitMinutes: number
  createdAt: string
}

export interface QueueStatusResponse {
  tokenNumber: string
  position: number
  estimatedWaitMinutes: number
  status: QueueEntryStatus
  message: string
}

export interface QueueFormData {
  name: string
  mobileNumber: string
  partySize?: number
  seatingType?: 'Indoor' | 'Outdoor' | 'Any'
  idempotencyKey?: string
}

export interface UpdateStatusRequest {
  status: QueueEntryStatus
}

