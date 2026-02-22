import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import type {
  Invoice,
  Plan,
  UserBillingSummary,
  AdminUserBilling,
  CreatePlanInput,
  UpdatePlanInput,
} from '@/types/billing'
import type { BillingInfo as SettingsBillingInfo } from '@/types/settings'

const BILLING_BASE = '/billing'

/** Fetch user billing summary (plan, usage, invoices, payment method) */
export async function fetchBillingSummary(): Promise<UserBillingSummary> {
  const res = await apiGet<Record<string, unknown>>(BILLING_BASE)
  return normalizeBillingSummary(res)
}

/** Fetch user billing (settings-compatible) */
export async function fetchBilling(): Promise<SettingsBillingInfo> {
  const res = await apiGet<Record<string, unknown>>(BILLING_BASE)
  return normalizeBillingInfo(res)
}

/** Fetch user invoices */
export async function fetchInvoices(): Promise<Invoice[]> {
  const res = await apiGet<Invoice[]>(`${BILLING_BASE}/invoices`)
  return res ?? []
}

/** Update payment method (Stripe payment method ID) */
export async function updatePaymentMethod(paymentMethodId: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`${BILLING_BASE}/payment-method`, {
    payment_method_id: paymentMethodId,
  })
}

/** Create Stripe Customer Portal session for managing billing */
export async function createBillingPortalSession(): Promise<{ url: string }> {
  return apiPost<{ url: string }>(`${BILLING_BASE}/portal`, {})
}

/** Create Stripe Checkout session for plan upgrade */
export async function createCheckoutSession(planId: string): Promise<{ url: string }> {
  return apiPost<{ url: string }>(`${BILLING_BASE}/checkout`, { plan_id: planId })
}

/** Download invoice PDF */
export async function getInvoicePdfUrl(invoiceId: string): Promise<string> {
  return `${import.meta.env.VITE_API_URL ?? '/api'}${BILLING_BASE}/invoices/${invoiceId}/pdf`
}

// --- Admin APIs ---

/** Fetch all users with billing status */
export async function fetchAdminUserBilling(params?: {
  search?: string
  plan?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<{ data: AdminUserBilling[]; total: number; page: number; pageSize: number }> {
  const q = new URLSearchParams()
  if (params?.search) q.set('search', params.search)
  if (params?.plan) q.set('plan', params.plan)
  if (params?.status) q.set('status', params.status)
  if (params?.page) q.set('page', String(params.page))
  if (params?.pageSize) q.set('pageSize', String(params.pageSize))
  const query = q.toString()
  const res = await apiGet<{ data: AdminUserBilling[]; total: number; page: number; pageSize: number }>(
    `/admin/billing/users${query ? `?${query}` : ''}`
  )
  return res
}

/** Fetch admin invoices */
export async function fetchAdminInvoices(params?: {
  user_id?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<{ data: Invoice[]; total: number; page: number; pageSize: number }> {
  const q = new URLSearchParams()
  if (params?.user_id) q.set('user_id', params.user_id)
  if (params?.status) q.set('status', params.status)
  if (params?.page) q.set('page', String(params.page))
  if (params?.pageSize) q.set('pageSize', String(params.pageSize))
  const query = q.toString()
  const res = await apiGet<{ data: Invoice[]; total: number; page: number; pageSize: number }>(
    `/admin/billing/invoices${query ? `?${query}` : ''}`
  )
  return res
}

/** Resend invoice to user */
export async function resendInvoice(invoiceId: string): Promise<void> {
  await apiPost(`/admin/billing/invoices/${invoiceId}/resend`, {})
}

/** Add credit/adjustment to user */
export async function addBillingAdjustment(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  await apiPost(`/admin/billing/adjustments`, {
    user_id: userId,
    amount,
    description,
  })
}

/** Fetch plans */
export async function fetchPlans(): Promise<Plan[]> {
  const res = await apiGet<Plan[]>(`/admin/billing/plans`)
  return res ?? []
}

/** Create plan */
export async function createPlan(input: CreatePlanInput): Promise<Plan> {
  return apiPost<Plan>(`/admin/billing/plans`, input)
}

/** Update plan */
export async function updatePlan(id: string, input: UpdatePlanInput): Promise<Plan> {
  return apiPut<Plan>(`/admin/billing/plans/${id}`, input)
}

/** Delete plan */
export async function deletePlan(id: string): Promise<void> {
  await apiDelete(`/admin/billing/plans/${id}`)
}

// --- Helpers ---

function normalizeBillingSummary(res: Record<string, unknown>): UserBillingSummary {
  const usage = (res.usage_metrics ?? res.usage ?? {}) as Record<string, number>
  const plans = (res.plans ?? []) as Plan[]
  const invoices = (res.invoices ?? []) as Invoice[]
  return {
    current_plan: (res.current_plan as string) ?? 'Free',
    plan_id: (res.plan_id as string) ?? '',
    price_per_month: (res.price_per_month as number) ?? 0,
    renewal_date: (res.renewal_date as string) ?? '',
    usage: {
      sessions_used: usage.sessions_used ?? 0,
      sessions_limit: usage.sessions_limit ?? 100,
      tokens_used: usage.tokens_used ?? 0,
      tokens_limit: usage.tokens_limit ?? 100000,
    },
    payment_method: res.payment_method as UserBillingSummary['payment_method'],
    invoices,
    plans,
  }
}

function normalizeBillingInfo(res: Record<string, unknown>): SettingsBillingInfo {
  const n = normalizeBillingSummary(res)
  return {
    id: (res.id as string) ?? '1',
    user_id: (res.user_id as string) ?? '1',
    current_plan: n.current_plan,
    plan_id: n.plan_id,
    price_per_month: n.price_per_month,
    renewal_date: n.renewal_date,
    usage_metrics: {
      sessions_used: n.usage.sessions_used,
      sessions_limit: n.usage.sessions_limit,
      tokens_used: n.usage.tokens_used,
      tokens_limit: n.usage.tokens_limit,
    },
    payment_method: n.payment_method,
    invoices: n.invoices,
    plans: n.plans,
  }
}
