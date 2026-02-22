import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  type ApiError,
} from '@/lib/api'
import type {
  AdminMetrics,
  AdminUser,
  AdminAgent,
  AdminLog,
  AdminBilling,
  AdminSSOSetting,
  PaginatedResponse,
  AuditLog,
  ComplianceSettings,
  RbacRole,
} from '@/types/admin'

const ADMIN_BASE = '/admin'

export async function fetchMetrics(): Promise<AdminMetrics> {
  try {
    const res = await apiGet<AdminMetrics>(`${ADMIN_BASE}/metrics`)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        totalAgents: 24,
        totalSessions: 1847,
        apiUsage: 125000,
        apiUsageLimit: 500000,
        llmSpend: 342,
        llmSpendLimit: 1000,
      }
    }
    throw err
  }
}

export async function fetchUsers(params?: {
  search?: string
  role?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<AdminUser>> {
  try {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.role) q.set('role', params.role)
    if (params?.status) q.set('status', params.status)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    const query = q.toString()
    const res = await apiGet<PaginatedResponse<AdminUser>>(
      `${ADMIN_BASE}/users${query ? `?${query}` : ''}`
    )
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      const mock: AdminUser[] = [
        { user_id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', created_at: '2024-01-15T10:00:00Z' },
        { user_id: '2', username: 'jane', email: 'jane@example.com', role: 'owner', status: 'active', created_at: '2024-02-01T14:30:00Z' },
        { user_id: '3', username: 'bob', email: 'bob@example.com', role: 'editor', status: 'suspended', created_at: '2024-02-10T09:00:00Z' },
        { user_id: '4', username: 'guest1', email: 'guest@example.com', role: 'viewer', status: 'active', created_at: '2024-02-15T11:00:00Z' },
      ]
      const filtered = filterMockUsers(mock, params)
      return {
        data: filtered,
        total: filtered.length,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      }
    }
    throw err
  }
}

function filterMockUsers(users: AdminUser[], params?: { search?: string; role?: string; status?: string }): AdminUser[] {
  let result = [...users]
  if (params?.search) {
    const s = params.search.toLowerCase()
    result = result.filter((u) =>
      u.email.toLowerCase().includes(s) || u.username.toLowerCase().includes(s)
    )
  }
  if (params?.role) result = result.filter((u) => u.role === params.role)
  if (params?.status) result = result.filter((u) => u.status === params.status)
  return result
}

export async function updateUser(
  id: string,
  body: { status?: string; role?: string }
): Promise<AdminUser> {
  try {
    const res = await apiPut<AdminUser>(`${ADMIN_BASE}/users/${id}`, body)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        user_id: id,
        username: 'updated',
        email: 'updated@example.com',
        role: (body.role as AdminUser['role']) ?? 'user',
        status: (body.status as AdminUser['status']) ?? 'active',
        created_at: new Date().toISOString(),
      }
    }
    throw err
  }
}

export async function getUserById(id: string): Promise<AdminUser | null> {
  try {
    const res = await apiGet<AdminUser>(`${ADMIN_BASE}/users/${id}`)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return null
    }
    throw err
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await apiDelete(`${ADMIN_BASE}/users/${id}`)
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return
    }
    throw err
  }
}

export async function fetchAgents(params?: {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<AdminAgent>> {
  try {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.status) q.set('status', params.status)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    const query = q.toString()
    const res = await apiGet<PaginatedResponse<AdminAgent>>(
      `${ADMIN_BASE}/agents${query ? `?${query}` : ''}`
    )
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      const mock: AdminAgent[] = [
        { agent_id: '1', name: 'Lead Capture', status: 'active', created_at: '2024-01-20T10:00:00Z' },
        { agent_id: '2', name: 'Product Feedback', status: 'active', created_at: '2024-02-01T14:00:00Z' },
        { agent_id: '3', name: 'Support Bot', status: 'flagged', created_at: '2024-02-10T09:00:00Z' },
        { agent_id: '4', name: 'Survey Agent', status: 'inactive', created_at: '2024-02-15T11:00:00Z' },
      ]
      let filtered = mock
      if (params?.search) {
        const s = params.search.toLowerCase()
        filtered = filtered.filter((a) => a.name.toLowerCase().includes(s))
      }
      if (params?.status) filtered = filtered.filter((a) => a.status === params.status)
      return {
        data: filtered,
        total: filtered.length,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      }
    }
    throw err
  }
}

