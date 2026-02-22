import { apiPost } from '@/lib/api'

export interface SupportMessagePayload {
  name: string
  email: string
  message?: string
}

export interface SupportMessageResponse {
  message?: string
}

/**
 * Sends a support message via POST /api/support.
 * No authentication required - used for error page contact form.
 */
export async function sendSupportMessage(
  payload: SupportMessagePayload
): Promise<SupportMessageResponse> {
  return apiPost<SupportMessageResponse>('/support', payload)
}
