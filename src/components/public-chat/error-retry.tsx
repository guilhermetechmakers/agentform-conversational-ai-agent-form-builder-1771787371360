import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorRetryProps {
  message: string
  onRetry: () => void
  className?: string
}

export function ErrorRetry({ message, onRetry, className }: ErrorRetryProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-6 rounded-xl border border-destructive/30 bg-destructive/5',
        className
      )}
    >
      <p className="text-sm text-destructive font-medium text-center">
        {message}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="border-destructive/50 text-destructive hover:bg-destructive/10"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  )
}
