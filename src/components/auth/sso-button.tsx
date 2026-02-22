import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface SSOButtonProps {
  onClick?: () => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

const DEFAULT_LABEL = 'Enterprise Login'
const DEFAULT_TOOLTIP =
  'Sign in with your organization\'s SAML or OIDC SSO. Contact your admin for access.'

export function SSOButton({
  onClick,
  disabled,
  className,
  children,
}: SSOButtonProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={onClick}
            disabled={disabled}
            className={cn(
              'h-10 w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
              'border-border hover:bg-muted/50',
              className
            )}
            aria-label={DEFAULT_LABEL}
          >
            <Building2 className="h-4 w-4" />
            <span className="ml-2">{children ?? DEFAULT_LABEL}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px]">
          <p>{DEFAULT_TOOLTIP}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
