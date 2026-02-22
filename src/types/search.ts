import type { SessionListItem } from './sessions'

export interface SearchFilters {
  status?: string
  agent_id?: string
  date_from?: string
  date_to?: string
  tag?: string
  field_name?: string
  field_value?: string
}

export interface SearchParams {
  query: string
  filters?: SearchFilters
  page?: number
  page_size?: number
}

export interface SearchResponse {
  results: SessionListItem[]
  total_pages: number
  current_page: number
  total: number
}

export interface SearchSuggestion {
  id: string
  type: 'agent' | 'session' | 'user'
  label: string
  subtitle?: string
  href?: string
}
