import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { QueueEntryStatus, QueueEntry } from '@prisma/client'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'

export default async function AnalyticsPage() {
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

    // Validate user has access to this restaurant
    const hasAccess = session.user.restaurantMappings.some(
      (m) => m.restaurantId === restaurantId
    )

    if (!hasAccess) {
      redirect('/admin/select-restaurant')
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

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all entries for today
    let todayEntries: QueueEntry[]
    try {
      todayEntries = await prisma.queueEntry.findMany({
        where: {
          restaurantId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      })
    } catch (dbError: any) {
      console.error('Database error loading queue entries:', {
        error: dbError?.message || dbError,
        code: dbError?.code,
        restaurantId,
      })
      // Use empty array if query fails
      todayEntries = []
    }

    // Calculate statistics
    const customersServedToday = todayEntries.filter(
      (e) => e.status === QueueEntryStatus.SEATED
    ).length

    const totalQueueEntries = todayEntries.length
    const noShowCount = todayEntries.filter((e) => e.status === QueueEntryStatus.NO_SHOW).length
    const noShowRate = totalQueueEntries > 0 ? (noShowCount / totalQueueEntries) * 100 : 0

    // Calculate average wait time (simplified - in production, track actual wait times)
    const activeQueueCount = todayEntries.filter(
      (e) => e.status === QueueEntryStatus.WAITING || e.status === QueueEntryStatus.CALLED
    ).length

    const analytics = {
      customersServedToday,
      averageWaitTime: restaurant.averageMinutesPerParty * 2, // Simplified calculation
      noShowRate: Math.round(noShowRate * 10) / 10,
      totalQueueEntries,
      activeQueueCount,
    }

    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">View your restaurant performance metrics</p>
        </div>

        <AnalyticsDashboard analytics={analytics} />
      </div>
    )
  } catch (error: any) {
    console.error('Error loading analytics page:', {
      message: error?.message,
      cause: error?.cause,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      name: error?.name,
    })
    throw error
  }
}





