import {
  Eye,
  Users,
  TrendingUp,
  Link2,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { LinkAnalytics } from '@/types/public-links'

interface AnalyticsCardProps {
  analytics: LinkAnalytics | null
  isLoading?: boolean
  className?: string
}

function MetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: number | string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-4 transition-all duration-200 hover:shadow-card">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function AnalyticsCard({
  analytics,
  isLoading,
  className,
}: AnalyticsCardProps) {
  if (isLoading) {
    return (
      <Card
        className={cn(
          'transition-all duration-300 hover:shadow-card-hover',
          className
        )}
      >
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          <Skeleton className="h-32 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card
        className={cn(
          'transition-all duration-300 hover:shadow-card-hover',
          className
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No analytics yet</h3>
          <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
            Analytics will appear here once your public link receives visits.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Link analytics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {analytics.period ?? 'All time'} · Page views and visitor metrics
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricItem
            icon={Eye}
            label="Total views"
            value={analytics.views}
          />
          <MetricItem
            icon={Users}
            label="Unique visitors"
            value={analytics.unique_visitors}
          />
        </div>

        {(analytics.referrers?.length > 0 || analytics.utm?.length > 0) && (
          <div className="space-y-4">
            {analytics.referrers?.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Link2 className="h-4 w-4" />
                  Top referrers
                </h4>
                <ul className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
                  {analytics.referrers.slice(0, 5).map((r, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate text-muted-foreground">
                        {r.referrer || 'Direct'}
                      </span>
                      <span className="font-medium">{r.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analytics.utm?.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  UTM parameters
                </h4>
                <ul className="space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
                  {analytics.utm.slice(0, 5).map((u, i) => {
                    const utmItem = u as { source?: string; medium?: string; campaign?: string; param?: string; value?: string; count: number }
                    const label = utmItem.param != null
                      ? `${utmItem.param}: ${utmItem.value ?? ''}`
                      : [utmItem.source, utmItem.medium, utmItem.campaign].filter(Boolean).join(' / ') || '—'
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate text-muted-foreground">
                          {label}
                        </span>
                        <span className="font-medium">{u.count}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
