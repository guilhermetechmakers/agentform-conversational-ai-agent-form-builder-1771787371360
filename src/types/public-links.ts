export interface PublicLink {
  link_id: string
  agent_id: string
  url: string
  full_url?: string
  short_token?: string
  expiry: string | null
  created_at: string
  updated_at: string
}

export interface AgentPublicLinkStatus {
  agent_id: string
  has_public_link: boolean
  link_id?: string
  short_token?: string
  expiry?: string | null
  analytics?: {
    views: number
    unique_visitors: number
  }
}

export interface CreatePublicLinkRequest {
  expiry?: string
  password?: string
  analytics_enabled?: boolean
}

export interface CreatePublicLinkResponse {
  url: string
  full_url: string
  link_id: string
  short_token?: string
  expiry: string | null
}

export interface LinkAnalytics {
  views: number
  unique_visitors: number
  referrers: Array<{ referrer: string; count: number }>
  utm: Array<
    | { param: string; value: string; count: number }
    | { source?: string; medium?: string; campaign?: string; count: number }
  >
  period?: string
}

export interface ValidateAccessRequest {
  password?: string
}

export interface ValidateAccessResponse {
  success: boolean
  agent_id?: string
  message?: string
}

export interface PublicLinkAccessStatus {
  requires_password: boolean
  is_expired: boolean
  is_valid: boolean
  agent_id?: string
  message?: string
}
