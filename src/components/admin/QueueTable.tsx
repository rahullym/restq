'use client'

import { QueueEntryStatus } from '@prisma/client'
import { QueueEntryResponse } from '@/types'
import { useState } from 'react'

interface QueueTableProps {
  entries: QueueEntryResponse[]
  restaurantId: string
  onUpdateStatus: (params: { entryId: string; status: QueueEntryStatus }) => void
  isUpdating?: (entryId: string) => boolean
}

export default function QueueTable({
  entries,
  restaurantId,
  onUpdateStatus,
  isUpdating,
}: QueueTableProps) {
  const [confirmingAction, setConfirmingAction] = useState<{
    entryId: string
    status: QueueEntryStatus
  } | null>(null)

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

  const handleStatusUpdate = (entryId: string, status: QueueEntryStatus) => {
    // For destructive actions, show confirmation
    if (status === 'CANCELLED' || status === 'NO_SHOW') {
      setConfirmingAction({ entryId, status })
    } else {
      onUpdateStatus({ entryId, status })
    }
  }

  const confirmAction = () => {
    if (confirmingAction) {
      onUpdateStatus(confirmingAction)
      setConfirmingAction(null)
    }
  }

  const cancelAction = () => {
    setConfirmingAction(null)
  }

  const isEntryUpdating = (entryId: string) => {
    return isUpdating ? isUpdating(entryId) : false
  }

  return (
    <>
      {/* Confirmation Dialog */}
      {confirmingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to mark this entry as{' '}
              <strong>{confirmingAction.status}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelAction}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-md ${
                  confirmingAction.status === 'CANCELLED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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
                  No entries found
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const updating = isEntryUpdating(entry.id)
                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      updating ? 'opacity-60' : ''
                    }`}
                  >
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
                            onClick={() => handleStatusUpdate(entry.id, 'CALLED')}
                            disabled={updating}
                            className="px-3 py-1 text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {updating ? '...' : 'Call'}
                          </button>
                        )}
                        {entry.status === 'CALLED' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(entry.id, 'SEATED')}
                              disabled={updating}
                              className="px-3 py-1 text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {updating ? '...' : 'Seat'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(entry.id, 'NO_SHOW')}
                              disabled={updating}
                              className="px-3 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {updating ? '...' : 'No Show'}
                            </button>
                          </>
                        )}
                        {entry.status !== 'SEATED' &&
                          entry.status !== 'NO_SHOW' &&
                          entry.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleStatusUpdate(entry.id, 'CANCELLED')}
                              disabled={updating}
                              className="px-3 py-1 text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {updating ? '...' : 'Cancel'}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}


