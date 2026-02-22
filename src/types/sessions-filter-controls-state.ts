import type { SessionStatus } from '@/types/sessions'

export interface SessionsFilterControlsState {
  search: string
  agent_id: string
  status: SessionStatus | 'all'
  tag: string
  date_from: string
  date_to: string
  sort: string
  sort_dir: 'asc' | 'desc'
}

export const DEFAULT_SESSIONS_FILTER_CONTROLS: SessionsFilterControlsState = {
  search: '',
  agent_id: '',
  status: 'all',
  tag: '',
  date_from: '',
  date_to: '',
  sort: 'created_at',
  sort_dir: 'desc',
}
