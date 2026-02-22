export interface UserProfile {
  id: string
  name: string
  /** First name (preferred when available) */
  first_name?: string
  /** Last name (preferred when available) */
  last_name?: string
  email: string
  avatar_url?: string
  timezone: string
  language: string
}

export interface NotificationPreferences {
  user_id: string
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
}

export type TeamRole = 'Owner' | 'Admin' | 'Member'

export interface TeamMember {
  id: string
  user_id: string
  email: string
  name: string
  avatar_url?: string
  role: TeamRole
  invited_at: string
}

export interface BillingInfo {
  id: string
  user_id: string
  current_plan: string
  plan_id?: string
  price_per_month?: number
  renewal_date?: string
  usage_metrics: {
    sessions_used?: number
    sessions_limit?: number
    tokens_used?: number
    tokens_limit?: number
    storage_used_mb?: number
    storage_limit_mb?: number
  }
  payment_method?: {
    brand?: string
    last4?: string
    expiry_month?: number
    expiry_year?: number
  }
  invoices?: Array<{
    id: string
    amount: number
    currency: string
    status: string
    created_at: string
    invoice_url?: string
    pdf_url?: string
  }>
  plans?: Array<{
    id: string
    name: string
    quota_sessions: number
    quota_tokens: number
    price_per_month: number
  }>
}

export interface ApiKey {
  id: string
  key_prefix: string
  created_at: string
}

export interface Webhook {
  id: string
  endpoint: string
  headers?: Record<string, string>
  secret?: string
  delivery_logs?: Array<{
    id: string
    status: string
    response_code?: number
    created_at: string
  }>
}

export interface SecuritySettings {
  id: string
  user_id: string
  two_fa_enabled: boolean
  session_activity?: Array<{
    id: string
    device?: string
    ip?: string
    location?: string
    last_active: string
  }>
  ip_allowlist?: string[]
}

export interface DataPrivacySettings {
  id: string
  user_id: string
  retention_policy_days: number
  export_requests?: Array<{
    id: string
    status: string
    created_at: string
  }>
  deletion_requests?: Array<{
    id: string
    status: string
    created_at: string
  }>
}
