import { Webhook } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface PublishSettingsState {
  url_token?: string
  expiry?: string
  password?: string
  webhook_url?: string
  webhook_headers?: Record<string, string>
  webhook_secret?: string
  /** Public link feature */
  public_link_enabled?: boolean
  link_id?: string | null
  analytics_enabled?: boolean
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
}: PublishSettingsProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhooks
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Receive form submissions at your endpoint
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
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
