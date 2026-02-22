import { useState } from 'react'
import {
  Copy,
  ExternalLink,
  Key,
  Link2,
  RefreshCw,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import * as publicLinksApi from '@/api/public-links'
import { AnalyticsCard } from './analytics-card'
import type { LinkAnalytics } from '@/types/public-links'

export interface PublicLinkSettingsState {
  enabled: boolean
  url?: string
  short_token?: string
  link_id?: string
  expiry?: string
  password?: string
  analytics_enabled?: boolean
}

interface PublicLinkSettingsProps {
  agentId: string | undefined
  settings: PublicLinkSettingsState
  onChange: (updates: Partial<PublicLinkSettingsState>) => void
  isNew?: boolean
}

const EXPIRY_PRESETS = [
  { label: '24 hours', value: 24 },
  { label: '7 days', value: 168 },
  { label: '30 days', value: 720 },
  { label: 'No expiry', value: 0 },
]

function getExpiryDatetime(hoursFromNow: number): string {
  if (hoursFromNow <= 0) return ''
  const d = new Date()
  d.setHours(d.getHours() + hoursFromNow)
  return d.toISOString().slice(0, 16)
}

export function PublicLinkSettings({
  agentId,
  settings,
  onChange,
  isNew = false,
}: PublicLinkSettingsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = settings.url
    ? `${window.location.origin}/a/${settings.short_token ?? settings.url}`
    : isNew
      ? ''
      : agentId
        ? `${window.location.origin}/a/${agentId}`
        : ''

  const handleGenerateLink = async () => {
    if (!agentId || isNew) return
    setIsGenerating(true)
    try {
      const res = await publicLinksApi.createPublicLink(agentId, {
        expiry: settings.expiry || undefined,
        password: settings.password || undefined,
        analytics_enabled: settings.analytics_enabled ?? true,
      })
      const token =
        res.short_token ??
        (typeof res.url === 'string' && res.url ? res.url : undefined) ??
        (res.full_url
          ? new URL(res.full_url).pathname.split('/').pop()
          : undefined)
      onChange({
        enabled: true,
        url: res.full_url ?? (token ? `${window.location.origin}/a/${token}` : undefined),
        short_token: token ?? res.short_token,
        link_id: res.link_id,
        expiry: res.expiry ?? undefined,
      })
      toast.success('Public link generated')
    } catch (err) {
      const e = err as { message?: string }
      toast.error(e?.message ?? 'Failed to generate link')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    if (!agentId || isNew) return
    setIsGenerating(true)
    setRegenerateDialogOpen(false)
    try {
      const res = await publicLinksApi.createPublicLink(agentId, {
        expiry: settings.expiry || undefined,
        password: settings.password || undefined,
        analytics_enabled: settings.analytics_enabled ?? true,
      })
      const token =
        res.short_token ??
        (typeof res.url === 'string' && res.url ? res.url : undefined) ??
        (res.full_url
          ? new URL(res.full_url).pathname.split('/').pop()
          : undefined)
      onChange({
        url: res.full_url ?? (token ? `${window.location.origin}/a/${token}` : undefined),
        short_token: token ?? res.short_token,
        link_id: res.link_id,
        expiry: res.expiry ?? undefined,
      })
      toast.success('Link regenerated')
    } catch (err) {
      const e = err as { message?: string }
      toast.error(e?.message ?? 'Failed to regenerate link')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = () => {
    const url = publicUrl || `${window.location.origin}/a/${agentId}`
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success('Link copied to clipboard')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => toast.error('Failed to copy')
    )
  }

  const loadAnalytics = async () => {
    if (!settings.link_id) return
    setAnalyticsLoading(true)
    try {
      const data = await publicLinksApi.getLinkAnalytics(settings.link_id)
      setAnalytics(data)
    } catch {
      setAnalytics(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const showAnalytics = settings.link_id && settings.enabled

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Public link & access controls
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate shareable links with optional password protection and expiry
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <Label htmlFor="public-link-toggle" className="text-base font-medium">
              Enable public link
            </Label>
            <p className="text-sm text-muted-foreground">
              Allow anyone with the link to access this agent
            </p>
          </div>
          <Switch
            id="public-link-toggle"
            checked={settings.enabled}
            onCheckedChange={(checked) => onChange({ enabled: checked })}
            disabled={isNew}
          />
        </div>

        {settings.enabled && !isNew && (
          <>
            <div className="space-y-2">
              <Label>Link expiry (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_PRESETS.map((p) => (
                  <Button
                    key={p.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onChange({
                        expiry: getExpiryDatetime(p.value),
                      })
                    }
                    className={cn(
                      'transition-transform hover:scale-[1.02] active:scale-[0.98]',
                      settings.expiry === getExpiryDatetime(p.value) &&
                        'border-primary bg-primary/10'
                    )}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <Input
                type="datetime-local"
                value={settings.expiry ?? ''}
                onChange={(e) =>
                  onChange({ expiry: e.target.value || undefined })
                }
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-password" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Password protection (optional)
              </Label>
              <Input
                id="link-password"
                type="password"
                value={settings.password ?? ''}
                onChange={(e) =>
                  onChange({ password: e.target.value || undefined })
                }
                placeholder="Min 8 characters for security"
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label className="text-base font-medium">
                  Track analytics
                </Label>
                <p className="text-sm text-muted-foreground">
                  Capture views, referrers, and UTM parameters
                </p>
              </div>
              <Switch
                checked={settings.analytics_enabled ?? true}
                onCheckedChange={(checked) =>
                  onChange({ analytics_enabled: checked })
                }
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={handleGenerateLink}
                disabled={isGenerating || !agentId}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : settings.url ? (
                  'Regenerate link'
                ) : (
                  'Generate public link'
                )}
              </Button>
              {settings.url && (
                <Button
                  variant="outline"
                  onClick={() => setRegenerateDialogOpen(true)}
                  disabled={isGenerating}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              )}
            </div>

            {(publicUrl || agentId) && (
              <div className="space-y-2">
                <Label>Generated link</Label>
                <div className="flex gap-2">
                  <Input
                    value={publicUrl || `${window.location.origin}/a/${agentId}`}
                    readOnly
                    className="font-mono text-sm bg-muted/50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="shrink-0">
                    <a
                      href={publicUrl || `${window.location.origin}/a/${agentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {showAnalytics && (
              <div className="pt-4 border-t border-border">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-medium">Analytics</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadAnalytics}
                    disabled={analyticsLoading}
                  >
                    {analyticsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>
                <AnalyticsCard
                  analytics={analytics}
                  isLoading={analyticsLoading && !analytics}
                />
              </div>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Regenerate link?</DialogTitle>
            <DialogDescription>
              The current link will stop working. Anyone with the old link will
              need the new one. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={isGenerating}
            >
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
