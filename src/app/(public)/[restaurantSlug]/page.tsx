import { prisma } from '@/lib/prisma'
import { getQueueStats } from '@/lib/queue-logic'
import QueueForm from '@/components/customer/QueueForm'
import { notFound } from 'next/navigation'

export default async function RestaurantQueuePage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>
}) {
  try {
    const { restaurantSlug } = await params
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
    })

    if (!restaurant) {
      notFound()
    }

    const queueStats = await getQueueStats(restaurant.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-md mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          <p className="text-base sm:text-lg text-gray-600">Join our waitlist in seconds</p>
        </div>

        {/* Queue Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-primary-100">
          <div className="text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">Current Wait</div>
            <div className="text-4xl sm:text-5xl font-bold text-primary-600 mb-3">
              {queueStats.waitingCount}
            </div>
            <div className="text-base text-gray-600 mb-1">
              {queueStats.waitingCount === 1 ? 'person' : 'people'} ahead of you
            </div>
            <div className="text-lg font-semibold text-gray-800">
              ~{queueStats.estimatedWaitTime}
            </div>
          </div>
        </div>

        {/* Queue Form */}
        <QueueForm
          restaurantSlug={restaurantSlug}
          currentQueueCount={queueStats.waitingCount}
          estimatedWaitTime={queueStats.estimatedWaitTime}
        />
      </div>
    </div>
  )
  } catch (error) {
    console.error('Error loading restaurant page:', error)
    throw error
  }
}

