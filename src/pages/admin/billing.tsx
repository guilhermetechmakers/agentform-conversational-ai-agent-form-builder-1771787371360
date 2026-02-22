import { useCallback, useState } from 'react'
import { DollarSign, FileText, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserBillingTable } from '@/components/admin/user-billing-table'
import { InvoiceManagement } from '@/components/admin/invoice-management'
import { PlanConfiguration } from '@/components/admin/plan-configuration'
import {
  useAdminUserBilling,
  useAdminInvoices,
  useAdminPlans,
} from '@/hooks/use-billing'
import * as billingApi from '@/api/billing'
import { toast } from 'sonner'

export function AdminBillingPage() {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const {
    data: userBilling,
    total,
    isLoading: usersLoading,
  } = useAdminUserBilling({
    search: search || undefined,
    plan: planFilter || undefined,
    status: statusFilter || undefined,
    page,
    pageSize,
  })

  const { data: invoices, isLoading: invoicesLoading, refetch: refetchInvoices } = useAdminInvoices()
  const { data: plans, isLoading: plansLoading, refetch: refetchPlans } = useAdminPlans()

  const totalRevenue = userBilling.reduce((sum, u) => sum + (u.amount_due || 0), 0)
  const outstandingCount = userBilling.filter((u) => (u.amount_due || 0) > 0).length
  const activeCount = userBilling.filter((u) => u.status === 'active').length

  const handleResendInvoice = useCallback(async (invoiceId: string) => {
    try {
      await billingApi.resendInvoice(invoiceId)
      toast.success('Invoice resent')
      refetchInvoices()
    } catch {
      toast.error('Failed to resend invoice')
    }
  }, [refetchInvoices])

  const handleAddCredit = useCallback(() => {
    toast.info('Add credit – implement with user selection when API supports')
  }, [])

  const handleCreatePlan = useCallback(
    async (data: { name: string; quota_sessions: number; quota_tokens: number; price_per_month: number }) => {
      await billingApi.createPlan(data)
      refetchPlans()
    },
    [refetchPlans]
  )

  const handleUpdatePlan = useCallback(
    async (id: string, data: { name: string; quota_sessions: number; quota_tokens: number; price_per_month: number }) => {
      await billingApi.updatePlan(id, data)
      refetchPlans()
    },
    [refetchPlans]
  )

  const handleDeletePlan = useCallback(
    async (id: string) => {
      await billingApi.deletePlan(id)
      refetchPlans()
    },
    [refetchPlans]
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing Management</h1>
        <p className="text-muted-foreground mt-1">
          User billing overview, invoice management, and plan configuration
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-xl border-border bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount Due
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Invoices
            </CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{outstandingCount}</div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-xl border-border transition-all duration-300 hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subscriptions
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{activeCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Billing Overview */}
      <UserBillingTable
        data={userBilling}
        total={total}
        page={page}
        pageSize={pageSize}
        isLoading={usersLoading}
        search={search}
        onSearchChange={setSearch}
        planFilter={planFilter}
        onPlanFilterChange={setPlanFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Invoice Management & Plan Configuration */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InvoiceManagement
          invoices={invoices}
          isLoading={invoicesLoading}
          onResend={handleResendInvoice}
          onAddCredit={handleAddCredit}
        />
        <PlanConfiguration
          plans={plans}
          isLoading={plansLoading}
          onCreatePlan={handleCreatePlan}
          onUpdatePlan={handleUpdatePlan}
          onDeletePlan={handleDeletePlan}
        />
      </div>
    </div>
  )
}
