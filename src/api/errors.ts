import { apiPost } from '@/lib/api'

export interface LogErrorPayload {
  url: string
  referrer: string
  user_agent: string
}

export interface LogErrorResponse {
  status: string
  message: string
}

/**
 * Logs a 404 error to the backend for tracking.
 * No authentication required - public-facing endpoint.
 */
export async function log404Error(payload: LogErrorPayload): Promise<LogErrorResponse> {
  return apiPost<LogErrorResponse>('/errors/log', payload)
}
