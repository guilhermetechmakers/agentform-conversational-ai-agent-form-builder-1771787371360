import { useState, useCallback, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { WebhookLog } from '@/types/webhooks'
import { cn } from '@/lib/utils'

export interface ReplayWebhookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: WebhookLog | null
  onReplay: (logId: string, editPayload?: Record<string, unknown>) => Promise<void>
}

export function ReplayWebhookModal({
  open,
  onOpenChange,
  log,
  onReplay,
}: ReplayWebhookModalProps) {
  const [isReplaying, setIsReplaying] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [payloadEdit, setPayloadEdit] = useState('')
  const [payloadError, setPayloadError] = useState<string | null>(null)

  const initialPayloadStr = log?.payload
    ? JSON.stringify(log.payload, null, 2)
    : '{}'

  useEffect(() => {
    if (open && log) {
      setPayloadEdit(initialPayloadStr)
    }
  }, [open, log?.id, initialPayloadStr])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setConfirmed(false)
        setPayloadEdit('')
        setPayloadError(null)
      }
      onOpenChange(next)
    },
    [onOpenChange]
  )

  const handlePayloadChange = (value: string) => {
    setPayloadEdit(value)
    setPayloadError(null)
    try {
      if (value.trim()) JSON.parse(value)
    } catch {
      setPayloadError('Invalid JSON')
    }
  }

  const handleReplay = async () => {
    if (!log || !confirmed) return
    if (payloadEdit.trim()) {
      try {
        JSON.parse(payloadEdit)
      } catch {
        setPayloadError('Invalid JSON - fix before replaying')
        return
      }
    }
    setIsReplaying(true)
    try {
      let editPayload: Record<string, unknown> | undefined
      if (payloadEdit.trim()) {
        try {
          editPayload = JSON.parse(payloadEdit) as Record<string, unknown>
        } catch {
          setPayloadError('Invalid JSON')
          return
        }
      }
      await onReplay(log.id, editPayload)
      handleOpenChange(false)
    } finally {
      setIsReplaying(false)
    }
  }

  const hasPayloadEdit = payloadEdit.trim() && payloadEdit !== initialPayloadStr
  const canReplay = confirmed && !payloadError && (!hasPayloadEdit || payloadEdit.trim())

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl" showClose={!isReplaying}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Replay Webhook
          </DialogTitle>
          <DialogDescription>
            Re-send the webhook with the original or edited payload. This will trigger the webhook
            endpoint again.
            {log?.webhook_url && (
              <span className="mt-1 block font-mono text-xs text-foreground truncate">
                {log.webhook_url}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {log && (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>
                  The webhook will receive the same or modified payload. Ensure your endpoint can
                  handle duplicate requests. You can edit the payload below before replaying.
                </p>
              </div>
            </div>

            <Tabs defaultValue="payload" className="w-full">
              <TabsList>
                <TabsTrigger value="payload">Payload</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
              </TabsList>
              <TabsContent value="payload" className="mt-3">
                <div className="space-y-2">
                  <Label htmlFor="payload-edit">Payload (JSON)</Label>
                  <Textarea
                    id="payload-edit"
                    value={payloadEdit || initialPayloadStr}
                    onChange={(e) => handlePayloadChange(e.target.value)}
                    className={cn(
                      'font-mono text-sm min-h-[200px]',
                      payloadError && 'border-destructive'
                    )}
                    placeholder="{}"
                  />
                  {payloadError && (
                    <p className="text-sm text-destructive">{payloadError}</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="headers" className="mt-3">
                <div className="rounded-lg border border-border p-4">
                  {log.headers && Object.keys(log.headers).length > 0 ? (
                    <pre className="text-sm font-mono overflow-auto max-h-48">
                      {JSON.stringify(log.headers, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">No custom headers</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

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
        )}

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
            disabled={!canReplay || isReplaying}
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
