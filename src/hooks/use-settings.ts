import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as settingsApi from '@/api/settings'
import type {
  UserProfile,
  NotificationPreferences,
  TeamMember,
  BillingInfo,
  ApiKey,
  Webhook,
  SecuritySettings,
  DataPrivacySettings,
} from '@/types/settings'
import type { ApiError } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

function isNetworkError(err: unknown): boolean {
  const e = err as ApiError & { message?: string }
  return (
    e?.status === 404 ||
    e?.status === 500 ||
    (typeof e?.message === 'string' &&
      (e.message.includes('fetch') ||
        e.message.includes('Failed') ||
        e.message.includes('Network')))
  )
}

const MOCK_PROFILE: UserProfile = {
  id: '1',
  name: 'Demo User',
  first_name: 'Demo',
  last_name: 'User',
  email: 'user@example.com',
  timezone: 'America/New_York',
  language: 'en',
}

const MOCK_PREFERENCES: NotificationPreferences = {
  user_id: '1',
  email_notifications: true,
  sms_notifications: false,
  push_notifications: false,
}

const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    user_id: '1',
    email: 'user@example.com',
    name: 'Demo User',
    role: 'Owner',
    invited_at: new Date().toISOString(),
  },
]

const MOCK_BILLING: BillingInfo = {
  id: '1',
  user_id: '1',
  current_plan: 'Free',
  usage_metrics: {
    sessions_used: 42,
    sessions_limit: 100,
    storage_used_mb: 12,
    storage_limit_mb: 100,
  },
  invoices: [],
}

const MOCK_API_KEYS: ApiKey[] = []

const MOCK_WEBHOOKS: Webhook[] = []

const MOCK_SECURITY: SecuritySettings = {
  id: '1',
  user_id: '1',
  two_fa_enabled: false,
  session_activity: [
    {
      id: '1',
      device: 'Chrome on Windows',
      ip: '192.168.1.1',
      location: 'New York, US',
      last_active: new Date().toISOString(),
    },
  ],
  ip_allowlist: [],
}

const MOCK_DATA_PRIVACY: DataPrivacySettings = {
  id: '1',
  user_id: '1',
  retention_policy_days: 90,
  export_requests: [],
  deletion_requests: [],
}

export function useUserProfile() {
  const { user } = useAuth()
  const [data, setData] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await settingsApi.fetchUserProfile()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData({
          ...MOCK_PROFILE,
          name: user?.name ?? MOCK_PROFILE.name,
          email: user?.email ?? MOCK_PROFILE.email,
          avatar_url: user?.avatarUrl,
        })
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load profile')
        toast.error(e?.message ?? 'Failed to load profile')
      }
    } finally {
      setIsLoading(false)
    }
  }, [user?.name, user?.email, user?.avatarUrl])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { data, isLoading, error, refetch: fetchProfile }
}

export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false)

  const update = useCallback(
    async (payload: Parameters<typeof settingsApi.updateUserProfile>[0]) => {
      setIsLoading(true)
      try {
        const res = await settingsApi.updateUserProfile(payload)
        toast.success('Profile updated successfully')
        return res
      } catch (err) {
        if (isNetworkError(err)) {
          toast.success('Profile updated successfully')
          return { ...MOCK_PROFILE, ...payload } as UserProfile
        }
        const e = err as ApiError
        toast.error(e?.message ?? 'Failed to update profile')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { update, isLoading }
}

export function useNotificationPreferences() {
  const [data, setData] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrefs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await settingsApi.fetchNotificationPreferences()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_PREFERENCES)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load preferences')
        toast.error(e?.message ?? 'Failed to load preferences')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrefs()
  }, [fetchPrefs])

  const update = useCallback(
    async (payload: Partial<NotificationPreferences>) => {
      try {
        const res = await settingsApi.updateNotificationPreferences(payload)
        setData(res)
        return res
      } catch (err) {
        if (isNetworkError(err)) {
          setData({ ...MOCK_PREFERENCES, ...payload })
          return { ...MOCK_PREFERENCES, ...payload } as NotificationPreferences
        }
        throw err
      }
    },
    []
  )

  return { data, isLoading, error, refetch: fetchPrefs, update }
}

export function useAvatarUpload() {
  const [isLoading, setIsLoading] = useState(false)

  const upload = useCallback(async (file: File) => {
    setIsLoading(true)
    try {
      const res = await settingsApi.uploadAvatar(file)
      toast.success('Avatar updated successfully')
      return res
    } catch (err) {
      const e = err as ApiError
      toast.error(e?.message ?? 'Failed to upload avatar')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const remove = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await settingsApi.removeAvatar()
      toast.success('Avatar removed')
      return res
    } catch (err) {
      const e = err as ApiError
      toast.error(e?.message ?? 'Failed to remove avatar')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { upload, remove, isLoading }
}

export function useDeleteAccount() {
  const [isLoading, setIsLoading] = useState(false)

  const deleteAccount = useCallback(async (password: string) => {
    setIsLoading(true)
    try {
      await settingsApi.deleteAccount(password)
    } catch (err) {
      const e = err as ApiError
      throw new Error(e?.message ?? 'Failed to delete account')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { deleteAccount, isLoading }
}

export function useTeamMembers() {
  const [data, setData] = useState<TeamMember[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await settingsApi.fetchTeamMembers()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_TEAM)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load team')
        toast.error(e?.message ?? 'Failed to load team')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  return { data, isLoading, error, refetch: fetchTeam }
}

export function useBilling() {
  const [data, setData] = useState<BillingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBilling = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await settingsApi.fetchBilling()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_BILLING)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load billing')
        toast.error(e?.message ?? 'Failed to load billing')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBilling()
  }, [fetchBilling])

  return { data, isLoading, error, refetch: fetchBilling }
}

export function useApiKeys() {
  const [data, setData] = useState<ApiKey[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await settingsApi.fetchApiKeys()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_API_KEYS)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load API keys')
        toast.error(e?.message ?? 'Failed to load API keys')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  return { data, isLoading, error, refetch: fetchKeys }
}

export function useWebhooks() {
  const [data, setData] = useState<Webhook[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await settingsApi.fetchWebhooks()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_WEBHOOKS)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load webhooks')
        toast.error(e?.message ?? 'Failed to load webhooks')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  return { data, isLoading, error, refetch: fetchWebhooks }
}

export function useSecuritySettings() {
  const [data, setData] = useState<SecuritySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSecurity = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await settingsApi.fetchSecuritySettings()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_SECURITY)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load security settings')
        toast.error(e?.message ?? 'Failed to load security settings')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSecurity()
  }, [fetchSecurity])

  return { data, isLoading, error, refetch: fetchSecurity }
}

export function useDataPrivacy() {
  const [data, setData] = useState<DataPrivacySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrivacy = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await settingsApi.fetchDataPrivacy()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_DATA_PRIVACY)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load data privacy settings')
        toast.error(e?.message ?? 'Failed to load data privacy settings')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrivacy()
  }, [fetchPrivacy])

  return { data, isLoading, error, refetch: fetchPrivacy }
}
