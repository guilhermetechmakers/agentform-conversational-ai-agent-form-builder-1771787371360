import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import type {
  WebhookConfig,
  WebhookLogsParams,
  WebhookLogsResponse,
  CreateWebhookRequest,
  ReplayWebhookRequest,
} from '@/types/webhooks'

/** Create a new webhook configuration */
export async function createWebhook(
  body: CreateWebhookRequest
): Promise<{ webhook_id: string }> {
  return apiPost<{ webhook_id: string }>('/webhooks', body)
}

/** Get all webhook configurations */
export async function fetchAllWebhooks(): Promise<WebhookConfig[]> {
  const res = await apiGet<{ webhooks: WebhookConfig[] } | WebhookConfig[]>('/webhooks')
  return Array.isArray(res) ? res : (res as { webhooks: WebhookConfig[] }).webhooks ?? []
}

/** Get webhooks for an agent */
export async function fetchWebhooksByAgent(
  agentId: string
): Promise<WebhookConfig[]> {
  const res = await apiGet<{ webhooks: WebhookConfig[] }>(
    `/webhooks?agent_id=${encodeURIComponent(agentId)}`
  )
  return res.webhooks ?? []
}

/** Update a webhook configuration */
export async function updateWebhook(
  id: string,
  body: Partial<CreateWebhookRequest>
): Promise<WebhookConfig> {
  return apiPut<WebhookConfig>(`/webhooks/${id}`, body)
}

/** Delete a webhook configuration */
export async function deleteWebhook(id: string): Promise<void> {
  return apiDelete<void>(`/webhooks/${id}`)
}

/** Get webhook delivery logs */
export async function fetchWebhookLogs(
  params?: WebhookLogsParams
): Promise<WebhookLogsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.agent_id) searchParams.set('agent_id', params.agent_id)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.from_date) searchParams.set('from_date', params.from_date)
  if (params?.to_date) searchParams.set('to_date', params.to_date)
  if (params?.event_type) searchParams.set('event_type', params.event_type)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.page_size) searchParams.set('page_size', String(params.page_size))

  const query = searchParams.toString()
  const path = `/webhooks/logs${query ? `?${query}` : ''}`
  return apiGet<WebhookLogsResponse>(path)
}

/** Replay a webhook delivery */
export async function replayWebhook(
  body: ReplayWebhookRequest
): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>('/webhooks/replay', body)
}
