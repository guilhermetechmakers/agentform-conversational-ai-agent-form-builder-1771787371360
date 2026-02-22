import { apiGet, apiPost } from '@/lib/api'
import type {
  SendEmailRequest,
  SendEmailResponse,
  EmailStatusResponse,
  EmailEvent,
} from '@/types/email'

/** Send an email using a template */
export async function sendEmail(
  data: SendEmailRequest
): Promise<SendEmailResponse> {
  return apiPost<SendEmailResponse>('/email/send', data)
}

/** Fetch delivery status for an email by message ID */
export async function getEmailStatus(
  messageId: string
): Promise<EmailStatusResponse> {
  return apiGet<EmailStatusResponse>(`/email/status/${encodeURIComponent(messageId)}`)
}

/** Response for email events list */
export interface EmailEventsResponse {
  events: EmailEvent[]
  total: number
}

/** Fetch recent email events for the current user */
export async function fetchEmailEvents(params?: {
  event_type?: string
  page?: number
  page_size?: number
}): Promise<EmailEventsResponse> {
  const search = new URLSearchParams()
  if (params?.event_type) search.set('event_type', params.event_type)
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.page_size != null) search.set('page_size', String(params.page_size))
  const qs = search.toString()
  return apiGet<EmailEventsResponse>(`/email/events${qs ? `?${qs}` : ''}`)
}
