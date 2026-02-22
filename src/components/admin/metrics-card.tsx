import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface MetricsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string | null
  progress?: { value: number; max: number; label?: string }
  status?: 'normal' | 'warning' | 'critical'
  className?: string
}

export function MetricsCard({
  label,
  value,
  icon: Icon,
  trend,
  progress,
  status = 'normal',
  className,
}: MetricsCardProps) {
  const progressPercent = progress
    ? Math.min(100, (progress.value / progress.max) * 100)
    : undefined

  const statusVariant =
    status === 'critical'
      ? 'destructive'
      : status === 'warning'
        ? 'warning'
        : 'secondary'

  return (
    <Card
      className={cn(
        'rounded-xl border-[#EDEDED] bg-[#FFFFFF] shadow-sm transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#687076]">
          {label}
        </CardTitle>
        <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#191A1D]">{value}</div>
        {trend && (
          <p className="text-xs text-[#687076] mt-1">
            <span className="text-accent-foreground">{trend}</span> from last
            period
          </p>
        )}
        {progress !== undefined && progressPercent !== undefined && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#687076]">
                {progress.label ?? 'Usage'}
              </span>
              <span className="font-medium">
                {progress.value.toLocaleString()} / {progress.max.toLocaleString()}
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="h-2"
            />
            {progressPercent >= 90 && (
              <Badge variant={statusVariant} className="mt-1">
                {progressPercent >= 100 ? 'Over limit' : 'Near limit'}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
