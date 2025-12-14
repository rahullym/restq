import { prisma } from '@/lib/prisma'
import { getPositionInQueue, calculateWaitTime } from '@/lib/queue-logic'
import QueueStatus from '@/components/customer/QueueStatus'
import { notFound } from 'next/navigation'

export default async function QueueSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string }>
  searchParams: Promise<{ entryId?: string }>
}) {
  const { restaurantSlug } = await params
  const { entryId } = await searchParams
  
  if (!entryId) {
    notFound()
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  })

  if (!restaurant) {
    notFound()
  }

  const queueEntry = await prisma.queueEntry.findUnique({
    where: { id: entryId },
  })

  if (!queueEntry || queueEntry.restaurantId !== restaurant.id) {
    notFound()
  }

  const position = await getPositionInQueue(queueEntry.id, restaurant.id)
  const waitTime = calculateWaitTime(
    Math.max(0, position - 1),
    restaurant.averageMinutesPerParty
  )

  let message = ''
  if (queueEntry.status === 'SEATED') {
    message = 'You have been seated!'
  } else if (queueEntry.status === 'CALLED') {
    message = 'Your table is ready! Please proceed to the entrance.'
  } else if (queueEntry.status === 'NO_SHOW' || queueEntry.status === 'CANCELLED') {
    message = 'This entry has been cancelled.'
  } else {
    message = `You are ${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'} in line.`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 pb-20">
      <div className="max-w-md mx-auto px-4 pt-4 sm:pt-6">
        {/* Compact Success Header - Mobile Optimized */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-3 animate-bounce">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 leading-tight">You're in the Queue!</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">{restaurant.name}</p>
        </div>

        {/* Queue Status - Mobile Optimized */}
        <QueueStatus
          entryId={entryId}
          restaurantSlug={restaurantSlug}
          initialData={{
            tokenNumber: queueEntry.tokenNumber,
            position,
            estimatedWaitMinutes: waitTime.minutes,
            status: queueEntry.status,
            message,
          }}
        />
      </div>
    </div>
  )
}

