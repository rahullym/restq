/**
 * Authentication Middleware
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AppError, RestaurantNotFoundError, InsufficientPermissionsError, RestaurantInactiveError } from './error-handler'
import { RestaurantRole, RestaurantStatus } from '@prisma/client'

// Role hierarchy: higher number = more permissions
const ROLE_HIERARCHY: Record<RestaurantRole, number> = {
  VIEW_ONLY: 0,
  STAFF: 1,
  RESTAURANT_ADMIN: 2,
  SUPER_ADMIN: 3,
}

/**
 * Check if a role has sufficient permissions
 */
function hasMinimumRole(userRole: RestaurantRole, minimumRole: RestaurantRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole]
}

/**
 * Require user to be authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new AppError('Unauthorized', 401)
  }
  return session
}

/**
 * Require user to have access to a restaurant
 * Returns the user's role for that restaurant
 */
export async function requireRestaurantAccess(restaurantId: string): Promise<{
  session: Awaited<ReturnType<typeof requireAuth>>
  role: RestaurantRole
}> {
  const session = await requireAuth()

  // Find user's mapping to this restaurant
  const mapping = session.user.restaurantMappings.find(
    (m) => m.restaurantId === restaurantId
  )

  if (!mapping) {
    // Check if restaurant exists (for security: return 404 instead of 403)
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    })

    if (!restaurant) {
      throw new RestaurantNotFoundError(restaurantId)
    }

    throw new AppError('Forbidden', 403)
  }

  // Check restaurant status
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { status: true },
  })

  if (!restaurant) {
    throw new RestaurantNotFoundError(restaurantId)
  }

  if (restaurant.status !== 'ACTIVE') {
    throw new RestaurantInactiveError(restaurantId)
  }

  return {
    session,
    role: mapping.role,
  }
}

/**
 * Require user to have a minimum role for a restaurant
 */
export async function requireRole(
  restaurantId: string,
  minimumRole: RestaurantRole
): Promise<{
  session: Awaited<ReturnType<typeof requireAuth>>
  role: RestaurantRole
}> {
  const { session, role } = await requireRestaurantAccess(restaurantId)

  if (!hasMinimumRole(role, minimumRole)) {
    throw new InsufficientPermissionsError(minimumRole)
  }

  return { session, role }
}

/**
 * Require user to be a super admin (in any restaurant)
 */
export async function requireSuperAdmin() {
  const session = await requireAuth()

  const hasSuperAdmin = session.user.restaurantMappings.some(
    (m) => m.role === 'SUPER_ADMIN'
  )

  if (!hasSuperAdmin) {
    throw new InsufficientPermissionsError('SUPER_ADMIN')
  }

  return session
}



