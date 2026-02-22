import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as agentsApi from '@/api/agents'
import type {
  AgentsListResponse,
  AgentsListParams,
  QuickStats,
  AgentListItem,
} from '@/types/agents'
import type { ApiError } from '@/lib/api'

const MOCK_AGENTS: AgentListItem[] = [
  {
    id: '1',
    name: 'Lead Capture',
    status: 'Published',
    sessions_count: 142,
    conversion_rate: 68,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['lead-capture'],
  },
  {
    id: '2',
    name: 'Product Feedback',
    status: 'On Progress',
    sessions_count: 28,
    conversion_rate: 45,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['feedback'],
  },
  {
    id: '3',
    name: 'Customer Support',
    status: 'Unpublished',
    sessions_count: 0,
    conversion_rate: 0,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['support'],
  },
]

const MOCK_STATS: QuickStats = {
  total_sessions: 170,
  completion_rate: 56,
  webhook_delivery_rate: 92,
  period: '30d',
}

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

export function useAgents(params: AgentsListParams = {}) {
  const [data, setData] = useState<AgentsListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await agentsApi.fetchAgents(params)
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData({
          agents: MOCK_AGENTS,
          total: MOCK_AGENTS.length,
          page: 1,
          page_size: 12,
          has_more: false,
        })
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load agents')
        toast.error(e?.message ?? 'Failed to load agents')
      }
    } finally {
      setIsLoading(false)
    }
  }, [params.search, params.status, params.tag, params.sort, params.page, params.page_size])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return { data, isLoading, error, refetch: fetchAgents }
}

export function useQuickStats() {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    agentsApi
      .fetchQuickStats()
      .then((res) => {
        if (!cancelled) setStats(res)
      })
      .catch(() => {
        if (!cancelled) setStats(MOCK_STATS)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, isLoading }
}
