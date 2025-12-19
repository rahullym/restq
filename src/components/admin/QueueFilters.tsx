'use client'

import { QueueEntryStatus } from '@prisma/client'
import { useState } from 'react'

interface QueueFiltersProps {
  onFilterChange: (filters: FilterState) => void
  onSortChange: (sort: SortState) => void
  onSearchChange: (search: string) => void
}

export interface FilterState {
  status: QueueEntryStatus | 'ALL'
}

export interface SortState {
  field: 'tokenNumber' | 'name' | 'position' | 'createdAt'
  direction: 'asc' | 'desc'
}

export default function QueueFilters({
  onFilterChange,
  onSortChange,
  onSearchChange,
}: QueueFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({ status: 'ALL' })
  const [sort, setSort] = useState<SortState>({ field: 'position', direction: 'asc' })
  const [search, setSearch] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleStatusChange = (status: QueueEntryStatus | 'ALL') => {
    const newFilters = { ...filters, status }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (field: SortState['field']) => {
    const newSort: SortState =
      sort.field === field && sort.direction === 'asc'
        ? { field, direction: 'desc' }
        : { field, direction: 'asc' }
    setSort(newSort)
    onSortChange(newSort)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  const handleClearSearch = () => {
    setSearch('')
    onSearchChange('')
  }

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses', color: 'gray' },
    { value: 'WAITING', label: 'Waiting', color: 'blue' },
    { value: 'CALLED', label: 'Called', color: 'yellow' },
    { value: 'SEATED', label: 'Seated', color: 'green' },
    { value: 'NO_SHOW', label: 'No Show', color: 'gray' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  ]

  const sortOptions = [
    { value: 'position', label: 'Position' },
    { value: 'tokenNumber', label: 'Token Number' },
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Time Added' },
  ]

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">Filter & Search</h3>
            <p className="text-xs text-gray-500 hidden sm:block">Quickly find queue entries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(filters.status !== 'ALL' || search) && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
              Active
            </span>
          )}
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 border-t border-gray-200 pt-3 sm:pt-4">

      {/* Search Bar */}
      <div className="relative">
        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search by name, token, or mobile number..."
            className="w-full pl-14 pr-12 py-4 bg-white border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                ✕
              </div>
            </button>
          )}
        </div>
        {search && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-semibold">Searching for:</span> "{search}"
          </div>
        )}
      </div>

      {/* Status Filter Pills */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">Filter by Status</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value as QueueEntryStatus | 'ALL')}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                transition-all duration-300 transform hover:scale-105
                ${
                  filters.status === option.value
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md'
                }
              `}
            >
              <span>{option.label}</span>
              {filters.status === option.value && (
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Sort By</label>
          <div className="grid grid-cols-2 gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value as SortState['field'])}
                className={`
                  flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm
                  transition-all duration-300 transform hover:scale-105
                  ${
                    sort.field === option.value
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Direction */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Order</label>
          <button
            onClick={() =>
              setSort((s) => {
                const newSort = { ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' } as SortState
                onSortChange(newSort)
                return newSort
              })
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <span>
              {sort.direction === 'asc' ? 'Ascending' : 'Descending'}
            </span>
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.status !== 'ALL' || search) && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Active filters:</span>{' '}
              {filters.status !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold mr-2">
                  Status: {filters.status}
                  <button onClick={() => handleStatusChange('ALL')} className="hover:text-indigo-900">✕</button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-semibold">
                  Search: {search}
                  <button onClick={handleClearSearch} className="hover:text-purple-900">✕</button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                handleStatusChange('ALL')
                handleClearSearch()
              }}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  )
}



