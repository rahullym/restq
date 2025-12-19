import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/admin/SettingsForm'
import { RestaurantRole } from '@prisma/client'

export default async function SettingsPage() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      redirect('/admin/login')
    }

    // Get selected restaurant from session
    let restaurantId = session.selectedRestaurantId

    // Auto-select if only one restaurant
    if (!restaurantId && session.user.restaurantMappings.length === 1) {
      restaurantId = session.user.restaurantMappings[0].restaurantId
    }

    if (!restaurantId) {
      redirect('/admin/select-restaurant')
    }

    // Check user has RESTAURANT_ADMIN or SUPER_ADMIN role
    const userMapping = session.user.restaurantMappings.find(
      (m) => m.restaurantId === restaurantId
    )

    if (
      !userMapping ||
      (userMapping.role !== RestaurantRole.RESTAURANT_ADMIN &&
        userMapping.role !== RestaurantRole.SUPER_ADMIN)
    ) {
      return (
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-900 mb-2">Insufficient Permissions</h2>
            <p className="text-yellow-800">
              You need RESTAURANT_ADMIN or SUPER_ADMIN role to access settings.
            </p>
          </div>
        </div>
      )
    }

    let restaurant
    try {
      restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      })
    } catch (dbError: any) {
      console.error('Database error loading restaurant:', {
        error: dbError?.message || dbError,
        code: dbError?.code,
        restaurantId,
      })
      const error = new Error('Failed to connect to database')
      error.cause = dbError
      throw error
    }

    if (!restaurant) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Restaurant not found.</p>
        </div>
      )
    }

    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Configure your restaurant preferences</p>
        </div>

        <SettingsForm restaurant={restaurant} />
      </div>
    )
  } catch (error: any) {
    console.error('Error loading settings page:', {
      message: error?.message,
      cause: error?.cause,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      name: error?.name,
    })
    throw error
  }
}





