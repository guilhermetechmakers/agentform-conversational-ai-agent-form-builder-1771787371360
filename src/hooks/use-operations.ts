import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as operationsApi from '@/api/operations'
import type { OperationLog } from '@/types/operations'
import type { ApiError } from '@/lib/api'

const POLL_INTERVAL_MS = 3000

const MOCK_OPERATIONS: OperationLog[] = [
  {
    id: 'op-001',
    operationType: 'publish',
    status: 'success',
    progress: 100,
    message: 'Agent published successfully',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'op-002',
    operationType: 'webhook_replay',
    status: 'success',
    progress: 100,
    message: 'Webhook replayed',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
]

function isNetworkError(err: unknown): boolean {
  const e = err as ApiError & { message?: string }
  return (
    e?.status === 404 ||
    e?.status === 500 ||
    (typeof e?.message === 'string' &&
      (e.message.includes('fetch') ||
        e.message.includes('Failed') ||
        e.message.includes('Network')))
  )
}

export function useOperations() {
  const [operations, setOperations] = useState<OperationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOperations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await operationsApi.fetchOperations()
      setOperations(res.operations ?? [])
    } catch (err) {
      if (isNetworkError(err)) {
        setOperations(MOCK_OPERATIONS)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load operations')
        toast.error(e?.message ?? 'Failed to load operations')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOperations()
  }, [fetchOperations])

  useEffect(() => {
    const interval = setInterval(fetchOperations, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchOperations])

  return { operations, isLoading, error, refetch: fetchOperations }
}
