import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { QueueEntryStatus } from '@prisma/client'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'

export default async function AnalyticsPage() {
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

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  })

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
  const todayEntries = await prisma.queueEntry.findMany({
    where: {
      restaurantId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

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
}