export async function fetchLogs(params?: {
  type?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<AdminLog>> {
  try {
    const q = new URLSearchParams()
    if (params?.type) q.set('type', params.type)
    if (params?.from) q.set('from', params.from)
    if (params?.to) q.set('to', params.to)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    const query = q.toString()
    const res = await apiGet<PaginatedResponse<AdminLog>>(
      `${ADMIN_BASE}/logs${query ? `?${query}` : ''}`
    )
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      const mock: AdminLog[] = [
        { log_id: '1', type: 'webhook', description: 'Webhook delivered to https://example.com/webhook', timestamp: new Date().toISOString() },
        { log_id: '2', type: 'error', description: 'Session timeout after 30 minutes', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { log_id: '3', type: 'security', description: 'Failed login attempt from 192.168.1.1', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { log_id: '4', type: 'webhook', description: 'Webhook retry succeeded', timestamp: new Date(Date.now() - 86400000).toISOString() },
      ]
      let filtered = mock
      if (params?.type) filtered = filtered.filter((l) => l.type === params.type)
      return {
        data: filtered,
        total: filtered.length,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      }
    }
    throw err
  }
}

export async function fetchBilling(): Promise<AdminBilling[]> {
  try {
    const res = await apiGet<AdminBilling[]>(`${ADMIN_BASE}/billing`)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return [
        { billing_id: '1', user_id: '1', plan: 'Pro', usage: 125000, amount_due: 49, due_date: '2024-03-01' },
        { billing_id: '2', user_id: '2', plan: 'Starter', usage: 45000, amount_due: 19, due_date: '2024-03-05' },
      ]
    }
    throw err
  }
}

export async function fetchSSOSettings(): Promise<AdminSSOSetting[]> {
  try {
    const res = await apiGet<AdminSSOSetting[]>(`${ADMIN_BASE}/sso-settings`)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return []
    }
    throw err
  }
}

export async function createSSOSetting(body: {
  enterprise_name: string
  sso_type: 'SAML' | 'OIDC'
  metadata_url: string
}): Promise<AdminSSOSetting> {
  return apiPost<AdminSSOSetting>(`${ADMIN_BASE}/sso-settings`, body)
}

export async function updateSSOSetting(
  id: string,
  body: Partial<{ enterprise_name: string; sso_type: 'SAML' | 'OIDC'; metadata_url: string }>
): Promise<AdminSSOSetting> {
  return apiPut<AdminSSOSetting>(`${ADMIN_BASE}/sso-settings/${id}`, body)
}

export async function deleteSSOSetting(id: string): Promise<void> {
  await apiDelete(`${ADMIN_BASE}/sso-settings/${id}`)
}

export async function updateUserRole(
  userId: string,
  role: RbacRole
): Promise<AdminUser> {
  try {
    const res = await apiPost<AdminUser>(`${ADMIN_BASE}/users/roles`, {
      user_id: userId,
      role,
    })
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        user_id: userId,
        username: 'updated',
        email: 'updated@example.com',
        role,
        status: 'active',
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
}): Promise<PaginatedResponse<AuditLog>> {
  try {
    const q = new URLSearchParams()
    if (params?.from) q.set('from', params.from)
    if (params?.to) q.set('to', params.to)
    if (params?.user) q.set('user', params.user)
    if (params?.action) q.set('action', params.action)
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    const query = q.toString()
    const res = await apiGet<PaginatedResponse<AuditLog>>(
      `${ADMIN_BASE}/audit-logs${query ? `?${query}` : ''}`
    )
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      const mock: AuditLog[] = [
        {
          id: '1',
          user_id: '1',
          user_name: 'admin',
          user_email: 'admin@example.com',
          action: 'role_change',
          timestamp: new Date().toISOString(),
          status: 'success',
          details: 'Role changed from user to editor',
        },
        {
          id: '2',
          user_id: '2',
          user_name: 'jane',
          user_email: 'jane@example.com',
          action: 'compliance_setting_change',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'success',
          details: 'Retention policy updated to 90 days',
        },
        {
          id: '3',
          user_id: '1',
          user_name: 'admin',
          user_email: 'admin@example.com',
          action: 'agent_access_modification',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'success',
          details: 'Agent access set to Restricted',
        },
      ]
      let filtered = mock
      if (params?.action) filtered = filtered.filter((l) => l.action === params.action)
      return {
        data: filtered,
        total: filtered.length,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
      }
    }
    throw err
  }
}

export async function fetchComplianceSettings(): Promise<ComplianceSettings> {
  try {
    const res = await apiGet<ComplianceSettings>(`${ADMIN_BASE}/compliance`)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        id: '1',
        user_id: '1',
        data_residency: 'us-east-1',
        retention_period: '90',
        pii_redaction: false,
        updated_at: new Date().toISOString(),
      }
    }
    throw err
  }
}

export async function updateComplianceSettings(
  data: Partial<Pick<ComplianceSettings, 'data_residency' | 'retention_period' | 'pii_redaction'>>
): Promise<ComplianceSettings> {
  try {
    const res = await apiPost<ComplianceSettings>(`${ADMIN_BASE}/compliance`, data)
    return res
  } catch (err) {
    const apiErr = err as ApiError & { status?: number }
    if (apiErr?.status === 404 || apiErr?.message?.includes('fetch')) {
      return {
        id: '1',
        user_id: '1',
        data_residency: data.data_residency ?? 'us-east-1',
        retention_period: data.retention_period ?? '90',
        pii_redaction: data.pii_redaction ?? false,
        updated_at: new Date().toISOString(),
      }
    }
    throw err
  }
}
