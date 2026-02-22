import { CreditCard, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { UserBillingSummary } from '@/types/billing'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

interface CurrentPlanSummaryProps {
  data: UserBillingSummary | null
  isLoading: boolean
}

export function CurrentPlanSummary({ data, isLoading }: CurrentPlanSummaryProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { current_plan, price_per_month, renewal_date, usage } = data
  const sessionsPercent =
    usage.sessions_limit > 0 ? Math.min(100, (usage.sessions_used / usage.sessions_limit) * 100) : 0
  const tokensPercent =
    usage.tokens_limit > 0 ? Math.min(100, (usage.tokens_used / usage.tokens_limit) * 100) : 0
  const isNearLimit = sessionsPercent >= 80 || tokensPercent >= 80

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300',
        'bg-gradient-to-br from-primary/10 via-card to-card',
        'hover:shadow-card-hover border-border'
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-xl">Current Plan</CardTitle>
          <CardDescription>Your subscription and usage summary</CardDescription>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            'text-sm font-semibold px-3 py-1',
            isNearLimit && 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400'
          )}
        >
          {current_plan}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/50 p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Monthly cost
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(price_per_month)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Renews {formatDate(renewal_date)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/50 p-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Sessions used
            </div>
            <p className="mt-1 text-2xl font-bold">
              {usage.sessions_used.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">
                {' '}
                / {usage.sessions_limit.toLocaleString()}
              </span>
            </p>
            <Progress
              value={sessionsPercent}
              className={cn(
                'mt-2 h-2',
                sessionsPercent >= 90 && '[&>*]:bg-destructive'
              )}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            Token usage
          </div>
          <p className="mt-1 text-2xl font-bold">
            {usage.tokens_used.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">
              {' '}
              / {usage.tokens_limit.toLocaleString()}
            </span>
          </p>
          <Progress
            value={tokensPercent}
            className={cn(
              'mt-2 h-2',
              tokensPercent >= 90 && '[&>*]:bg-destructive'
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
