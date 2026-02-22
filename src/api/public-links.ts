import { apiGet, apiPost, apiDelete } from '@/lib/api'
import type {
  CreatePublicLinkRequest,
  CreatePublicLinkResponse,
  LinkAnalytics,
  ValidateAccessRequest,
  ValidateAccessResponse,
  PublicLinkAccessStatus,
  PublicLink,
  AgentPublicLinkStatus,
} from '@/types/public-links'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

/** Create or regenerate a public link for an agent. */
export async function createPublicLink(
  agentId: string,
  body: CreatePublicLinkRequest
): Promise<CreatePublicLinkResponse> {
  return apiPost<CreatePublicLinkResponse>(
    `/agents/${agentId}/public-link`,
    body
  )
}

/** Get analytics for a public link. */
export async function getLinkAnalytics(
  linkId: string
): Promise<LinkAnalytics> {
  return apiGet<LinkAnalytics>(`/public-link/${linkId}/analytics`)
}

/** Validate access to a public link (password, expiry check). No auth required. */
export async function validateAccess(
  linkId: string,
  body?: ValidateAccessRequest
): Promise<ValidateAccessResponse> {
  const res = await fetch(`${API_BASE}/public-link/${linkId}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? err.error ?? res.statusText)
  }
  return res.json()
}

/** Get access status for a public link (no auth, for initial check). */
export async function getLinkAccessStatus(
  linkToken: string
): Promise<PublicLinkAccessStatus> {
  const res = await fetch(
    `${API_BASE}/agents/public/${encodeURIComponent(linkToken)}/access-status`,
    { headers: { 'Content-Type': 'application/json' } }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? err.error ?? res.statusText)
  }
  return res.json()
}

/** Get public link by agent ID. */
export async function getPublicLinkByAgent(
  agentId: string
): Promise<PublicLink | null> {
  try {
    return await apiGet<PublicLink>(`/agents/${agentId}/public-link`)
  } catch {
    return null
  }
}

/** Get public link status for multiple agents (dashboard list). */
export async function getAgentsPublicLinkStatus(
  agentIds: string[]
): Promise<AgentPublicLinkStatus[]> {
  if (agentIds.length === 0) return []
  const params = new URLSearchParams()
  agentIds.forEach((id) => params.append('agent_id', id))
  try {
    return await apiGet<AgentPublicLinkStatus[]>(
      `/public-links/status?${params.toString()}`
    )
  } catch {
    return []
  }
}

/** Disable/delete a public link. */
export async function disablePublicLink(
  agentId: string,
  linkId: string
): Promise<void> {
  return apiDelete(`/agents/${agentId}/public-link/${linkId}`)
}

/** Get public link info by token (for access check). Falls back to legacy when API unavailable. */
export async function getPublicLinkByToken(
  linkToken: string
): Promise<{ is_expired: boolean; password_protected: boolean }> {
  try {
    const status = await getLinkAccessStatus(linkToken)
    return {
      is_expired: status.is_expired,
      password_protected: status.requires_password,
    }
  } catch {
    return { is_expired: false, password_protected: false }
  }
}

/** Validate public link access with password. Alias for validateAccess. */
export async function validatePublicLinkAccess(
  linkToken: string,
  body: { password?: string }
): Promise<ValidateAccessResponse> {
  return validateAccess(linkToken, body)
}
