import { apiGet, apiPost, apiPatch } from '@/lib/api'
import type {
  SessionsListResponse,
  SessionsListParams,
  SessionDetailResponse,
  SessionExportResponse,
  BulkActionRequest,
} from '@/types/sessions'

/** LLM Orchestration API - Create session (POST /api/sessions) */
export interface CreateSessionRequest {
  agentId: string
}

export interface CreateSessionResponse {
  sessionId: string
  status: 'active'
}

export async function createSession(
  body: CreateSessionRequest
): Promise<CreateSessionResponse> {
  return apiPost<CreateSessionResponse>('/sessions', body)
}

/** Get session messages (GET /api/sessions/:sessionId/messages) */
export interface SessionMessagesResponse {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }>
}

export async function getSessionMessages(
  sessionId: string
): Promise<SessionMessagesResponse> {
  return apiGet<SessionMessagesResponse>(`/sessions/${sessionId}/messages`)
}

/** Send message (POST /api/sessions/:sessionId/message) */
export interface SendSessionMessageRequest {
  content: string
}

export interface SendSessionMessageResponse {
  status: 'success'
  nextPrompt?: string
}

export async function sendSessionMessage(
  sessionId: string,
  body: SendSessionMessageRequest
): Promise<SendSessionMessageResponse> {
  return apiPost<SendSessionMessageResponse>(
    `/sessions/${sessionId}/message`,
    body
  )
}

export async function fetchSessions(
  params?: SessionsListParams
): Promise<SessionsListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set('search', params.search)
  if (params?.agent_id) searchParams.set('agent_id', params.agent_id)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.tag) searchParams.set('tag', params.tag)
  if (params?.date_from) searchParams.set('date_from', params.date_from)
  if (params?.date_to) searchParams.set('date_to', params.date_to)
  if (params?.field_name) searchParams.set('field_name', params.field_name)
  if (params?.field_value) searchParams.set('field_value', params.field_value)
  if (params?.sort) searchParams.set('sort', params.sort)
  if (params?.order) searchParams.set('order', params.order)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.page_size) searchParams.set('page_size', String(params.page_size))

  const query = searchParams.toString()
  const path = `/sessions${query ? `?${query}` : ''}`
  return apiGet<SessionsListResponse>(path)
}

export async function fetchSession(id: string): Promise<SessionDetailResponse> {
  return apiGet<SessionDetailResponse>(`/sessions/${id}`)
}

export async function exportSession(
  id: string,
  format: 'csv' | 'json'
): Promise<SessionExportResponse> {
  return apiPost<SessionExportResponse>(
    `/sessions/${id}/actions/export`,
    { format }
  )
}

export async function replayWebhook(id: string): Promise<{ status: string }> {
  return apiPost<{ status: string }>(
    `/sessions/${id}/actions/webhook-replay`
  )
}

export async function bulkSessionsAction(
  payload: BulkActionRequest
): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/sessions/bulk-actions', payload)
}

export async function markSessionReviewed(
  id: string,
  reviewed: boolean
): Promise<void> {
  return apiPatch<void>(`/sessions/${id}`, { reviewed })
}

export async function addSessionComment(
  id: string,
  commentText: string
): Promise<{ id: string }> {
  return apiPost<{ id: string }>(`/sessions/${id}/comments`, {
    comment_text: commentText,
  })
}

export async function forwardSessionToEmail(
  id: string,
  email: string
): Promise<void> {
  return apiPost<void>(`/sessions/${id}/actions/forward`, { email })
}
