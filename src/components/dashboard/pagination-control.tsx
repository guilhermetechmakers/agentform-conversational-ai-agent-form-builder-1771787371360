import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationControlProps {
  hasMore: boolean
  isLoading?: boolean
  onLoadMore: () => void
  className?: string
}

export function PaginationControl({
  hasMore,
  isLoading,
  onLoadMore,
  className,
}: PaginationControlProps) {
  if (!hasMore) return null

  return (
    <div
      className={cn(
        'flex justify-center pt-8',
        className
      )}
    >
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={isLoading}
        className="min-w-[160px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Load more'
        )}
      </Button>
    </div>
  )
}
