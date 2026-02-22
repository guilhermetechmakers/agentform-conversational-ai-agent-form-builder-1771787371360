export type AgentStatus = 'Published' | 'Unpublished' | 'On Progress'

export interface AgentListItem {
  id: string
  name: string
  status: AgentStatus
  avatar_url?: string
  sessions_count: number
  conversion_rate: number
  created_at: string
  updated_at: string
  tags?: string[]
}

export interface AgentsListResponse {
  agents: AgentListItem[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

export interface QuickStats {
  total_sessions: number
  completion_rate: number
  webhook_delivery_rate: number
  period: string
}

export interface AgentsListParams {
  search?: string
  status?: AgentStatus
  tag?: string
  sort?: 'name' | 'created_at' | 'sessions' | 'conversion'
  page?: number
  page_size?: number
}
