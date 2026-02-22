import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

function calculateStrength(password: string): { strength: PasswordStrength; score: number } {
  if (!password) return { strength: 'weak', score: 0 }

  let score = 0
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 10
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25
  if (/\d/.test(password)) score += 20
  if (/[^a-zA-Z0-9]/.test(password)) score += 20

  const strength: PasswordStrength =
    score >= 80 ? 'strong' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'weak'
  return { strength, score: Math.min(score, 100) }
}

export interface PasswordInputWithStrengthProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string
  value?: string
  onValueChange?: (value: string) => void
}

const PasswordInputWithStrength = React.forwardRef<
  HTMLInputElement,
  PasswordInputWithStrengthProps
>(({ className, error, id, value, onValueChange, onChange, ...inputProps }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState('')
  const displayValue = value ?? internalValue
  const { strength, score } = calculateStrength(displayValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInternalValue(v)
    onValueChange?.(v)
    onChange?.(e)
  }

  const strengthColors = {
    weak: 'bg-destructive',
    fair: 'bg-amber-500',
    good: 'bg-amber-400',
    strong: 'bg-emerald-500',
  }

  const strengthBgColors = {
    weak: 'bg-destructive/20',
    fair: 'bg-amber-500/20',
    good: 'bg-amber-400/20',
    strong: 'bg-emerald-500/20',
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'pr-10',
            error && 'border-destructive focus-visible:ring-destructive animate-shake',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={
            [error && id ? `${id}-error` : undefined, id ? `${id}-strength` : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          value={displayValue}
          onChange={handleChange}
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
      </div>
      {displayValue && (
        <div id={id ? `${id}-strength` : undefined} className="space-y-1.5" role="status">
          <div
            className={cn(
              'h-1.5 w-full rounded-full overflow-hidden transition-colors duration-300',
              strengthBgColors[strength]
            )}
          >
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300 ease-out',
                strengthColors[strength]
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground capitalize">{strength}</p>
        </div>
      )}
      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
})
PasswordInputWithStrength.displayName = 'PasswordInputWithStrength'

export { PasswordInputWithStrength }
