/**
 * Notification Service Abstraction
 * 
 * This module provides an abstraction layer for sending notifications.
 * Currently implements a mock service that logs to console.
 * 
 * Future implementations can be added for:
 * - Twilio SMS
 * - WhatsApp Business API
 * - Email notifications
 * - Push notifications
 */

import { logEvent } from './logger'

export interface NotificationService {
  sendQueueCalled(mobileNumber: string, message: string): Promise<boolean>
}

/**
 * Mock notification service that logs to console
 * Used for development and testing
 */
class MockNotificationService implements NotificationService {
  async sendQueueCalled(mobileNumber: string, message: string): Promise<boolean> {
    // Use logger instead of console.log for consistency
    logEvent('info', 'notification_sent', {
      provider: 'mock',
      mobileNumber,
      messageLength: message.length,
    })
    
    // In development, also log to console for visibility
    if (process.env.NODE_ENV === 'development') {
      console.log('[MOCK NOTIFICATION]')
      console.log(`To: ${mobileNumber}`)
      console.log(`Message: ${message}`)
      console.log('---')
    }
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true
  }
}

/**
 * Get the notification service instance based on environment configuration
 */
export function getNotificationService(): NotificationService {
  const provider = process.env.NOTIFICATION_PROVIDER || 'mock'

  switch (provider) {
    case 'mock':
      return new MockNotificationService()
    
    // Future implementations:
    // case 'twilio':
    //   return new TwilioNotificationService()
    // case 'whatsapp':
    //   return new WhatsAppNotificationService()
    
    default:
      console.warn(`Unknown notification provider: ${provider}, falling back to mock`)
      return new MockNotificationService()
  }
}

/**
 * Helper function to send queue called notification
 */
export async function sendQueueCalledNotification(
  mobileNumber: string,
  tokenNumber: string,
  restaurantName: string
): Promise<boolean> {
  const message = `Hi! Your table is ready at ${restaurantName}. Token: ${tokenNumber}. Please proceed to the entrance.`
  const service = getNotificationService()
  return await service.sendQueueCalled(mobileNumber, message)
}


