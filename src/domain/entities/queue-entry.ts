/**
 * Queue Entry Domain Entity
 * Contains business logic and validation for queue entries
 */
import { QueueEntryStatus } from '@prisma/client'
import { QUEUE_STATUS_TRANSITIONS } from '@/shared/constants'

export interface QueueEntryProps {
  id: string
  restaurantId: string
  name: string
  mobileNumber: string
  partySize: number
  seatingType?: string | null
  status: QueueEntryStatus
  tokenNumber: string
  positionSnapshot: number
  idempotencyKey?: string | null
  createdAt: Date
  updatedAt: Date
}

export class QueueEntry {
  constructor(private props: QueueEntryProps) {}

  get id() {
    return this.props.id
  }

  get restaurantId() {
    return this.props.restaurantId
  }

  get name() {
    return this.props.name
  }

  get mobileNumber() {
    return this.props.mobileNumber
  }

  get partySize() {
    return this.props.partySize
  }

  get seatingType() {
    return this.props.seatingType
  }

  get status() {
    return this.props.status
  }

  get tokenNumber() {
    return this.props.tokenNumber
  }

  get positionSnapshot() {
    return this.props.positionSnapshot
  }

  get idempotencyKey() {
    return this.props.idempotencyKey
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  /**
   * Check if status transition is valid
   */
  canTransitionTo(newStatus: QueueEntryStatus): boolean {
    const allowedTransitions =
      QUEUE_STATUS_TRANSITIONS[this.props.status as keyof typeof QUEUE_STATUS_TRANSITIONS] || []
    return (allowedTransitions as readonly QueueEntryStatus[]).includes(newStatus)
  }

  /**
   * Transition to new status (validates transition)
   */
  transitionTo(newStatus: QueueEntryStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Invalid status transition from ${this.props.status} to ${newStatus}`
      )
    }
    this.props.status = newStatus
    this.props.updatedAt = new Date()
  }

  /**
   * Check if entry is in terminal state
   */
  isTerminal(): boolean {
    return ['SEATED', 'NO_SHOW', 'CANCELLED'].includes(this.props.status)
  }

  /**
   * Check if entry is waiting
   */
  isWaiting(): boolean {
    return this.props.status === 'WAITING'
  }

  /**
   * Check if entry is called
   */
  isCalled(): boolean {
    return this.props.status === 'CALLED'
  }

  toJSON() {
    return { ...this.props }
  }
}



