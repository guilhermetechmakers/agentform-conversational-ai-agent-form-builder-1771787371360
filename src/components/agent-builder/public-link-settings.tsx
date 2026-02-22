import { useState, useCallback, useEffect } from 'react'
import {
  Copy,
  ExternalLink,
  Key,
  Link2,
  RefreshCw,
  BarChart3,
  Loader2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import * as publicLinksApi from '@/api/public-links'
import { AnalyticsCard } from '@/components/public-links'
import type { PublishSettingsState } from './publish-settings'

const EXPIRY_PRESETS = [
  { value: '', label: 'No expiry' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
] as const

export interface PublicLinkSettingsState {
  enabled: boolean
  linkUrl: string | null
  linkId: string | null
  analyticsEnabled: boolean
}

interface PublicLinkSettingsProps {
  settings: PublishSettingsState
  publicLinkState: PublicLinkSettingsState
  onChange: (updates: Partial<PublishSettingsState>) => void
  onPublicLinkChange: (updates: Partial<PublicLinkSettingsState>) => void
  agentId?: string
  isNew?: boolean
}

function getExpiryFromPreset(preset: string): string | undefined {
  if (!preset) return undefined
  const now = new Date()
  if (preset === '24h') {
    now.setHours(now.getHours() + 24)
  } else if (preset === '7d') {
    now.setDate(now.getDate() + 7)
  } else if (preset === '30d') {
    now.setDate(now.getDate() + 30)
  } else {
    return undefined
  }
  return now.toISOString().slice(0, 16)
}

export function PublicLinkSettings({
  settings,
  publicLinkState,
  onChange,
  onPublicLinkChange,
  agentId,
  isNew = false,
}: PublicLinkSettingsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)
  const [analytics, setAnalytics] = useState<import('@/types/public-links').LinkAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const publicUrl =
    publicLinkState.linkUrl ??
    (settings.url_token
      ? `${window.location.origin}/a/${settings.url_token}`
      : isNew
        ? ''
        : agentId
          ? `${window.location.origin}/a/${agentId}`
          : '')

  const handleCopyLink = useCallback(() => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl).then(
      () => {
        toast.success('Link copied to clipboard')
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      },
      () => toast.error('Failed to copy')
    )
  }, [publicUrl])

  const handleGenerateLink = useCallback(async () => {
    if (!agentId || isNew) {
      toast.error('Save the agent first to generate a public link')
      return
    }
    setIsGenerating(true)
    try {
      const expiry = settings.expiry
        ? new Date(settings.expiry).toISOString()
        : undefined
      const res = await publicLinksApi.createPublicLink(agentId, {
        expiry: expiry ?? undefined,
        password: settings.password || undefined,
        analytics_enabled: publicLinkState.analyticsEnabled,
      })
      onPublicLinkChange({
        linkUrl: res.full_url,
        linkId: res.link_id,
      })
      onChange({
        url_token: res.url.includes('/') ? res.url.replace(/.*\/([^/]+)$/, '$1') : res.url,
      })
      toast.success('Public link generated')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate link'
      toast.error(msg)
      onPublicLinkChange({
        linkUrl: `${window.location.origin}/a/${agentId}`,
        linkId: null,
      })
      onChange({ url_token: agentId })
    } finally {
      setIsGenerating(false)
    }
  }, [
    agentId,
    isNew,
    settings.expiry,
    settings.password,
    publicLinkState.analyticsEnabled,
    onChange,
    onPublicLinkChange,
  ])

  const handleRegenerateLink = useCallback(async () => {
    if (!agentId || isNew) return
    setIsRegenerating(true)
    setRegenerateDialogOpen(false)
    try {
      const expiry = settings.expiry
        ? new Date(settings.expiry).toISOString()
        : undefined
      const res = await publicLinksApi.createPublicLink(agentId, {
        expiry: expiry ?? undefined,
        password: settings.password || undefined,
        analytics_enabled: publicLinkState.analyticsEnabled,
      })
      onPublicLinkChange({
        linkUrl: res.full_url,
        linkId: res.link_id,
      })
      onChange({
        url_token: res.url.includes('/') ? res.url.replace(/.*\/([^/]+)$/, '$1') : res.url,
      })
      toast.success('Link regenerated')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to regenerate link'
      toast.error(msg)
    } finally {
      setIsRegenerating(false)
    }
  }, [
    agentId,
    isNew,
    settings.expiry,
    settings.password,
    publicLinkState.analyticsEnabled,
    onChange,
    onPublicLinkChange,
  ])

  const handleExpiryPresetChange = (preset: string) => {
    const expiry = getExpiryFromPreset(preset)
    onChange({ expiry: expiry ?? undefined })
  }

  const loadAnalytics = useCallback(async () => {
    if (!publicLinkState.linkId) return
    setAnalyticsLoading(true)
    try {
      const data = await publicLinksApi.getLinkAnalytics(publicLinkState.linkId)
      setAnalytics(data)
    } catch {
      setAnalytics(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [publicLinkState.linkId])

  useEffect(() => {
    if (publicLinkState.linkId && publicLinkState.analyticsEnabled) {
      loadAnalytics()
    }
  }, [publicLinkState.linkId, publicLinkState.analyticsEnabled, loadAnalytics])

  const currentPreset = EXPIRY_PRESETS.find((p) => {
    if (!p.value || !settings.expiry) return p.value === ''
    const exp = new Date(settings.expiry)
    const now = new Date()
    const diffHours = (exp.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (p.value === '24h' && diffHours <= 25 && diffHours >= 23) return true
    if (p.value === '7d' && diffHours <= 168 * 1.1 && diffHours >= 168 * 0.9)
      return true
    if (p.value === '30d' && diffHours <= 720 * 1.1 && diffHours >= 720 * 0.9)
      return true
    return false
  })?.value ?? ''

  return (
    <TooltipProvider>
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Public link
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="public-link-toggle"
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                Enable
              </Label>
              <Switch
                id="public-link-toggle"
                checked={publicLinkState.enabled}
                onCheckedChange={(checked) =>
                  onPublicLinkChange({ enabled: checked })
                }
                className="transition-transform duration-200"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate a shareable public URL with optional expiry and password
            protection
          </p>
        </CardHeader>
        {publicLinkState.enabled && (
          <CardContent className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Label>Link expiry</Label>
              <div className="flex gap-2">
                <select
                  value={currentPreset}
                  onChange={(e) =>
                    handleExpiryPresetChange(e.target.value)
                  }
                  className="flex h-10 w-full max-w-[140px] rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {EXPIRY_PRESETS.map((p) => (
                    <option key={p.value || 'none'} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <Input
                  type="datetime-local"
                  value={settings.expiry ?? ''}
                  onChange={(e) =>
                    onChange({ expiry: e.target.value || undefined })
                  }
                  className="font-mono text-sm flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty for no expiry
              </p>
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
                placeholder="Leave empty for public access"
                className="transition-colors duration-200 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                Min 8 characters, include letters and numbers
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">
                    Track analytics
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Views, unique visitors, referrers
                  </p>
                </div>
              </div>
              <Switch
                checked={publicLinkState.analyticsEnabled}
                onCheckedChange={(checked) =>
                  onPublicLinkChange({ analyticsEnabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Generated link</Label>
              <div className="flex gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="font-mono text-sm bg-muted/50"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      disabled={!publicUrl}
                      className="shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {copySuccess ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copySuccess ? 'Copied!' : 'Copy link'}
                  </TooltipContent>
                </Tooltip>
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
                {publicUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRegenerateDialogOpen(true)}
                        disabled={isRegenerating}
                        className="shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isRegenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Regenerate link</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {!publicLinkState.linkUrl && (
              <Button
                onClick={handleGenerateLink}
                disabled={isGenerating || !agentId || isNew}
                className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Generate public link
                  </>
                )}
              </Button>
            )}

            {publicLinkState.linkId && publicLinkState.analyticsEnabled && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Analytics</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadAnalytics}
                    disabled={analyticsLoading}
                    className="transition-transform hover:scale-[1.02]"
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
          </CardContent>
        )}
      </Card>

      <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Regenerate link?</DialogTitle>
            <DialogDescription>
              The current link will stop working. A new link will be generated.
              Anyone with the old link will need the new one.
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
              onClick={handleRegenerateLink}
              disabled={isRegenerating}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
