'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Restaurant {
  restaurantId: string
  name: string
  slug: string
  role: string
}

export default function SelectRestaurantPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    if (status === 'authenticated') {
      fetchRestaurants()
    }
  }, [status, router])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/auth/restaurants')
      const data = await response.json()

      if (data.success) {
        setRestaurants(data.data)

        // Auto-select if only one restaurant
        if (data.data.length === 1) {
          await selectRestaurant(data.data[0].restaurantId)
        }
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectRestaurant = async (restaurantId: string) => {
    setSelecting(true)
    try {
      const response = await fetch('/api/auth/select-restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurantId }),
      })

      const data = await response.json()

      if (data.success) {
        // Update session with selected restaurant
        await update({ selectedRestaurantId: restaurantId })
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        alert(data.error || 'Failed to select restaurant')
        setSelecting(false)
      }
    } catch (error) {
      console.error('Error selecting restaurant:', error)
      alert('An error occurred. Please try again.')
      setSelecting(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'RESTAURANT_ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'STAFF':
        return 'bg-green-100 text-green-800'
      case 'VIEW_ONLY':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Restaurants</h2>
          <p className="text-gray-600 mb-6">
            You don't have access to any restaurants. Please contact your administrator.
          </p>
          <button
            onClick={() => router.push('/admin/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Restaurant</h2>
            <p className="text-gray-600">Choose a restaurant to manage</p>
          </div>

          <div className="space-y-3">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.restaurantId}
                onClick={() => selectRestaurant(restaurant.restaurantId)}
                disabled={selecting}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Slug: {restaurant.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                        restaurant.role
                      )}`}
                    >
                      {restaurant.role.replace('_', ' ')}
                    </span>
                    <span className="text-gray-400">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selecting && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-indigo-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span>Selecting restaurant...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
