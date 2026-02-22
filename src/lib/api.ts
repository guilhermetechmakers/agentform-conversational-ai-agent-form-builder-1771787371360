const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = localStorage.getItem('access_token')
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

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}${path}`, { headers })
  return handleResponse<T>(response)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(response)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers,
  })
  return handleResponse<T>(response)
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('access_token')
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
