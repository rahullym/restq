import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getPositionInQueue, calculateWaitTime } from '@/lib/queue-logic'
import QueueDashboard from '@/components/admin/QueueDashboard'
import { QueueEntryResponse } from '@/types'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/admin/login')
  }

  // Get the first restaurant the user has access to (for MVP)
  // In production, you'd want to allow selecting a restaurant
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

  // Get all queue entries
  const queueEntries = await prisma.queueEntry.findMany({
    where: {
      restaurantId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Enrich with position and wait time
  const enrichedEntries: QueueEntryResponse[] = await Promise.all(
    queueEntries.map(async (entry) => {
      const position = await getPositionInQueue(entry.id, restaurantId)
      const waitTime = calculateWaitTime(
        Math.max(0, position - 1),
        restaurant.averageMinutesPerParty
      )

      return {
        id: entry.id,
        tokenNumber: entry.tokenNumber,
        name: entry.name,
        mobileNumber: entry.mobileNumber,
        partySize: entry.partySize,
        seatingType: entry.seatingType,
        status: entry.status,
        position,
        estimatedWaitMinutes: waitTime.minutes,
        createdAt: entry.createdAt.toISOString(),
      }
    })
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
        <p className="mt-2 text-gray-600">Manage your restaurant queue</p>
      </div>

      <QueueDashboard entries={enrichedEntries} restaurantId={restaurantId} />
    </div>
  )
}


