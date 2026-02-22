/** Event types that can trigger webhook delivery */
export type WebhookEventType =
  | 'session_completed'
  | 'session_started'
  | 'session_updated'
  | 'field_extracted'

/** Webhook configuration (per agent) */
export interface WebhookConfig {
  id: string
  agent_id: string
  url: string
  headers?: Record<string, string>
  secret_key?: string
  event_types: WebhookEventType[]
  created_at: string
}

/** Webhook log status */
export type WebhookLogStatus = 'pending' | 'success' | 'failed' | 'retrying'

/** Webhook delivery log entry */
export interface WebhookLog {
  id: string
  webhook_id: string
  webhook_url?: string
  agent_id?: string
  agent_name?: string
  status: WebhookLogStatus
  attempts: number
  last_attempt_at: string | null
  response_code: number | null
  response_body: string | null
  event_type?: string
  payload?: Record<string, unknown>
  headers?: Record<string, string>
  created_at: string
}

/** Params for fetching webhook logs */
export interface WebhookLogsParams {
  agent_id?: string
  status?: WebhookLogStatus
  from_date?: string
  to_date?: string
  event_type?: string
  page?: number
  page_size?: number
}

/** Response for webhook logs list */
export interface WebhookLogsResponse {
  logs: WebhookLog[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

/** Create webhook request */
export interface CreateWebhookRequest {
  agent_id: string
  url: string
  headers?: Record<string, string>
  secret_key?: string
  event_types: WebhookEventType[]
}

/** Replay webhook request */
export interface ReplayWebhookRequest {
  log_id: string
  edit_payload?: Record<string, unknown>
}
