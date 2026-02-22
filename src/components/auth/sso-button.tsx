import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SSOButtonProps {
  onClick: () => void | Promise<void>
  disabled?: boolean
  className?: string
  label?: string
}

export function SSOButton({
  onClick,
  disabled,
  className,
  label = 'Enterprise Login',
}: SSOButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full h-10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-border',
        className
      )}
      aria-label={label}
    >
      <Building2 className="h-4 w-4" aria-hidden />
      <span className="ml-2">{label}</span>
    </Button>
  )
}
