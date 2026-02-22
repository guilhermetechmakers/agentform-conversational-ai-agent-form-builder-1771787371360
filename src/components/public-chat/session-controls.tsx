import { Download, PhoneOff, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SessionControlsProps {
  onEndSession: () => void
  onDownloadTranscript: () => void
  onRequestHuman?: () => void
  disabled?: boolean
  hasEnded?: boolean
  /** compact: inline in header; full: bottom bar with border */
  variant?: 'compact' | 'full'
  className?: string
}

export function SessionControls({
  onEndSession,
  onDownloadTranscript,
  onRequestHuman,
  disabled,
  hasEnded,
  variant = 'full',
  className,
}: SessionControlsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        variant === 'full' && 'max-w-3xl mx-auto px-4 py-2 border-t border-border',
        variant === 'compact' && 'gap-1.5',
        className
      )}
    >
      {!hasEnded && (
        <Button
          variant="ghost"
          size={variant === 'compact' ? 'icon' : 'sm'}
          onClick={onEndSession}
          disabled={disabled}
          className="focus-visible:ring-2 focus-visible:ring-blue-200 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="End session"
        >
          <PhoneOff className="h-4 w-4" />
          {variant === 'full' && <span className="ml-1.5">End session</span>}
        </Button>
      )}
      <Button
        variant="ghost"
        size={variant === 'compact' ? 'icon' : 'sm'}
        onClick={onDownloadTranscript}
        disabled={disabled}
        className="focus-visible:ring-2 focus-visible:ring-blue-200 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Download transcript"
      >
        <Download className="h-4 w-4" />
        {variant === 'full' && <span className="ml-1.5">Download transcript</span>}
      </Button>
      {onRequestHuman && !hasEnded && (
        <Button
          variant="ghost"
          size={variant === 'compact' ? 'icon' : 'sm'}
          onClick={onRequestHuman}
          disabled={disabled}
          className="focus-visible:ring-2 focus-visible:ring-blue-200 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Request human contact"
        >
          <Headphones className="h-4 w-4" />
          {variant === 'full' && <span className="ml-1.5">Request human contact</span>}
        </Button>
      )}
    </div>
  )
}
