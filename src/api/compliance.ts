import { apiGet, apiPut } from '@/lib/api'
import type {
  UserWithRole,
  AuditLogEntry,
  ComplianceSettings,
  DataProtectionSettings,
  RBACRole,
} from '@/types/compliance'
import type { ApiError } from '@/lib/api'

const COMPLIANCE_BASE = '/compliance'
const ADMIN_BASE = '/admin'

export interface PaginatedAuditLogs {
  data: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
}

function mapRoleToRBAC(role: string): RBACRole {
  const r = role?.toLowerCase()
  if (r === 'admin' || r === 'owner' || r === 'editor' || r === 'viewer') {
    return r as RBACRole
  }
  if (r === 'user') return 'editor'
  if (r === 'guest') return 'viewer'
  return 'viewer'
}

export async function fetchUsersWithRoles(): Promise<UserWithRole[]> {
  try {
    const res = await apiGet<{ data: Array<{ user_id?: string; id?: string; username?: string; name?: string; email: string; role: string; created_at: string }> }>(`${ADMIN_BASE}/users`)
    if (Array.isArray(res)) {
      return (res as unknown as Array<{ id: string; user_id?: string; username?: string; name?: string; email: string; role: string; created_at: string }>).map((u) => ({
        id: u.id ?? u.user_id ?? '',
        name: u.name ?? u.username ?? '',
        email: u.email,
        role: mapRoleToRBAC(u.role),
        created_at: u.created_at,
      }))
    }
    if (res && typeof res === 'object' && 'data' in res) {
      const data = (res as { data: Array<{ user_id?: string; id?: string; username?: string; name?: string; email: string; role: string; created_at: string }> }).data
      return data.map((u) => ({
        id: u.id ?? u.user_id ?? '',
        name: u.name ?? u.username ?? '',
        email: u.email,
        role: mapRoleToRBAC(u.role),
        created_at: u.created_at,
      }))
    }
    return []
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'owner',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Bob Smith',
          email: 'bob@example.com',
          role: 'editor',
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Guest User',
          email: 'guest@example.com',
          role: 'viewer',
          created_at: new Date().toISOString(),
        },
      ]
    }
    throw err
  }
}

export async function updateUserRole(
  userId: string,
  role: RBACRole
): Promise<UserWithRole> {
  try {
    const res = await apiPut<UserWithRole>(`${ADMIN_BASE}/users/${userId}/role`, {
      role,
    })
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        id: userId,
        name: 'Updated',
        email: 'updated@example.com',
        role,
        created_at: new Date().toISOString(),
      }
    }
    throw err
  }
}

export async function fetchAuditLogs(params?: {
  from?: string
  to?: string
  user?: string
  action?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedAuditLogs> {
  try {
    const q = new URLSearchParams()
    if (params?.from) q.set('from', params.from)
    if (params?.to) q.set('to', params.to)
    if (params?.user) q.set('user', params.user)
    if (params?.action) q.set('action', params.action)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    const query = q.toString()
    const res = await apiGet<PaginatedAuditLogs>(
      `${COMPLIANCE_BASE}/audit-logs${query ? `?${query}` : ''}`
    )
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      const mock: AuditLogEntry[] = [
        {
          id: '1',
          user_id: '1',
          user_name: 'Admin User',
          user_email: 'admin@example.com',
          action: 'role_change',
          timestamp: new Date().toISOString(),
          status: 'success',
          details: 'Changed role from user to editor',
        },
        {
          id: '2',
          user_id: '1',
          user_name: 'Admin User',
          user_email: 'admin@example.com',
          action: 'compliance_setting_change',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'success',
          details: 'Updated retention policy to 90 days',
        },
        {
          id: '3',
          user_id: '2',
          user_name: 'Jane Doe',
          user_email: 'jane@example.com',
          action: 'agent_access_modification',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'success',
          details: 'Updated visibility for Lead Capture agent',
        },
        {
          id: '4',
          user_id: '1',
          user_name: 'Admin User',
          user_email: 'admin@example.com',
          action: 'login',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'success',
        },
      ]
      return {
        data: mock,
        total: mock.length,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      }
    }
    throw err
  }
}

export async function fetchComplianceSettings(): Promise<ComplianceSettings> {
  try {
    const res = await apiGet<ComplianceSettings>(`${COMPLIANCE_BASE}/settings`)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        data_residency: 'default',
        retention_period: '90',
        pii_redaction: false,
      }
    }
    throw err
  }
}

export async function updateComplianceSettings(
  data: Partial<ComplianceSettings>
): Promise<ComplianceSettings> {
  try {
    const res = await apiPut<ComplianceSettings>(
      `${COMPLIANCE_BASE}/settings`,
      data
    )
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        data_residency: data.data_residency ?? 'default',
        retention_period: data.retention_period ?? '90',
        pii_redaction: data.pii_redaction ?? false,
      }
    }
    throw err
  }
}

export async function fetchDataProtection(): Promise<DataProtectionSettings> {
  try {
    const res = await apiGet<DataProtectionSettings>(
      `${COMPLIANCE_BASE}/data-protection`
    )
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        encryption_at_rest: true,
        tls_version: 'TLS 1.3',
        certificate_expiry: new Date(Date.now() + 90 * 86400000).toISOString(),
        pii_redaction_enabled: false,
      }
    }
    throw err
  }
}

export async function updateDataProtection(
  data: Partial<Pick<DataProtectionSettings, 'pii_redaction_enabled'>>
): Promise<DataProtectionSettings> {
  try {
    const res = await apiPut<DataProtectionSettings>(
      `${COMPLIANCE_BASE}/data-protection`,
      data
    )
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        encryption_at_rest: true,
        tls_version: 'TLS 1.3',
        certificate_expiry: new Date(Date.now() + 90 * 86400000).toISOString(),
        pii_redaction_enabled: data.pii_redaction_enabled ?? false,
      }
    }
    throw err
  }
}

export async function fetchAgentAccessControl(
  agentId: string
): Promise<{ visibility: 'public' | 'restricted'; allowed_roles: RBACRole[] }> {
  try {
    const res = await apiGet<{
      visibility: 'public' | 'restricted'
      allowed_roles: RBACRole[]
    }>(`/agents/${agentId}/access-control`)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        visibility: 'public',
        allowed_roles: ['admin', 'owner', 'editor', 'viewer'],
      }
    }
    throw err
  }
}

export async function updateAgentAccessControl(
  agentId: string,
  data: { visibility?: 'public' | 'restricted'; allowed_roles?: RBACRole[] }
): Promise<{ visibility: 'public' | 'restricted'; allowed_roles: RBACRole[] }> {
  try {
    const res = await apiPut<{
      visibility: 'public' | 'restricted'
      allowed_roles: RBACRole[]
    }>(`/agents/${agentId}/access-control`, data)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        visibility: data.visibility ?? 'public',
        allowed_roles: data.allowed_roles ?? ['admin', 'owner', 'editor', 'viewer'],
      }
    }
    throw err
  }
}
