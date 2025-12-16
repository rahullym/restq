'use client'

import { QueueEntryResponse } from '@/types'
import { QueueEntryStatus } from '@prisma/client'
import { useMemo, useState } from 'react'
import QueueTable from './QueueTable'
import CallNextButton from './CallNextButton'
import QueueFilters, { FilterState, SortState } from './QueueFilters'
import { useQueueData } from '@/hooks/useQueueData'
import { ToastContainer } from './Toast'
import { useToast } from '@/hooks/useToast'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface QueueDashboardProps {
  initialEntries: QueueEntryResponse[]
  restaurantId: string
}

export default function QueueDashboard({ initialEntries, restaurantId }: QueueDashboardProps) {
  const { entries, isLoading, updateStatus, isUpdating, callNext, isCallingNext } =
    useQueueData(restaurantId)
  const toast = useToast()

  const [filters, setFilters] = useState<FilterState>({ status: 'ALL' })
  const [sort, setSort] = useState<SortState>({ field: 'position', direction: 'asc' })
  const [search, setSearch] = useState('')

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = entries

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter((e) => e.status === filters.status)
    }

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(searchLower) ||
          e.tokenNumber.toString().includes(searchLower) ||
          e.mobileNumber.includes(searchLower)
      )
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sort.field) {
        case 'tokenNumber':
          aValue = a.tokenNumber
          bValue = b.tokenNumber
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'position':
          aValue = a.position
          bValue = b.position
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [entries, filters, sort, search])

  const waitingCount = entries.filter((e) => e.status === 'WAITING').length
  const calledCount = entries.filter((e) => e.status === 'CALLED').length
  const seatedCount = entries.filter((e) => e.status === 'SEATED').length
  const noShowCount = entries.filter((e) => e.status === 'NO_SHOW').length

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      action: () => {
        const waitingEntries = entries.filter((e) => e.status === 'WAITING')
        if (waitingEntries.length > 0) {
          callNext()
        } else {
          toast.info('No customers waiting')
        }
      },
      description: 'Call next customer',
    },
    {
      key: 'r',
      ctrl: true,
      action: () => {
        // Focus search input
        const searchInput = document.getElementById('search')
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus search',
    },
  ])

  return (
    <>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Waiting</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">{waitingCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Called</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">{calledCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Seated</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{seatedCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">No Shows</div>
            <div className="mt-2 text-3xl font-bold text-gray-600">{noShowCount}</div>
          </div>
        </div>

        {/* Filters */}
        <QueueFilters
          onFilterChange={setFilters}
          onSortChange={setSort}
          onSearchChange={setSearch}
        />

        {/* Queue Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Queue</h2>
                {isLoading && (
                  <p className="text-sm text-gray-500 mt-1">Refreshing...</p>
                )}
              </div>
              <CallNextButton
                restaurantId={restaurantId}
                onCallNext={callNext}
                isLoading={isCallingNext}
              />
            </div>
          </div>
          <div className="p-6">
            <QueueTable
              entries={filteredEntries}
              restaurantId={restaurantId}
              onUpdateStatus={updateStatus}
              isUpdating={isUpdating}
            />
          </div>
        </div>
      </div>
    </>
  )
}



