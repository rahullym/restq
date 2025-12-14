import { QueueEntryStatus, UserRole } from '@prisma/client'

export { QueueEntryStatus, UserRole }

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

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

export interface RestaurantInfo {
  id: string
  name: string
  slug: string
  currentQueueCount: number
  estimatedWaitRange: string
}

export interface QueueFormData {
  name: string
  mobileNumber: string
  partySize?: number
  seatingType?: 'Indoor' | 'Outdoor' | 'Any'
}

export interface UpdateStatusRequest {
  status: QueueEntryStatus
}

export interface AnalyticsData {
  customersServedToday: number
  averageWaitTime: number
  noShowRate: number
  totalQueueEntries: number
  activeQueueCount: number
}

export interface UserSession {
  id: string
  name: string
  email: string
  role: UserRole
  restaurantIds: string[]
}


