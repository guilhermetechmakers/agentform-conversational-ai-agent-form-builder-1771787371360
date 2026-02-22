import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as sessionsApi from '@/api/sessions'
import type {
  SessionsListResponse,
  SessionsListParams,
  SessionDetailResponse,
  SessionListItem,
} from '@/types/sessions'
import type { ApiError } from '@/lib/api'

const MOCK_SESSIONS: SessionListItem[] = [
  {
    id: 'sess-001',
    agent_id: '1',
    agent_name: 'Lead Capture',
    visitor_identifier: 'user@example.com',
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    extracted_fields_summary: { email: 'user@example.com', name: 'John Doe' },
    tags: ['lead'],
    transcript_snippet: 'Hi! I\'d love to capture your details. What\'s your email? — user@example.com — Thanks! And your name? — John Doe',
  },
  {
    id: 'sess-002',
    agent_id: '1',
    agent_name: 'Lead Capture',
    visitor_identifier: null,
    status: 'incomplete',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    extracted_fields_summary: { email: 'partial@test.com' },
    tags: [],
    transcript_snippet: 'What\'s your email? — partial@test.com — Thanks! Please complete the form...',
  },
  {
    id: 'sess-003',
    agent_id: '2',
    agent_name: 'Product Feedback',
    visitor_identifier: 'feedback@company.com',
    status: 'completed',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    extracted_fields_summary: {
      rating: '5',
      feedback: 'Great product!',
      email: 'feedback@company.com',
    },
    tags: ['feedback'],
    transcript_snippet: 'How would you rate our product? — 5 — Any feedback? — Great product!',
  },
]

const MOCK_SESSION_DETAIL: SessionDetailResponse = {
  id: 'sess-001',
  agent_id: '1',
  agent_name: 'Lead Capture',
  visitor_identifier: 'user@example.com',
  status: 'completed',
  created_at: MOCK_SESSIONS[0].created_at,
  updated_at: new Date().toISOString(),
  transcript: [
    {
      message_id: 'm1',
      sender: 'agent',
      content: 'Hi! I\'d love to capture your details. What\'s your email?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      message_id: 'm2',
      sender: 'user',
      content: 'user@example.com',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
    },
    {
      message_id: 'm3',
      sender: 'agent',
      content: 'Thanks! And your name?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 35000).toISOString(),
    },
    {
      message_id: 'm4',
      sender: 'user',
      content: 'John Doe',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 40000).toISOString(),
    },
  ],
  extracted_fields: [
    { id: 'f1', field_name: 'email', field_value: 'user@example.com' },
    { id: 'f2', field_name: 'name', field_value: 'John Doe' },
  ],
  metadata: {
    ip: '192.168.1.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    referrer: 'https://example.com/landing',
  },
  tags: ['lead'],
  comments: [],
  reviewed: false,
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

export function useSessions(params: SessionsListParams = {}) {
  const [data, setData] = useState<SessionsListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await sessionsApi.fetchSessions(params)
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        const page = params.page ?? 1
        const pageSize = params.page_size ?? 10
        const start = (page - 1) * pageSize
        const paginated = MOCK_SESSIONS.slice(start, start + pageSize)
        setData({
          sessions: paginated,
          total: MOCK_SESSIONS.length,
          page,
          page_size: pageSize,
          has_more: start + paginated.length < MOCK_SESSIONS.length,
        })
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load sessions')
        toast.error(e?.message ?? 'Failed to load sessions')
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    params.search,
    params.agent_id,
    params.status,
    params.tag,
    params.date_from,
    params.date_to,
    params.field_name,
    params.field_value,
    params.sort,
    params.order,
    params.page,
    params.page_size,
  ])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return { data, isLoading, error, refetch: fetchSessions }
}

export function useSession(id: string | null) {
  const [data, setData] = useState<SessionDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(() => {
    if (!id) {
      setData(null)
      setError(null)
      return
    }
    let cancelled = false
    setData(null)
    setError(null)
    setIsLoading(true)
    sessionsApi
      .fetchSession(id)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (isNetworkError(err) && !cancelled) {
          setData({ ...MOCK_SESSION_DETAIL, id })
        } else if (!cancelled) {
          const e = err as ApiError
          setError(e?.message ?? 'Failed to load session')
          toast.error(e?.message ?? 'Failed to load session')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    queueMicrotask(() => fetchSession())
  }, [fetchSession])

  return { data, isLoading, error, refetch: fetchSession }
}
