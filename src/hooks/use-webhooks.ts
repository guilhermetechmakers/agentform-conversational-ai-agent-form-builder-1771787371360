import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as webhooksApi from '@/api/webhooks'
import type {
  WebhookConfig,
  WebhookLog,
  WebhookLogsParams,
  WebhookLogsResponse,
} from '@/types/webhooks'
import type { ApiError } from '@/lib/api'

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

const MOCK_WEBHOOKS: WebhookConfig[] = []

const MOCK_LOGS: WebhookLog[] = [
  {
    id: 'log-1',
    webhook_id: 'wh-1',
    webhook_url: 'https://example.com/webhook',
    agent_name: 'Lead Capture',
    status: 'success',
    attempts: 1,
    last_attempt_at: new Date(Date.now() - 3600000).toISOString(),
    response_code: 200,
    response_body: null,
    event_type: 'session_completed',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log-2',
    webhook_id: 'wh-1',
    webhook_url: 'https://failed.example.com/webhook',
    agent_name: 'Product Feedback',
    status: 'failed',
    attempts: 3,
    last_attempt_at: new Date(Date.now() - 7200000).toISOString(),
    response_code: 500,
    response_body: 'Internal Server Error',
    event_type: 'session_completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

/** Fetch all webhook configs or by agent */
export function useWebhookConfigs(agentId?: string) {
  const [data, setData] = useState<WebhookConfig[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = agentId
        ? await webhooksApi.fetchWebhooksByAgent(agentId)
        : await webhooksApi.fetchAllWebhooks()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_WEBHOOKS)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load webhooks')
        toast.error(e?.message ?? 'Failed to load webhooks')
      }
    } finally {
      setIsLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  return { data, isLoading, error, refetch: fetchWebhooks }
}

export function useAgentWebhooks(agentId: string | null) {
  const [data, setData] = useState<WebhookConfig[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
    if (!agentId) {
      setData([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await webhooksApi.fetchWebhooksByAgent(agentId)
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_WEBHOOKS)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load webhooks')
        toast.error(e?.message ?? 'Failed to load webhooks')
      }
    } finally {
      setIsLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  return { data, isLoading, error, refetch: fetchWebhooks }
}

export function useWebhookLogs(params: WebhookLogsParams = {}) {
  const [data, setData] = useState<WebhookLogsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await webhooksApi.fetchWebhookLogs(params)
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData({
          logs: MOCK_LOGS,
          total: MOCK_LOGS.length,
          page: 1,
          page_size: 10,
          has_more: false,
        })
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load webhook logs')
        toast.error(e?.message ?? 'Failed to load webhook logs')
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    params.agent_id,
    params.status,
    params.from_date,
    params.to_date,
    params.event_type,
    params.page,
    params.page_size,
  ])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { data, isLoading, error, refetch: fetchLogs }
}
