import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
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

export interface AgentBuilderPayload {
  name: string
  description?: string
  avatar_url?: string
  appearance?: { primary?: string; background?: string }
  status?: 'draft' | 'published' | 'unpublished'
}

export interface AgentDetailResponse {
  id: string
  name: string
  description?: string
  avatar_url?: string
  appearance?: { primary?: string; background?: string }
  status: 'draft' | 'published' | 'unpublished'
  url_token?: string
  created_at: string
  updated_at: string
  fields?: Array<{
    id?: string
    type: string
    label: string
    validation_rules?: Record<string, unknown>
    order: number
    conditional_logic?: unknown
    required?: boolean
  }>
  persona?: { name?: string; instructions?: string; tone?: string }
  contextual_docs?: Array<{ id: string; type: string; content?: string }>
  publish_settings?: {
    url_token?: string
    expiry?: string
    password?: string
    webhook_url?: string
    webhook_headers?: Record<string, string>
  }
}

export async function fetchAgent(id: string): Promise<AgentDetailResponse> {
  return apiGet<AgentDetailResponse>(`/agents/${id}`)
}

export async function updateAgent(
  id: string,
  body: AgentBuilderPayload
): Promise<AgentDetailResponse> {
  return apiPut<AgentDetailResponse>(`/agents/${id}`, body)
}

export async function upsertFields(
  agentId: string,
  fields: Array<{
    id?: string
    type: string
    label: string
    validation_rules?: Record<string, unknown>
    order: number
    conditional_logic?: unknown
    required?: boolean
  }>
): Promise<{ fields: AgentDetailResponse['fields'] }> {
  return apiPut<{ fields: AgentDetailResponse['fields'] }>(
    `/agents/${agentId}/fields`,
    { fields }
  )
}

export async function updatePersona(
  agentId: string,
  body: { name?: string; instructions?: string; tone?: string }
): Promise<AgentDetailResponse['persona']> {
  return apiPut<AgentDetailResponse['persona']>(
    `/agents/${agentId}/persona`,
    body
  )
}

export async function addContextualDoc(
  agentId: string,
  body: { type: string; content?: string; url?: string }
): Promise<{ id: string }> {
  return apiPost<{ id: string }>(`/agents/${agentId}/contextual-docs`, body)
}

export async function updatePublishSettings(
  agentId: string,
  body: {
    url_token?: string
    expiry?: string
    password?: string
    webhook_url?: string
    webhook_headers?: Record<string, string>
  }
): Promise<AgentDetailResponse['publish_settings']> {
  return apiPut<AgentDetailResponse['publish_settings']>(
    `/agents/${agentId}/publish-settings`,
    body
  )
}
