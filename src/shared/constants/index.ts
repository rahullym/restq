/**
 * Application constants
 */

export const QUEUE_STATUS_TRANSITIONS = {
  WAITING: ['CALLED', 'CANCELLED'],
  CALLED: ['SEATED', 'NO_SHOW', 'CANCELLED'],
  SEATED: [], // Terminal state
  NO_SHOW: [], // Terminal state
  CANCELLED: [], // Terminal state
} as const

export const RATE_LIMITS = {
  MOBILE_NUMBER: {
    MAX_REQUESTS: 3,
    WINDOW_MINUTES: 60,
  },
  IP_ADDRESS: {
    MAX_REQUESTS: 20,
    WINDOW_MINUTES: 1,
  },
} as const

export const QUEUE_CONFIG = {
  DEFAULT_PARTY_SIZE: 2,
  MIN_PARTY_SIZE: 1,
  MAX_PARTY_SIZE: 20,
  DEFAULT_AVERAGE_MINUTES_PER_PARTY: 10,
  MIN_AVERAGE_MINUTES: 1,
  MAX_AVERAGE_MINUTES: 60,
} as const

export const TRANSACTION_CONFIG = {
  TIMEOUT_MS: 5000,
  ISOLATION_LEVEL: 'ReadCommitted' as const,
} as const

