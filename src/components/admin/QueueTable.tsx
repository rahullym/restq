'use client'

import { QueueEntryStatus } from '@prisma/client'
import { QueueEntryResponse } from '@/types'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface QueueTableProps {
  entries: QueueEntryResponse[]
  restaurantId: string
}

export default function QueueTable({ entries, restaurantId }: QueueTableProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  const getStatusColor = (status: QueueEntryStatus) => {
    switch (status) {
      case 'WAITING':
        return 'bg-blue-100 text-blue-800'
      case 'CALLED':
        return 'bg-yellow-100 text-yellow-800'
      case 'SEATED':
        return 'bg-green-100 text-green-800'
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const updateStatus = async (entryId: string, status: QueueEntryStatus) => {
    setUpdating(entryId)
    try {
      const response = await fetch(`/api/admin/${restaurantId}/queue/${entryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mobile
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Party Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Wait Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                No entries in queue
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.tokenNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.mobileNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.partySize}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}
                  >
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">~{entry.estimatedWaitMinutes} min</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap gap-2">
                    {entry.status === 'WAITING' && (
                      <button
                        onClick={() => updateStatus(entry.id, 'CALLED')}
                        disabled={updating === entry.id}
                        className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                      >
                        Call
                      </button>
                    )}
                    {entry.status === 'CALLED' && (
                      <>
                        <button
                          onClick={() => updateStatus(entry.id, 'SEATED')}
                          disabled={updating === entry.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Seat
                        </button>
                        <button
                          onClick={() => updateStatus(entry.id, 'NO_SHOW')}
                          disabled={updating === entry.id}
                          className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                        >
                          No Show
                        </button>
                      </>
                    )}
                    {entry.status !== 'SEATED' &&
                      entry.status !== 'NO_SHOW' &&
                      entry.status !== 'CANCELLED' && (
                        <button
                          onClick={() => updateStatus(entry.id, 'CANCELLED')}
                          disabled={updating === entry.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}


