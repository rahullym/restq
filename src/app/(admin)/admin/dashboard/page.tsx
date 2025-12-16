import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getPositionInQueue, calculateWaitTime } from '@/lib/queue-logic'
import QueueDashboard from '@/components/admin/QueueDashboard'
import { QueueEntryResponse } from '@/types'
import { QueueEntry } from '@prisma/client'

export default async function AdminDashboardPage() {
  try {
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

    // Get initial queue entries for SSR
    let queueEntries: QueueEntry[]
    try {
      queueEntries = await prisma.queueEntry.findMany({
        where: {
          restaurantId,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 50, // Limit initial load
      })
    } catch (dbError: any) {
      console.error('Database error loading queue entries:', {
        error: dbError?.message || dbError,
        code: dbError?.code,
        restaurantId,
      })
      queueEntries = []
    }

    // Enrich with position and wait time for initial render
    let enrichedEntries: QueueEntryResponse[] = []
    try {
      enrichedEntries = await Promise.all(
        queueEntries.map(async (entry) => {
          try {
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
          } catch (entryError: any) {
            console.error('Error enriching queue entry:', {
              entryId: entry.id,
              error: entryError?.message || entryError,
            })
            return {
              id: entry.id,
              tokenNumber: entry.tokenNumber,
              name: entry.name,
              mobileNumber: entry.mobileNumber,
              partySize: entry.partySize,
              seatingType: entry.seatingType,
              status: entry.status,
              position: 0,
              estimatedWaitMinutes: 0,
              createdAt: entry.createdAt.toISOString(),
            }
          }
        })
      )
    } catch (enrichError: any) {
      console.error('Error enriching queue entries:', {
        error: enrichError?.message || enrichError,
      })
      enrichedEntries = queueEntries.map((entry) => ({
        id: entry.id,
        tokenNumber: entry.tokenNumber,
        name: entry.name,
        mobileNumber: entry.mobileNumber,
        partySize: entry.partySize,
        seatingType: entry.seatingType,
        status: entry.status,
        position: 0,
        estimatedWaitMinutes: 0,
        createdAt: entry.createdAt.toISOString(),
      }))
    }

    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
          <p className="mt-2 text-gray-600">Manage your restaurant queue</p>
        </div>

        <QueueDashboard initialEntries={enrichedEntries} restaurantId={restaurantId} />
      </div>
    )
  } catch (error: any) {
    console.error('Error loading admin dashboard:', {
      message: error?.message,
      cause: error?.cause,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      name: error?.name,
    })
    throw error
  }
}



