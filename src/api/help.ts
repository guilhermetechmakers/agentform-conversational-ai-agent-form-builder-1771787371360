import { apiGet, apiPost, apiPostFormData } from '@/lib/api'
import type {
  KnowledgeBaseResponse,
  FAQ,
  SupportTicketPayload,
  SupportTicketResponse,
  ChangelogEntry,
} from '@/types/help'

export async function fetchKnowledgeBase(
  search?: string,
  page = 1,
  perPage = 10
): Promise<KnowledgeBaseResponse> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  params.set('page', String(page))
  params.set('per_page', String(perPage))
  return apiGet<KnowledgeBaseResponse>(`/knowledge-base?${params}`)
}

export async function fetchFAQs(): Promise<FAQ[]> {
  return apiGet<FAQ[]>('/faqs')
}

export async function createSupportTicket(
  payload: SupportTicketPayload,
  file?: File
): Promise<SupportTicketResponse> {
  if (file) {
    const formData = new FormData()
    formData.append('name', payload.name)
    formData.append('email', payload.email)
    formData.append('subject', payload.subject)
    formData.append('message', payload.message)
    formData.append('attachment', file)
    return apiPostFormData<SupportTicketResponse>('/support-tickets', formData)
  }
  return apiPost<SupportTicketResponse>('/support-tickets', payload)
}

export async function fetchChangelog(): Promise<ChangelogEntry[]> {
  return apiGet<ChangelogEntry[]>('/changelog')
}
