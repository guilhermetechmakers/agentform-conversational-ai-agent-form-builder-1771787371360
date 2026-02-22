import * as React from 'react'
import type { User } from '@/types'
import * as authApi from '@/api/auth'
import type { ApiError } from '@/lib/api'

const TOKEN_KEY = 'access_token'
const REMEMBER_KEY = 'agentform-remember-me'

function setRememberMe(remember: boolean): void {
  try {
    localStorage.setItem(REMEMBER_KEY, String(remember))
  } catch {
    // ignore
  }
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
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const SIDEBAR_KEY = 'agentform-sidebar-collapsed'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
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
    }
    setIsLoading(false)
  }, [])

  const login = React.useCallback(
    async (email: string, password: string, rememberMe = false) => {
      setRememberMe(rememberMe)
      const storage = rememberMe ? localStorage : sessionStorage
      try {
        const res = await authApi.login({ email, password })
        localStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
        storage.setItem(TOKEN_KEY, res.token)
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
          sessionStorage.removeItem(TOKEN_KEY)
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
        await authApi.signup({ email, password, tosAccepted })
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

  const logout = React.useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
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
