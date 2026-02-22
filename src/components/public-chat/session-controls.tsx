import { Download, PhoneOff, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SessionControlsProps {
  onEndSession: () => void
  onDownloadTranscript: () => void
  onRequestHuman?: () => void
  disabled?: boolean
  hasEnded?: boolean
  className?: string
}

export function SessionControls({
  onEndSession,
  onDownloadTranscript,
  onRequestHuman,
  disabled,
  hasEnded,
  className,
}: SessionControlsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 max-w-3xl mx-auto px-4 py-2 border-t border-border',
        className
      )}
    >
      {!hasEnded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEndSession}
          disabled={disabled}
          className="focus-visible:ring-2 focus-visible:ring-blue-200"
          aria-label="End session"
        >
          <PhoneOff className="h-4 w-4" />
          End session
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDownloadTranscript}
        disabled={disabled}
        className="focus-visible:ring-2 focus-visible:ring-blue-200"
        aria-label="Download transcript"
      >
        <Download className="h-4 w-4" />
        Download transcript
      </Button>
      {onRequestHuman && !hasEnded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRequestHuman}
          disabled={disabled}
          className="focus-visible:ring-2 focus-visible:ring-blue-200"
          aria-label="Request human contact"
        >
          <Headphones className="h-4 w-4" />
          Request human contact
        </Button>
      )}
    </div>
  )
}
