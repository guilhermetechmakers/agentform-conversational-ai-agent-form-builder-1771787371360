import { TrendingUp, CreditCard, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useBilling } from '@/hooks/use-settings'

export function BillingCard() {
  const { data, isLoading, error, refetch } = useBilling()

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-destructive text-center">{error ?? 'Failed to load billing'}</p>
          <Button variant="outline" className="mt-4 mx-auto block" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const usage = data.usage_metrics
  const sessionsUsed = usage?.sessions_used ?? 0
  const sessionsLimit = usage?.sessions_limit ?? 100
  const sessionsPercent = sessionsLimit > 0 ? Math.min(100, (sessionsUsed / sessionsLimit) * 100) : 0
  const storageUsed = usage?.storage_used_mb ?? 0
  const storageLimit = usage?.storage_limit_mb ?? 100
  const storagePercent = storageLimit > 0 ? Math.min(100, (storageUsed / storageLimit) * 100) : 0

  return (
    <Card className="animate-fade-in transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Billing & Plans</CardTitle>
          <CardDescription>Manage your subscription, usage, and payment methods</CardDescription>
        </div>
        <div className="rounded-lg bg-primary/20 px-3 py-1.5">
          <span className="font-semibold text-sm">{data.current_plan}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Sessions
            </div>
            <p className="mt-1 text-2xl font-bold">
              {sessionsUsed}
              <span className="text-sm font-normal text-muted-foreground"> / {sessionsLimit}</span>
            </p>
            <Progress value={sessionsPercent} className="mt-2 h-2" />
          </div>
          <div className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Storage
            </div>
            <p className="mt-1 text-2xl font-bold">
              {storageUsed} MB
              <span className="text-sm font-normal text-muted-foreground"> / {storageLimit} MB</span>
            </p>
            <Progress value={storagePercent} className="mt-2 h-2" />
          </div>
        </div>

        {data.payment_method?.last4 ? (
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {data.payment_method.brand ?? 'Card'} •••• {data.payment_method.last4}
              </p>
              <p className="text-sm text-muted-foreground">
                Expires {data.payment_method.expiry_month}/{data.payment_method.expiry_year}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto">
              Update
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No payment method</p>
            <p className="text-sm text-muted-foreground">Add a card to upgrade your plan</p>
            <Button variant="outline" className="mt-4" disabled>
              Add payment method
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button disabled>Upgrade plan</Button>
          <Button variant="outline" disabled>
            View invoices
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
