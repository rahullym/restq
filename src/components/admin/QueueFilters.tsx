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

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">
      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          id="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, token, or mobile..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value as QueueEntryStatus | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="ALL">All</option>
            <option value="WAITING">Waiting</option>
            <option value="CALLED">Called</option>
            <option value="SEATED">Seated</option>
            <option value="NO_SHOW">No Show</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sort.field}
            onChange={(e) => handleSortChange(e.target.value as SortState['field'])}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="position">Position</option>
            <option value="tokenNumber">Token Number</option>
            <option value="name">Name</option>
            <option value="createdAt">Created At</option>
          </select>
        </div>

        {/* Sort Direction Indicator */}
        <div className="flex items-end">
          <button
            onClick={() =>
              setSort((s) => ({ ...s, direction: s.direction === 'asc' ? 'desc' : 'asc' }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            title="Toggle sort direction"
          >
            {sort.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  )
}

