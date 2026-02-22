export type UserRole = 'admin' | 'owner' | 'editor' | 'viewer' | 'user' | 'guest'
export type UserStatus = 'active' | 'suspended'
export type RbacRole = 'admin' | 'owner' | 'editor' | 'viewer'
export type AuditLogStatus = 'success' | 'failure' | 'pending'
export type AuditLogAction =
  | 'role_change'
  | 'compliance_setting_change'
  | 'agent_access_modification'
  | 'user_login'
  | 'user_logout'
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

export type SSOType = 'SAML' | 'OIDC'

export interface AdminSSOSetting {
  id: string
  enterprise_name: string
  sso_type: SSOType
  metadata_url: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  action: AuditLogAction
  timestamp: string
  status: AuditLogStatus
  details?: string
}

export interface ComplianceSettings {
  id: string
  user_id: string
  data_residency: string
  retention_period: string
  pii_redaction: boolean
  updated_at?: string
}
