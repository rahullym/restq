import { QueueEntryStatus, UserRole } from '@prisma/client'

export { QueueEntryStatus, UserRole }

// Re-export shared types for backward compatibility
export type { ApiResponse } from '@/shared/types/api'
export type {
  QueueEntryResponse,
  QueueStatusResponse,
  QueueFormData,
  UpdateStatusRequest,
} from '@/shared/types/queue-entry'

export interface RestaurantInfo {
  id: string
  name: string
  slug: string
  currentQueueCount: number
  estimatedWaitRange: string
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



