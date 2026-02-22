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

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ResendVerificationResponse {
  success: boolean
  message: string
}

export async function verifyEmail(
  data: VerifyEmailRequest
): Promise<VerifyEmailResponse> {
  return apiPost<VerifyEmailResponse>('/auth/verify-email', data)
}

export async function resendVerification(
  data: ResendVerificationRequest
): Promise<ResendVerificationResponse> {
  return apiPost<ResendVerificationResponse>('/auth/resend-verification', data)
}
