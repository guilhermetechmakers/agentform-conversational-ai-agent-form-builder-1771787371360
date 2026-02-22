import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BackForwardControlsProps {
  className?: string
  /** Optional fallback path when history is empty (e.g. direct navigation) */
  fallbackBackPath?: string
}

export function BackForwardControls({ className, fallbackBackPath }: BackForwardControlsProps) {
  const navigate = useNavigate()

  const canGoBack = typeof window !== 'undefined' && window.history.length > 1
  const canGoForward = typeof window !== 'undefined' && 'scrollRestoration' in window.history

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1)
    } else if (fallbackBackPath) {
      navigate(fallbackBackPath)
    }
  }

  const handleForward = () => {
    navigate(1)
  }

  return (
    <div className={cn('flex items-center gap-1', className)} role="navigation" aria-label="Back and forward navigation">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={handleBack}
        disabled={!canGoBack && !fallbackBackPath}
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={handleForward}
        disabled={!canGoForward}
        aria-label="Go forward"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
