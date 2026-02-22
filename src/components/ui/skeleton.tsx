import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use shimmer animation instead of pulse for loading states */
  shimmer?: boolean
}

function Skeleton({
  className,
  shimmer = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted',
        shimmer ? 'skeleton-shimmer' : 'animate-pulse',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
