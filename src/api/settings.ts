import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import type {
  UserProfile,
  TeamMember,
  BillingInfo,
  ApiKey,
  Webhook,
  SecuritySettings,
  DataPrivacySettings,
} from '@/types/settings'

export async function fetchUserProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/user/profile')
}

export async function updateUserProfile(
  data: Partial<Pick<UserProfile, 'name' | 'email' | 'timezone' | 'language'>>
): Promise<UserProfile> {
  return apiPut<UserProfile>('/user/profile', data)
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  return apiGet<TeamMember[]>('/team')
}

export async function inviteTeamMember(
  email: string,
  role: string
): Promise<{ invite_id: string }> {
  return apiPost<{ invite_id: string }>('/team/invite', { email, role })
}

export async function fetchBilling(): Promise<BillingInfo> {
  return apiGet<BillingInfo>('/billing')
}

export async function upgradePlan(planId: string): Promise<BillingInfo> {
  return apiPost<BillingInfo>('/billing/upgrade', { plan_id: planId })
}

export async function fetchApiKeys(): Promise<ApiKey[]> {
  return apiGet<ApiKey[]>('/api-keys')
}

export async function createApiKey(name?: string): Promise<{ key: string; id: string }> {
  return apiPost<{ key: string; id: string }>('/api-keys', { name })
}

export async function revokeApiKey(id: string): Promise<void> {
  return apiDelete(`/api-keys/${id}`)
}

export async function fetchWebhooks(): Promise<Webhook[]> {
  return apiGet<Webhook[]>('/webhooks')
}

export async function createWebhook(
  endpoint: string,
  headers?: Record<string, string>
): Promise<Webhook> {
  return apiPost<Webhook>('/webhooks', { endpoint, headers })
}

export async function deleteWebhook(id: string): Promise<void> {
  return apiDelete(`/webhooks/${id}`)
}

export async function fetchSecuritySettings(): Promise<SecuritySettings> {
  return apiGet<SecuritySettings>('/security')
}

export async function updateSecuritySettings(
  data: Partial<Pick<SecuritySettings, 'two_fa_enabled' | 'ip_allowlist'>>
): Promise<SecuritySettings> {
  return apiPut<SecuritySettings>('/security', data)
}

export async function fetchDataPrivacy(): Promise<DataPrivacySettings> {
  return apiGet<DataPrivacySettings>('/data-privacy')
}

export async function updateDataPrivacy(
  data: Partial<Pick<DataPrivacySettings, 'retention_policy_days'>>
): Promise<DataPrivacySettings> {
  return apiPut<DataPrivacySettings>('/data-privacy', data)
}

export async function requestDataExport(): Promise<{ request_id: string }> {
  return apiPost<{ request_id: string }>('/data-privacy/export', {})
}

export async function requestDataDeletion(): Promise<{ request_id: string }> {
  return apiPost<{ request_id: string }>('/data-privacy/delete', {})
}
