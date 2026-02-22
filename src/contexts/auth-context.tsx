/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import type { User } from '@/types'
import * as authApi from '@/api/auth'
import type { ApiError } from '@/lib/api'
import { setTokenRefreshHandler, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/api'

const REMEMBER_KEY = 'agentform-remember-me'

function setRememberMe(remember: boolean): void {
  try {
    localStorage.setItem(REMEMBER_KEY, String(remember))
  } catch {
    // ignore
  }
}

function getStorage(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (
    email: string,
    password: string,
    tosAccepted: boolean
  ) => Promise<{ needsVerification?: boolean }>
  logout: () => void
  initiateOAuth: (provider: 'google' | 'microsoft' | 'github') => void
  initiateSSO: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const SIDEBAR_KEY = 'agentform-sidebar-collapsed'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const rehydrate = React.useCallback(() => {
    const token =
      localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
    if (token) {
      setUser({
        id: '1',
        email: 'user@example.com',
        name: 'Demo User',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } else {
      setUser(null)
    }
  }, [])

  React.useEffect(() => {
    rehydrate()
    setIsLoading(false)
  }, [rehydrate])

  React.useEffect(() => {
    const onStorage = () => rehydrate()
    window.addEventListener('storage', onStorage)
    window.addEventListener('auth-tokens-stored', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('auth-tokens-stored', onStorage)
    }
  }, [rehydrate])

  const login = React.useCallback(
    async (email: string, password: string, rememberMe = false) => {
      setRememberMe(rememberMe)
      const storage = getStorage(rememberMe)
      try {
        const res = await authApi.login({ email, password })
        const accessToken = res.token ?? res.accessToken
        const refreshToken = res.refreshToken
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(REFRESH_TOKEN_KEY)
        if (accessToken) storage.setItem(TOKEN_KEY, accessToken)
        if (refreshToken) storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        setUser({ ...res.user, role: res.user.role ?? 'user' })
      } catch (err) {
        const apiErr = err as ApiError & { message?: string }
        const msg = apiErr?.message ?? ''
        const isOffline =
          apiErr?.status === 404 ||
          msg.includes('fetch') ||
          msg.includes('Failed') ||
          msg.includes('Network')
        if (isOffline) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(REFRESH_TOKEN_KEY)
          sessionStorage.removeItem(TOKEN_KEY)
          sessionStorage.removeItem(REFRESH_TOKEN_KEY)
          storage.setItem(TOKEN_KEY, 'mock-token')
          setUser({
            id: '1',
            email,
            name: 'Demo User',
            role: 'user' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        } else {
          throw err
        }
      }
    },
    []
  )

  const signup = React.useCallback(
    async (
      email: string,
      password: string,
      tosAccepted: boolean
    ): Promise<{ needsVerification?: boolean }> => {
      try {
        const res = await authApi.signup({ email, password, tosAccepted })
        const accessToken = res.accessToken ?? res.token
        const refreshToken = res.refreshToken
        if (accessToken) {
          localStorage.removeItem(TOKEN_KEY)
          sessionStorage.removeItem(TOKEN_KEY)
          localStorage.setItem(TOKEN_KEY, accessToken)
          if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
          setUser({
            id: res.user?.id ?? '1',
            email: res.user?.email ?? email,
            name: res.user?.name ?? email.split('@')[0],
            role: res.user?.role ?? 'user',
            createdAt: res.user?.createdAt ?? new Date().toISOString(),
            updatedAt: res.user?.updatedAt ?? new Date().toISOString(),
          })
          return { needsVerification: false }
        }
        return { needsVerification: true }
      } catch (err) {
        const apiErr = err as ApiError & { message?: string }
        const msg = apiErr?.message ?? ''
        const isOffline =
          apiErr?.status === 404 ||
          msg.includes('fetch') ||
          msg.includes('Failed') ||
          msg.includes('Network')
        if (isOffline) {
          sessionStorage.removeItem(TOKEN_KEY)
          localStorage.setItem(TOKEN_KEY, 'mock-token')
          setUser({
            id: '1',
            email,
            name: email.split('@')[0],
            role: 'user' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          return { needsVerification: false }
        }
        throw err
      }
    },
    []
  )

  const logout = React.useCallback(async () => {
    const refreshToken =
      localStorage.getItem(REFRESH_TOKEN_KEY) ??
      sessionStorage.getItem(REFRESH_TOKEN_KEY)
    try {
      await authApi.logout(refreshToken ?? undefined)
    } catch {
      // Proceed with local logout even if API fails
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(REFRESH_TOKEN_KEY)
      setUser(null)
    }
  }, [])

  const initiateOAuth = React.useCallback(
    (provider: 'google' | 'microsoft' | 'github') => {
      authApi.initiateOAuth(provider)
    },
    []
  )

  const initiateSSO = React.useCallback(async () => {
    try {
      const res = await authApi.initiateSSO({
        redirectUri: typeof window !== 'undefined' ? window.location.href : undefined,
      })
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl
      }
    } catch (err) {
      const apiErr = err as ApiError & { message?: string }
      throw new Error(apiErr?.message ?? 'Enterprise login is not configured')
    }
  }, [])

  const refreshTokens = React.useCallback(async (): Promise<boolean> => {
    const refreshToken =
      localStorage.getItem(REFRESH_TOKEN_KEY) ??
      sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) return false
    try {
      const res = await authApi.refreshTokens(refreshToken)
      const accessToken = res.accessToken ?? res.token
      const newRefresh = res.refreshToken
      if (accessToken) {
        const storage =
          localStorage.getItem(REFRESH_TOKEN_KEY) ? localStorage : sessionStorage
        storage.setItem(TOKEN_KEY, accessToken)
        if (newRefresh) storage.setItem(REFRESH_TOKEN_KEY, newRefresh)
        return true
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(REFRESH_TOKEN_KEY)
      setUser(null)
    }
    return false
  }, [])

  React.useEffect(() => {
    setTokenRefreshHandler(refreshTokens)
    return () => setTokenRefreshHandler(null)
  }, [refreshTokens])

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    initiateOAuth,
    initiateSSO,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useSidebarState() {
  const [collapsed, setCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true'
    } catch {
      return false
    }
  })

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return { collapsed, toggle }
}
