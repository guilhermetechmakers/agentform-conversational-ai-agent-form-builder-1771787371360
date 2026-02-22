/** Billing & Usage Metering types per schema requirements */

export type InvoiceStatus = 'paid' | 'pending' | 'overdue'
export type SubscriptionStatus = 'active' | 'inactive'

export interface Plan {
  id: string
  name: string
  quota_sessions: number
  quota_tokens: number
  price_per_month: number
  stripe_price_id?: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  start_date: string
  end_date: string
  status: SubscriptionStatus
}

export interface Invoice {
  id: string
  user_id: string
  amount: number
  currency: string
  status: InvoiceStatus
  created_at: string
  invoice_url?: string
  pdf_url?: string
}

export interface SessionUsage {
  id: string
  user_id: string
  tokens_used: number
  cost: number
  timestamp: string
}

export interface UserBillingSummary {
  current_plan: string
  plan_id: string
  price_per_month: number
  renewal_date: string
  usage: {
    sessions_used: number
    sessions_limit: number
    tokens_used: number
    tokens_limit: number
  }
  payment_method?: {
    brand?: string
    last4?: string
    expiry_month?: number
    expiry_year?: number
  }
  invoices: Invoice[]
  plans: Plan[]
}

export interface AdminUserBilling {
  user_id: string
  email: string
  name: string
  plan: string
  plan_id: string
  status: SubscriptionStatus
  amount_due: number
  sessions_used: number
  sessions_limit: number
  last_invoice_date?: string
}

export interface CreatePlanInput {
  name: string
  quota_sessions: number
  quota_tokens: number
  price_per_month: number
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {}
