import { Copy, ExternalLink, Key, Link2, Webhook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export interface PublishSettingsState {
  url_token?: string
  expiry?: string
  password?: string
  webhook_url?: string
  webhook_headers?: Record<string, string>
  webhook_secret?: string
}

interface PublishSettingsProps {
  settings: PublishSettingsState
  onChange: (updates: Partial<PublishSettingsState>) => void
  agentId?: string
  isNew?: boolean
}

export function PublishSettings({
  settings,
  onChange,
  agentId,
  isNew = false,
}: PublishSettingsProps) {
  const publicUrl = settings.url_token
    ? `${window.location.origin}/a/${settings.url_token}`
    : isNew
      ? ''
      : agentId
        ? `${window.location.origin}/a/${agentId}`
        : ''

  const handleCopyLink = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl).then(
      () => toast.success('Link copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Publish settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure public URL, link expiry, and webhooks
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Public URL</Label>
          <div className="flex gap-2">
            <Input
              value={publicUrl}
              readOnly
              className="font-mono text-sm bg-muted/50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              disabled={!publicUrl}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {publicUrl && (
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="link-expiry">Link expiry (optional)</Label>
          <Input
            id="link-expiry"
            type="datetime-local"
            value={settings.expiry ?? ''}
            onChange={(e) => onChange({ expiry: e.target.value || undefined })}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for no expiry
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Password protection (optional)
          </Label>
          <Input
            id="password"
            type="password"
            value={settings.password ?? ''}
            onChange={(e) => onChange({ password: e.target.value || undefined })}
            placeholder="Leave empty for public access"
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <Label htmlFor="webhook-url" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook URL
          </Label>
          <Input
            id="webhook-url"
            type="url"
            value={settings.webhook_url ?? ''}
            onChange={(e) =>
              onChange({ webhook_url: e.target.value || undefined })
            }
            placeholder="https://your-server.com/webhook"
          />
          <p className="text-xs text-muted-foreground">
            Receive form submissions at this endpoint
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-secret">Webhook signing secret</Label>
          <Input
            id="webhook-secret"
            type="password"
            value={settings.webhook_secret ?? ''}
            onChange={(e) =>
              onChange({ webhook_secret: e.target.value || undefined })
            }
            placeholder="Optional: verify webhook signatures"
          />
        </div>
      </CardContent>
    </Card>
  )
}
