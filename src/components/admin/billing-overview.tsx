import { CreditCard, TrendingUp, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AdminBilling } from '@/types/admin'

interface BillingOverviewProps {
  billing: AdminBilling[]
  isLoading?: boolean
  onUpgrade?: () => void
  onDowngrade?: () => void
  onViewInvoices?: () => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function BillingOverview({
  billing,
  isLoading,
  onUpgrade,
  onDowngrade,
  onViewInvoices,
}: BillingOverviewProps) {
  const totalDue = billing.reduce((sum, b) => sum + b.amount_due, 0)
  const plans = [...new Set(billing.map((b) => b.plan))]

  if (billing.length === 0 && !isLoading) {
    return (
      <Card className="rounded-xl border-[#EDEDED]">
        <CardHeader>
          <CardTitle>Billing & Plan Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No billing data</h3>
            <p className="text-[#687076] mt-1 max-w-sm">
              Billing information will appear here when available.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className={cn(
            'rounded-xl border-[#EDEDED] bg-gradient-to-br from-primary/10 to-transparent',
            'transition-all duration-200 hover:shadow-card-hover'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#687076]">
              Total Amount Due
            </CardTitle>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-[#191A1D]">
                {formatCurrency(totalDue)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card
          className={cn(
            'rounded-xl border-[#EDEDED]',
            'transition-all duration-200 hover:shadow-card-hover'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#687076]">
              Active Plans
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-[#191A1D]">
                {plans.length}
              </div>
            )}
          </CardContent>
        </Card>
        <Card
          className={cn(
            'rounded-xl border-[#EDEDED]',
            'transition-all duration-200 hover:shadow-card-hover'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#687076]">
              Billing Records
            </CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-[#191A1D]">
                {billing.length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan controls */}
      <Card className="rounded-xl border-[#EDEDED]">
        <CardHeader>
          <CardTitle>Plan Controls</CardTitle>
          <p className="text-sm text-[#687076]">
            Upgrade or downgrade plans and manage usage metering.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={onUpgrade} className="transition-transform hover:scale-[1.02]">
              Upgrade Plan
            </Button>
            <Button
              variant="outline"
              onClick={onDowngrade}
              className="transition-transform hover:scale-[1.02]"
            >
              Downgrade Plan
            </Button>
            <Button
              variant="outline"
              onClick={onViewInvoices}
              className="transition-transform hover:scale-[1.02]"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Invoices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing table */}
      <Card className="rounded-xl border-[#EDEDED]">
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
          <p className="text-sm text-[#687076]">
            Current billing status and payment history.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#EDEDED]">
                    <th className="text-left py-3 px-4 font-medium">Plan</th>
                    <th className="text-left py-3 px-4 font-medium">Usage</th>
                    <th className="text-left py-3 px-4 font-medium">Amount Due</th>
                    <th className="text-left py-3 px-4 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.map((record) => (
                    <tr
                      key={record.billing_id}
                      className="border-b border-[#EDEDED] hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{record.plan}</Badge>
                      </td>
                      <td className="py-3 px-4 text-[#687076]">
                        {record.usage.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(record.amount_due)}
                      </td>
                      <td className="py-3 px-4 text-[#687076] text-sm">
                        {formatDate(record.due_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
