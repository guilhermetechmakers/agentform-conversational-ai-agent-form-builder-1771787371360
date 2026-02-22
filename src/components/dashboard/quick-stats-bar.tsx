import { MessageSquare, CheckCircle, Webhook } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { QuickStats } from '@/types/agents'

interface QuickStatsBarProps {
  stats: QuickStats | null
  isLoading?: boolean
}

function StatCard({
  label,
  value,
  icon: Icon,
  isPercentage,
  isHighGood = true,
}: {
  label: string
  value: number
  icon: React.ElementType
  isPercentage?: boolean
  isHighGood?: boolean
}) {
  const displayValue = isPercentage ? `${value}%` : value.toLocaleString()
  const colorClass =
    isPercentage && value !== 0
      ? isHighGood
        ? value >= 70
          ? 'text-green-600 dark:text-green-400'
          : value >= 40
            ? 'text-muted-foreground'
            : 'text-destructive'
        : value >= 70
          ? 'text-destructive'
          : value >= 40
            ? 'text-muted-foreground'
            : 'text-green-600 dark:text-green-400'
      : ''

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={cn('mt-1 text-2xl font-bold', colorClass)}>
              {displayValue}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickStatsBar({ stats, isLoading }: QuickStatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label={`Total Sessions (${stats.period})`}
        value={stats.total_sessions}
        icon={MessageSquare}
      />
      <StatCard
        label="Completion Rate"
        value={Math.round(stats.completion_rate)}
        icon={CheckCircle}
        isPercentage
        isHighGood
      />
      <StatCard
        label="Webhook Delivery Rate"
        value={Math.round(stats.webhook_delivery_rate)}
        icon={Webhook}
        isPercentage
        isHighGood
      />
    </div>
  )
}
