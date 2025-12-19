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
    entryName: string
  } | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

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

  const getStatusIcon = (status: QueueEntryStatus) => {
    return ''
  }

  const handleStatusUpdate = (entryId: string, status: QueueEntryStatus, entryName: string) => {
    // For destructive actions, show confirmation
    if (status === 'CANCELLED' || status === 'NO_SHOW') {
      setConfirmingAction({ entryId, status, entryName })
    } else {
      onUpdateStatus({ entryId, status })
    }
  }

  const confirmAction = () => {
    if (confirmingAction) {
      onUpdateStatus({ entryId: confirmingAction.entryId, status: confirmingAction.status })
      setConfirmingAction(null)
    }
  }

  const cancelAction = () => {
    setConfirmingAction(null)
  }

  const isEntryUpdating = (entryId: string) => {
    return isUpdating ? isUpdating(entryId) : false
  }

  const getWaitTimeColor = (minutes: number) => {
    if (minutes <= 15) return 'text-green-600'
    if (minutes <= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <>
      {/* Enhanced Confirmation Dialog */}
      {confirmingAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={cancelAction}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-slide-up transform" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-gray-600">
                Are you sure you want to mark <strong className="text-gray-900">{confirmingAction.entryName}</strong> as{' '}
                <strong className="text-red-600">{confirmingAction.status}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelAction}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-all transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all transform hover:scale-105 ${
                  confirmingAction.status === 'CANCELLED'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg shadow-gray-500/50'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 font-medium">No entries in queue</p>
            <p className="text-xs text-gray-400 mt-1">New customers will appear here</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout - Simple & Easy */}
            <div className="md:hidden space-y-4 p-3">
              {entries.map((entry) => {
                const updating = isEntryUpdating(entry.id)
                return (
                  <div
                    key={entry.id}
                    className={`
                      bg-white rounded-xl border-2 p-5 shadow-md
                      ${updating ? 'opacity-60' : 'opacity-100'}
                      ${entry.status === 'WAITING' && entry.position === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    `}
                  >
                    {/* Token Number - Large & Clear */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl font-bold text-gray-900 font-mono">
                          {entry.tokenNumber}
                        </div>
                        {entry.status === 'WAITING' && entry.position === 1 && (
                          <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full font-bold">NEXT</span>
                        )}
                      </div>
                      <div className="text-base font-semibold text-gray-700">{entry.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{entry.mobileNumber}</div>
                    </div>

                    {/* Simple Info Row */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Party Size</div>
                        <div className="text-xl font-bold text-gray-900">{entry.partySize}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Position</div>
                        <div className="text-xl font-bold text-gray-900">#{entry.position}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Wait Time</div>
                        <div className={`text-xl font-bold ${getWaitTimeColor(entry.estimatedWaitMinutes)}`}>
                          {entry.estimatedWaitMinutes}m
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-lg ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>

                    {/* Action Buttons - Large & Simple */}
                    <div className="space-y-2">
                      {entry.status === 'WAITING' && (
                        <button
                          onClick={() => handleStatusUpdate(entry.id, 'CALLED', entry.name)}
                          disabled={updating}
                          className="w-full px-4 py-4 text-base font-bold text-yellow-900 bg-yellow-200 rounded-xl hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                        >
                          {updating ? 'Updating...' : '📞 Call Customer'}
                        </button>
                      )}
                      {entry.status === 'CALLED' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(entry.id, 'SEATED', entry.name)}
                            disabled={updating}
                            className="w-full px-4 py-4 text-base font-bold text-green-900 bg-green-200 rounded-xl hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                          >
                            {updating ? 'Updating...' : '✅ Seat Customer'}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(entry.id, 'NO_SHOW', entry.name)}
                            disabled={updating}
                            className="w-full px-4 py-4 text-base font-bold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                          >
                            {updating ? 'Updating...' : '❌ No Show'}
                          </button>
                        </>
                      )}
                      {entry.status !== 'SEATED' &&
                        entry.status !== 'NO_SHOW' &&
                        entry.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleStatusUpdate(entry.id, 'CANCELLED', entry.name)}
                            disabled={updating}
                            className="w-full px-4 py-4 text-base font-bold text-red-700 bg-red-100 rounded-xl hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                          >
                            {updating ? 'Updating...' : '🚫 Cancel'}
                          </button>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table Layout */}
            <table className="min-w-full hidden md:table">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Token
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Party
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Wait Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {entries.map((entry, index) => {
                const updating = isEntryUpdating(entry.id)
                const isExpanded = expandedRow === entry.id
                const isHovered = hoveredRow === entry.id
                
                return (
                  <tr
                    key={entry.id}
                    className={`
                      transition-colors duration-200
                      ${updating ? 'opacity-60 bg-gray-50' : 'opacity-100'}
                      ${isHovered ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${entry.status === 'WAITING' && entry.position === 1 ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    `}
                    onMouseEnter={() => setHoveredRow(entry.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-base sm:text-lg font-bold text-gray-900 font-mono">
                          {entry.tokenNumber}
                        </div>
                        {entry.status === 'WAITING' && entry.position === 1 && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-bold">NEXT</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{entry.name}</div>
                          <div className="text-xs text-gray-600">{entry.seatingType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {entry.mobileNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900 font-semibold">
                        <span>{entry.partySize}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg ${getStatusColor(entry.status)}`}
                      >
                        <span>{entry.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900">#{entry.position}</div>
                        {entry.status === 'WAITING' && entry.position <= 3 && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md font-semibold">
                            Top {entry.position}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${getWaitTimeColor(entry.estimatedWaitMinutes)}`}>
                        ~{entry.estimatedWaitMinutes} min
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex flex-row gap-2 flex-nowrap">
                        {entry.status === 'WAITING' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(entry.id, 'CALLED', entry.name) }}
                            disabled={updating}
                            className="px-4 py-2 text-sm text-yellow-800 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold border border-yellow-300 shadow-sm whitespace-nowrap"
                          >
                            {updating ? 'Updating...' : 'Call'}
                          </button>
                        )}
                        {entry.status === 'CALLED' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(entry.id, 'SEATED', entry.name) }}
                              disabled={updating}
                              className="px-4 py-2 text-sm text-green-800 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold border border-green-300 shadow-sm whitespace-nowrap"
                            >
                              {updating ? 'Updating...' : 'Seat'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(entry.id, 'NO_SHOW', entry.name) }}
                              disabled={updating}
                              className="px-4 py-2 text-sm text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold border border-gray-300 shadow-sm whitespace-nowrap"
                            >
                              {updating ? 'Updating...' : 'No Show'}
                            </button>
                          </>
                        )}
                        {entry.status !== 'SEATED' &&
                          entry.status !== 'NO_SHOW' &&
                          entry.status !== 'CANCELLED' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(entry.id, 'CANCELLED', entry.name) }}
                              disabled={updating}
                              className="px-4 py-2 text-sm text-red-800 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold border border-red-300 shadow-sm whitespace-nowrap"
                            >
                              {updating ? 'Updating...' : 'Cancel'}
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </>
        )}
      </div>
    </>
  )
}





