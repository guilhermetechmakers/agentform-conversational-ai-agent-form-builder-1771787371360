import * as React from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AlertVariant = 'error' | 'success'

export interface AlertMessageProps {
  variant: AlertVariant
  message: string
  className?: string
}

const AlertMessage = React.forwardRef<HTMLDivElement, AlertMessageProps>(
  ({ variant, message, className }, ref) => {
    const isError = variant === 'error'
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
          isError
            ? 'border-destructive/50 bg-destructive/10 text-destructive'
            : 'border-accent/50 bg-accent/20 text-foreground',
          className
        )}
      >
        {isError ? (
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-accent-foreground" />
        )}
        <p className="flex-1">{message}</p>
      </div>
    )
  }
)
AlertMessage.displayName = 'AlertMessage'

export { AlertMessage }
