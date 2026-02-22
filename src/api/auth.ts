import { apiPost } from '@/lib/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role?: string
    createdAt: string
    updatedAt: string
  }
}

export interface SignupRequest {
  email: string
  password: string
  tosAccepted: boolean
}

export interface SignupResponse {
  message: string
}

export interface OAuthRequest {
  provider: 'google' | 'microsoft' | 'github'
  oauthToken: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordUpdateRequest {
  token: string
  newPassword: string
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', data)
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  return apiPost<SignupResponse>('/auth/signup', data)
}

export async function oauth(data: OAuthRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/oauth', data)
}

export async function requestPasswordReset(
  data: PasswordResetRequest
): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/password-reset', data)
}

export async function updatePassword(
  data: PasswordUpdateRequest
): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/password-update', data)
}
