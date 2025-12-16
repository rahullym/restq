/**
 * Authentication Middleware
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppError } from './error-handler'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new AppError('Unauthorized', 401)
  }
  return session
}

export async function requireRestaurantAccess(restaurantId: string) {
  const session = await requireAuth()
  if (!session.user.restaurantIds.includes(restaurantId)) {
    throw new AppError('Forbidden', 403)
  }
  return session
}

