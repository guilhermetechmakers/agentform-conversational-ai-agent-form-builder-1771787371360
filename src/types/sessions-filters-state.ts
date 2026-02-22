import type { SessionStatus } from '@/types/sessions'

export interface SessionsFilterState {
  search: string
  agent_id: string
  status: SessionStatus | 'all'
  tag: string
  date_from: string
  date_to: string
  field_name: string
  field_value: string
}

export const DEFAULT_SESSIONS_FILTERS: SessionsFilterState = {
  search: '',
  agent_id: '',
  status: 'all',
  tag: '',
  date_from: '',
  date_to: '',
  field_name: '',
  field_value: '',
}
