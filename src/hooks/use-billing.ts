import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import * as billingApi from '@/api/billing'
import type { UserBillingSummary, Invoice, Plan, AdminUserBilling } from '@/types/billing'
import type { ApiError } from '@/lib/api'

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

const MOCK_SUMMARY: UserBillingSummary = {
  current_plan: 'Free',
  plan_id: 'free',
  price_per_month: 0,
  renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  usage: {
    sessions_used: 42,
    sessions_limit: 100,
    tokens_used: 12500,
    tokens_limit: 100000,
  },
  payment_method: { brand: 'visa', last4: '4242', expiry_month: 12, expiry_year: 2025 },
  invoices: [
    {
      id: 'inv_1',
      user_id: '1',
      amount: 0,
      currency: 'USD',
      status: 'paid',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  plans: [
    { id: 'free', name: 'Free', quota_sessions: 100, quota_tokens: 100000, price_per_month: 0 },
    { id: 'starter', name: 'Starter', quota_sessions: 500, quota_tokens: 500000, price_per_month: 19 },
    { id: 'pro', name: 'Pro', quota_sessions: 2000, quota_tokens: 2000000, price_per_month: 49 },
  ],
}

export function useBillingSummary() {
  const [data, setData] = useState<UserBillingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await billingApi.fetchBillingSummary()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_SUMMARY)
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
    fetchSummary()
  }, [fetchSummary])

  return { data, isLoading, error, refetch: fetchSummary }
}

export function useInvoices() {
  const [data, setData] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await billingApi.fetchInvoices()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_SUMMARY.invoices)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load invoices')
        toast.error(e?.message ?? 'Failed to load invoices')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return { data, isLoading, error, refetch: fetchInvoices }
}

export function useBillingPortal() {
  const [isLoading, setIsLoading] = useState(false)

  const openPortal = useCallback(async () => {
    setIsLoading(true)
    try {
      const { url } = await billingApi.createBillingPortalSession()
      window.location.href = url
    } catch (err) {
      const e = err as ApiError
      toast.error(e?.message ?? 'Failed to open billing portal')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { openPortal, isLoading }
}

export function useCheckoutSession() {
  const [isLoading, setIsLoading] = useState(false)

  const checkout = useCallback(async (planId: string) => {
    setIsLoading(true)
    try {
      const { url } = await billingApi.createCheckoutSession(planId)
      window.location.href = url
    } catch (err) {
      const e = err as ApiError
      toast.error(e?.message ?? 'Failed to start checkout')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { checkout, isLoading }
}

// --- Admin hooks ---

export function useAdminUserBilling(params?: {
  search?: string
  plan?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  const [data, setData] = useState<AdminUserBilling[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await billingApi.fetchAdminUserBilling(params)
      setData(res.data)
      setTotal(res.total)
    } catch (err) {
      if (isNetworkError(err)) {
        setData([
          {
            user_id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            plan: 'Pro',
            plan_id: 'pro',
            status: 'active',
            amount_due: 49,
            sessions_used: 125,
            sessions_limit: 2000,
            last_invoice_date: '2024-03-01',
          },
          {
            user_id: '2',
            email: 'jane@example.com',
            name: 'Jane User',
            plan: 'Starter',
            plan_id: 'starter',
            status: 'active',
            amount_due: 19,
            sessions_used: 320,
            sessions_limit: 500,
            last_invoice_date: '2024-03-05',
          },
        ])
        setTotal(2)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load user billing')
        toast.error(e?.message ?? 'Failed to load user billing')
      }
    } finally {
      setIsLoading(false)
    }
  }, [params?.search, params?.plan, params?.status, params?.page, params?.pageSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, total, isLoading, error, refetch: fetchData }
}

export function useAdminInvoices(params?: {
  user_id?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  const [data, setData] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await billingApi.fetchAdminInvoices(params)
      setData(res.data)
    } catch (err) {
      if (isNetworkError(err)) {
        setData([])
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load invoices')
        toast.error(e?.message ?? 'Failed to load invoices')
      }
    } finally {
      setIsLoading(false)
    }
  }, [params?.user_id, params?.status, params?.page, params?.pageSize])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

export function useAdminPlans() {
  const [data, setData] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await billingApi.fetchPlans()
      setData(res)
    } catch (err) {
      if (isNetworkError(err)) {
        setData(MOCK_SUMMARY.plans)
      } else {
        const e = err as ApiError
        setError(e?.message ?? 'Failed to load plans')
        toast.error(e?.message ?? 'Failed to load plans')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  return { data, isLoading, error, refetch: fetchPlans }
}
