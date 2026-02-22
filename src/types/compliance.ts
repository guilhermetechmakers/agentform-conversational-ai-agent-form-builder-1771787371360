/** RBAC roles per Security & Compliance spec */
export type RBACRole = 'admin' | 'owner' | 'editor' | 'viewer'

export interface UserWithRole {
  id: string
  name: string
  email: string
  role: RBACRole
  created_at: string
}

export type AuditLogStatus = 'success' | 'failure' | 'pending'

export type AuditLogAction =
  | 'role_change'
  | 'compliance_setting_change'
  | 'agent_access_modification'
  | 'login'
  | 'logout'
  | 'webhook_delivery'
  | 'error'

export interface AuditLogEntry {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  action: AuditLogAction
  timestamp: string
  status: AuditLogStatus
  details?: string
}

export type DataResidencyRegion = 'us-east' | 'eu-west' | 'ap-southeast' | 'default'

export type RetentionPeriod = '7' | '30' | '90' | '180' | '365'

export interface ComplianceSettings {
  data_residency: DataResidencyRegion
  retention_period: RetentionPeriod
  pii_redaction: boolean
}

export interface DataProtectionSettings {
  encryption_at_rest: boolean
  tls_version: string
  certificate_expiry?: string
  pii_redaction_enabled: boolean
}

export type AgentVisibility = 'public' | 'restricted'

export interface AgentAccessControl {
  visibility: AgentVisibility
  allowed_roles: RBACRole[]
}
