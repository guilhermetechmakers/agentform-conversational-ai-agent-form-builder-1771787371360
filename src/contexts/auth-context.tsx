import * as React from 'react'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const SIDEBAR_KEY = 'agentform-sidebar-collapsed'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Mock: set user from token. In production, decode or fetch user.
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

  const login = React.useCallback(async (email: string, _password: string) => {
    // Mock login - in production call apiPost('/login', { email, password })
    localStorage.setItem('access_token', 'mock-token')
    setUser({
      id: '1',
      email,
      name: 'Demo User',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const signup = React.useCallback(
    async (email: string, _password: string, name: string) => {
      // Mock signup
      localStorage.setItem('access_token', 'mock-token')
      setUser({
        id: '1',
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
    []
  )

  const logout = React.useCallback(() => {
    localStorage.removeItem('access_token')
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
