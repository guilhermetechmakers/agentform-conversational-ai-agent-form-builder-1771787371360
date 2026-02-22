import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, id, ...inputProps }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error && id ? `${id}-error` : undefined}
          {...inputProps}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
        {error && (
          <p
            id={id ? `${id}-error` : undefined}
            className="mt-1.5 text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
