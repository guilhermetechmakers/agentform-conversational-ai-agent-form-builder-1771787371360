import { useState } from 'react'
import { RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface ReplayModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  sessionLabel?: string
  onReplay: (sessionId: string) => Promise<void>
}

export function ReplayModal({
  open,
  onOpenChange,
  sessionId,
  sessionLabel,
  onReplay,
}: ReplayModalProps) {
  const [isReplaying, setIsReplaying] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleReplay = async () => {
    if (!confirmed) return
    setIsReplaying(true)
    try {
      await onReplay(sessionId)
      onOpenChange(false)
      setConfirmed(false)
    } finally {
      setIsReplaying(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setConfirmed(false)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showClose={!isReplaying}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Replay Webhook
          </DialogTitle>
          <DialogDescription>
            This will re-send the session data to the configured webhook URL.
            {sessionLabel && (
              <span className="mt-1 block font-medium text-foreground">
                Session: {sessionLabel}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p>
                The webhook will receive the same payload as the original
                delivery. Ensure your webhook endpoint can handle duplicate
                requests.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="replay-confirm"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
            />
            <Label
              htmlFor="replay-confirm"
              className="text-sm font-medium cursor-pointer"
            >
              I understand this will trigger the webhook again
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isReplaying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReplay}
            disabled={!confirmed || isReplaying}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isReplaying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Replay Webhook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
