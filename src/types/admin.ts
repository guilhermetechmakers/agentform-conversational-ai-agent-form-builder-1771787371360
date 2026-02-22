export type UserRole = 'admin' | 'user' | 'guest'
export type UserStatus = 'active' | 'suspended'
export type AgentStatus = 'active' | 'inactive' | 'flagged'
export type LogType = 'webhook' | 'error' | 'security'

export interface AdminUser {
  user_id: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
}

export interface AdminAgent {
  agent_id: string
  name: string
  status: AgentStatus
  created_at: string
}

export interface AdminLog {
  log_id: string
  type: LogType
  description: string
  timestamp: string
}

export interface AdminBilling {
  billing_id: string
  user_id: string
  plan: string
  usage: number
  amount_due: number
  due_date: string
}

export interface AdminMetrics {
  totalAgents: number
  totalSessions: number
  apiUsage: number
  apiUsageLimit: number
  llmSpend: number
  llmSpendLimit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
