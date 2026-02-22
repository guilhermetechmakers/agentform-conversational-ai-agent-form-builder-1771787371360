const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export const TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

function getAccessToken(): string | null {
  return (
    localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  )
}

function getRefreshToken(): string | null {
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
  )
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: response.statusText,
      status: response.status,
    }
    try {
      const data = await response.json()
      error.message = data.message ?? data.error ?? error.message
      error.code = data.code
    } catch {
      // Response body is not JSON
    }
    throw error
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }
  return response.text() as unknown as T
}

async function doFetch(
  path: string,
  init: RequestInit,
  useAuth = true
): Promise<Response> {
  const url = `${API_BASE}${path}`
  const headers = useAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' }
  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string>) },
  })
  if (res.status === 401 && useAuth && onTokenRefresh) {
    const refreshed = await onTokenRefresh()
    if (refreshed) {
      const newHeaders = await getAuthHeaders()
      return fetch(url, {
        ...init,
        headers: { ...newHeaders, ...(init.headers as Record<string, string>) },
      })
    }
  }
  return res
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await doFetch(path, {})
  return handleResponse<T>(response)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await doFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

/** POST without Authorization header (for auth endpoints like refresh). */
export async function apiPostNoAuth<T>(path: string, body?: unknown): Promise<T> {
  const headers = { 'Content-Type': 'application/json' }
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await doFetch(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const response = await doFetch(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await doFetch(path, { method: 'DELETE' })
  return handleResponse<T>(response)
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  return handleResponse<T>(response)
}

/** Callback when token refresh is needed. Set by auth layer. */
let onTokenRefresh: (() => Promise<boolean>) | null = null

export function setTokenRefreshHandler(handler: (() => Promise<boolean>) | null): void {
  onTokenRefresh = handler
}

