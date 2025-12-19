'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Restaurant } from '@prisma/client'

interface SettingsFormProps {
  restaurant: Restaurant
}

export default function SettingsForm({ restaurant }: SettingsFormProps) {
  const router = useRouter()
  const [averageMinutesPerParty, setAverageMinutesPerParty] = useState(
    restaurant.averageMinutesPerParty
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/${restaurant.id}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          averageMinutesPerParty,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Settings updated successfully!')
        router.refresh()
      } else {
        setMessage(result.error || 'Failed to update settings')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCompleted = async () => {
    if (!confirm('Are you sure you want to clear completed entries older than 24 hours?')) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/${restaurant.id}/queue/clear-completed`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        setMessage('Completed entries cleared successfully!')
        router.refresh()
      } else {
        setMessage(result.error || 'Failed to clear entries')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`rounded-md p-4 ${
                message.includes('success')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <div className="text-sm">{message}</div>
            </div>
          )}

          <div>
            <label
              htmlFor="averageMinutesPerParty"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Average Minutes Per Party
            </label>
            <input
              id="averageMinutesPerParty"
              type="number"
              min="1"
              max="60"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={averageMinutesPerParty}
              onChange={(e) => setAverageMinutesPerParty(parseInt(e.target.value) || 10)}
            />
            <p className="mt-2 text-sm text-gray-500">
              This value is used to calculate estimated wait times for customers.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Queue Management</h3>
          <button
            onClick={handleClearCompleted}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Clear Completed Entries (24h+)
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Remove entries that are SEATED, NO_SHOW, or CANCELLED older than 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}





