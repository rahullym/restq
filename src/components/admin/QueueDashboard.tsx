'use client'

import { QueueEntryResponse } from '@/types'
import { QueueEntryStatus } from '@prisma/client'
import { useMemo, useState, useEffect } from 'react'
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
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [activeTab, setActiveTab] = useState<'ALL' | 'WAITING' | 'CALLED'>('WAITING')
  const [prevCounts, setPrevCounts] = useState({ waiting: 0, called: 0, seated: 0, noShow: 0 })

  // Handle tab change
  const handleTabChange = (tab: 'ALL' | 'WAITING' | 'CALLED') => {
    setActiveTab(tab)
    if (tab === 'ALL') {
      setFilters({ status: 'ALL' })
    } else {
      setFilters({ status: tab })
    }
  }

  // Sync active tab when filter changes from filter panel
  useEffect(() => {
    if (filters.status === 'WAITING' || filters.status === 'CALLED') {
      setActiveTab(filters.status)
    } else if (filters.status === 'ALL') {
      setActiveTab('ALL')
    }
  }, [filters.status])

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = entries

    // Status filter (from tabs or filter panel)
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

  // Track count changes for animations
  useEffect(() => {
    setPrevCounts({ waiting: waitingCount, called: calledCount, seated: seatedCount, noShow: noShowCount })
  }, [waitingCount, calledCount, seatedCount, noShowCount])

  // Calculate average wait time
  const avgWaitTime = useMemo(() => {
    const waitingEntries = entries.filter((e) => e.status === 'WAITING')
    if (waitingEntries.length === 0) return 0
    const total = waitingEntries.reduce((sum, e) => sum + e.estimatedWaitMinutes, 0)
    return Math.round(total / waitingEntries.length)
  }, [entries])

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
        const searchInput = document.getElementById('search')
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus search',
    },
    {
      key: '?',
      ctrl: false,
      action: () => {
        setShowShortcuts(!showShortcuts)
      },
      description: 'Toggle shortcuts',
    },
  ])

  const StatCard = ({ title, count, icon, color }: any) => {
    return (
      <div className={`${color} rounded-xl shadow-lg p-3 sm:p-4 transition-shadow`}>
        <div className="text-center">
          <div className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            {count}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-white/95">{title}</div>
          {waitingCount > 0 && title === 'Waiting' && (
            <div className="mt-1 sm:mt-2 text-xs text-white/80 hidden sm:block">
              Avg {avgWaitTime} min
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
      
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Call next customer</span>
                <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-md font-mono text-sm">Ctrl + N</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Focus search</span>
                <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-md font-mono text-sm">Ctrl + R</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Toggle shortcuts</span>
                <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-md font-mono text-sm">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Help Button - Hidden on Mobile for Simplicity */}
        <div className="hidden sm:flex justify-end">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs hover:bg-gray-700 transition-colors"
          >
            <span>⌨️</span>
            <span>Shortcuts</span>
          </button>
        </div>

        {/* Stats Cards - All in One Row */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            title="Waiting"
            count={waitingCount}
            icon="⏳"
            color="bg-blue-600"
          />
          <StatCard
            title="Called"
            count={calledCount}
            icon="📢"
            color="bg-yellow-500"
          />
          <StatCard
            title="Seated"
            count={seatedCount}
            icon="✅"
            color="bg-green-600"
          />
          <StatCard
            title="No Shows"
            count={noShowCount}
            icon="❌"
            color="bg-gray-600"
          />
        </div>

        {/* Live Activity Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <span className="text-blue-700 font-medium">Live updating...</span>
          </div>
        )}

        {/* Filters */}
        <QueueFilters
          onFilterChange={setFilters}
          onSortChange={setSort}
          onSearchChange={setSearch}
        />

        {/* Queue Table - Maximum Space */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  Q
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Queue Management</h2>
                  <p className="text-xs text-gray-500">{filteredEntries.length} entries</p>
                </div>
              </div>
              <CallNextButton
                restaurantId={restaurantId}
                onCallNext={callNext}
                isLoading={isCallingNext}
              />
            </div>
            
            {/* Tabs */}
            <div className="mt-2 sm:mt-3 border-b border-gray-200">
              <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => handleTabChange('WAITING')}
                  className={`
                    px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                    ${
                      activeTab === 'WAITING'
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  Waiting ({waitingCount})
                </button>
                <button
                  onClick={() => handleTabChange('CALLED')}
                  className={`
                    px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                    ${
                      activeTab === 'CALLED'
                        ? 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  Called ({calledCount})
                </button>
                <button
                  onClick={() => handleTabChange('ALL')}
                  className={`
                    px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap
                    ${
                      activeTab === 'ALL'
                        ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  All ({entries.length})
                </button>
              </nav>
            </div>
          </div>
          <div className="p-2 sm:p-4">
            <QueueTable
              entries={filteredEntries}
              restaurantId={restaurantId}
              onUpdateStatus={updateStatus}
              isUpdating={isUpdating}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}





