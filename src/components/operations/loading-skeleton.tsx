import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export type LoadingSkeletonVariant = 'list' | 'form' | 'card'

export interface LoadingSkeletonProps {
  variant?: LoadingSkeletonVariant
  count?: number
  className?: string
}

function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-border p-4"
        >
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" shimmer />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" shimmer />
            <Skeleton className="h-3 w-1/2" shimmer />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" shimmer />
        </div>
      ))}
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" shimmer />
        <Skeleton className="h-10 w-full rounded-lg" shimmer />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" shimmer />
        <Skeleton className="h-24 w-full rounded-lg" shimmer />
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24 rounded-lg" shimmer />
        <Skeleton className="h-10 w-24 rounded-lg" shimmer />
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" shimmer />
            <Skeleton className="h-6 w-20 rounded-full" shimmer />
          </div>
          <Skeleton className="h-4 w-full" shimmer />
          <Skeleton className="h-4 w-2/3" shimmer />
          <div className="pt-2">
            <Skeleton className="h-2 w-full rounded-full" shimmer />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoadingSkeleton({
  variant = 'list',
  count = 5,
  className,
}: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {variant === 'list' && <ListSkeleton count={count} />}
      {variant === 'form' && <FormSkeleton />}
      {variant === 'card' && <CardSkeleton />}
    </div>
  )
}
