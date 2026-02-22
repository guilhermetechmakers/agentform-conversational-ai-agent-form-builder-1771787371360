import { apiPost, apiPostNoAuth } from '@/lib/api'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role?: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  token?: string
  accessToken?: string
  refreshToken?: string
  user: AuthUser
}

export interface SignupRequest {
  email: string
  password: string
  tosAccepted: boolean
}

export interface SignupResponse {
  message: string
  accessToken?: string
  refreshToken?: string
  token?: string
  user?: AuthUser
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

export interface RefreshResponse {
  accessToken?: string
  refreshToken?: string
  token?: string
}

export interface LogoutRequest {
  refreshToken?: string
}

function getAccessToken(res: LoginResponse | SignupResponse): string | undefined {
  return res.accessToken ?? (res as LoginResponse).token
}

function getRefreshToken(res: LoginResponse | SignupResponse): string | undefined {
  return res.refreshToken
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiPost<LoginResponse>('/auth/login', data)
  return {
    ...res,
    token: getAccessToken(res) ?? res.token,
  }
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  return apiPost<SignupResponse>('/auth/signup', data)
}

export async function logout(refreshToken?: string): Promise<{ message: string }> {
  if (refreshToken) {
    try {
      return await apiPostNoAuth<{ message: string }>('/auth/logout', { refreshToken })
    } catch {
      return { message: 'Logged out successfully' }
    }
  }
  return { message: 'Logged out successfully' }
}

export async function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  return apiPostNoAuth<RefreshResponse>('/auth/refresh', { refreshToken })
}

export async function oauth(data: OAuthRequest): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/oauth', data)
}

/** OAuth callback URL for redirect after provider auth. */
export function getOAuthCallbackUrl(): string {
  return typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : ''
}

/** Initiates OAuth flow by redirecting to provider. Backend constructs full URL. */
export function getOAuthRedirectUrl(provider: 'google' | 'microsoft' | 'github'): string {
  const base = API_BASE.replace(/\/$/, '')
  return `${base}/auth/oauth/${provider}`
}

/** Redirects user to OAuth provider for sign-in. */
export function initiateOAuth(provider: 'google' | 'microsoft' | 'github'): void {
  window.location.href = getOAuthRedirectUrl(provider)
}

export interface SSOInitiateRequest {
  enterpriseId?: string
  redirectUri?: string
}

export interface SSOInitiateResponse {
  redirectUrl: string
}

/** Initiates SAML/OIDC SSO flow for enterprise login. */
export async function initiateSSO(
  data?: SSOInitiateRequest
): Promise<SSOInitiateResponse> {
  return apiPost<SSOInitiateResponse>('/auth/sso/initiate', data ?? {})
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
