import { apiGet, apiPost, apiDelete } from '@/lib/api'
import type {
  AgentsListResponse,
  AgentsListParams,
  QuickStats,
  AgentListItem,
} from '@/types/agents'

export async function fetchAgents(
  params?: AgentsListParams
): Promise<AgentsListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set('search', params.search)
  if (params?.status) searchParams.set('filter', params.status)
  if (params?.tag) searchParams.set('tag', params.tag)
  if (params?.sort) searchParams.set('sort', params.sort)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.page_size) searchParams.set('page_size', String(params.page_size))

  const query = searchParams.toString()
  const path = `/agents${query ? `?${query}` : ''}`
  return apiGet<AgentsListResponse>(path)
}

export async function fetchQuickStats(): Promise<QuickStats> {
  return apiGet<QuickStats>('/stats/quick')
}

export async function createAgent(body: {
  name: string
  avatar_url?: string
}): Promise<{ id: string; name: string }> {
  return apiPost<{ id: string; name: string }>('/agents', body)
}

export async function deleteAgent(id: string): Promise<void> {
  return apiDelete<void>(`/agents/${id}`)
}

export async function duplicateAgent(id: string): Promise<AgentListItem> {
  return apiPost<AgentListItem>(`/agents/${id}/duplicate`)
}
