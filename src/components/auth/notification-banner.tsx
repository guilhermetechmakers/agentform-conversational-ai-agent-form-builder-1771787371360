import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NotificationBannerProps {
  message: string
  variant?: 'error' | 'success'
  onDismiss?: () => void
  className?: string
}

const NotificationBanner = React.forwardRef<HTMLDivElement, NotificationBannerProps>(
  ({ message, variant = 'error', onDismiss, className }, ref) => {
    const isError = variant === 'error'

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200',
          isError
            ? 'bg-destructive text-white'
            : 'bg-emerald-600 text-white',
          className
        )}
      >
        <p className="flex-1 font-medium">{message}</p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded p-1.5 text-white/90 hover:bg-white/20 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
NotificationBanner.displayName = 'NotificationBanner'

export { NotificationBanner }
