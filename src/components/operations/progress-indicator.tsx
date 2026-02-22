import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface ProgressIndicatorProps {
  value: number
  showPercentage?: boolean
  label?: string
  className?: string
}

export function ProgressIndicator({
  value,
  showPercentage = true,
  label,
  className,
}: ProgressIndicatorProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="text-muted-foreground font-medium">{label}</span>
          )}
          {showPercentage && (
            <span
              className={cn(
                'font-medium tabular-nums',
                clampedValue < 100 ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <Progress
        value={clampedValue}
        className="h-2.5 overflow-hidden rounded-full bg-muted"
      />
    </div>
  )
}
