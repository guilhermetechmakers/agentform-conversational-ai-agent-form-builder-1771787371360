import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  /** Fallback path when history is empty */
  fallbackTo?: string
  label?: string
  className?: string
  variant?: 'ghost' | 'outline' | 'link'
}

export function BackButton({
  fallbackTo = '/dashboard',
  label = 'Back',
  className,
  variant = 'ghost',
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallbackTo)
    }
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleClick}
      className={cn('gap-2', className)}
      aria-label={`Go ${label.toLowerCase()}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}
