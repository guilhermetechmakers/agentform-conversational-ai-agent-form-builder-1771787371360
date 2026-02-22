/**
 * Terms of Service API.
 */

import { apiGet, apiPost } from '@/lib/api'
import type {
  TermsResponse,
  AcknowledgeTermsRequest,
  AcknowledgeTermsResponse,
} from '@/types/terms'

export async function fetchTerms(): Promise<TermsResponse> {
  return apiGet<TermsResponse>('/terms')
}

export async function acknowledgeTerms(
  payload: AcknowledgeTermsRequest
): Promise<AcknowledgeTermsResponse> {
  return apiPost<AcknowledgeTermsResponse>('/user/acknowledge-terms', payload)
}
