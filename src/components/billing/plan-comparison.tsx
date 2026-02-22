import { Check, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types/billing'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

interface PlanComparisonProps {
  plans: Plan[]
  currentPlanId: string
  isLoading: boolean
  onSelectPlan?: (planId: string) => void
}

export function PlanComparison({
  plans,
  currentPlanId,
  isLoading,
  onSelectPlan,
}: PlanComparisonProps) {
  if (isLoading) {
    return (
      <Card className="transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Plans & Pricing</CardTitle>
        <CardDescription>Compare plans and upgrade or downgrade your subscription</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId
            const isFree = plan.price_per_month === 0

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-xl border p-6 transition-all duration-200',
                  isCurrent
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:shadow-card-hover'
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-2 left-4">
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      Current
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {formatCurrency(plan.price_per_month)}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {formatNumber(plan.quota_sessions)} sessions
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {formatNumber(plan.quota_tokens)} tokens
                  </li>
                </ul>
                {onSelectPlan && !isCurrent && (
                  <Button
                    variant={isFree ? 'outline' : 'default'}
                    className="mt-6 w-full transition-transform hover:scale-[1.02]"
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    {isFree ? 'Downgrade' : 'Upgrade'}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
