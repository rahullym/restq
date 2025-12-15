'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QueueEntryResponse } from '@/types'
import { QueueEntryStatus } from '@prisma/client'
import { useToast } from './useToast'

interface QueueDataResponse {
  entries: QueueEntryResponse[]
  restaurantId: string
}

export function useQueueData(restaurantId: string) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<QueueDataResponse>({
    queryKey: ['queue', restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/${restaurantId}/queue`)
      if (!response.ok) {
        throw new Error('Failed to fetch queue data')
      }
      const result = await response.json()
      return {
        entries: result.data || [],
        restaurantId,
      }
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    refetchIntervalInBackground: true,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      entryId,
      status,
    }: {
      entryId: string
      status: QueueEntryStatus
    }) => {
      const response = await fetch(`/api/admin/${restaurantId}/queue/${entryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to update status')
      }
      return result.data
    },
    onMutate: async ({ entryId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['queue', restaurantId] })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<QueueDataResponse>(['queue', restaurantId])

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<QueueDataResponse>(['queue', restaurantId], {
          ...previousData,
          entries: previousData.entries.map((entry) =>
            entry.id === entryId ? { ...entry, status } : entry
          ),
        })
      }

      return { previousData, entryId }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['queue', restaurantId], context.previousData)
      }
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    },
    onSuccess: (data, variables) => {
      toast.success(`Status updated to ${variables.status}`)
      // Refetch to get accurate position/wait time
      queryClient.invalidateQueries({ queryKey: ['queue', restaurantId] })
    },
  })

  const callNextMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/${restaurantId}/queue/call-next`, {
        method: 'POST',
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to call next customer')
      }
      return result.data
    },
    onSuccess: (data) => {
      toast.success(`Called customer ${data.tokenNumber}`)
      queryClient.invalidateQueries({ queryKey: ['queue', restaurantId] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to call next customer')
    },
  })

  return {
    entries: data?.entries || [],
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: (entryId: string) => {
      return updateStatusMutation.isPending && updateStatusMutation.variables?.entryId === entryId
    },
    callNext: callNextMutation.mutate,
    callNextAsync: callNextMutation.mutateAsync,
    isCallingNext: callNextMutation.isPending,
  }
}
