import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      redirect('/admin/login')
    }

    const restaurantId = session.user.restaurantIds[0]

    if (!restaurantId) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No restaurant assigned to your account.</p>
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



