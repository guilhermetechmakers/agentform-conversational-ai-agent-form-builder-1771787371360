import { useCallback, useRef } from 'react'
import { Bot, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export interface AgentMetaState {
  name: string
  description: string
  avatar_url?: string
  appearance?: { primary?: string; background?: string }
  status: 'draft' | 'published' | 'unpublished'
  url_token?: string
}

interface AgentMetaPanelProps {
  meta: AgentMetaState
  onChange: (updates: Partial<AgentMetaState>) => void
  isNew?: boolean
}

const PRESET_COLORS = [
  { name: 'Primary', key: 'primary' as const, default: '#FFE066' },
  { name: 'Background', key: 'background' as const, default: '#F7F8FA' },
]

export function AgentMetaPanel({
  meta,
  onChange,
  isNew = false,
}: AgentMetaPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        onChange({ avatar_url: reader.result as string })
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    },
    [onChange]
  )

  const handleCopyLink = useCallback(() => {
    const base = window.location.origin
    const url = `${base}/a/${meta.url_token ?? 'preview'}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copied to clipboard'),
      () => toast.error('Failed to copy')
    )
  }, [meta.url_token])

  const publicUrl = meta.url_token
    ? `${window.location.origin}/a/${meta.url_token}`
    : isNew
      ? ''
      : `${window.location.origin}/a/preview`

  const isPublished = meta.status === 'published'

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Agent meta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div
            className="flex flex-col items-center gap-3 cursor-pointer group"
            onClick={handleAvatarClick}
            onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
            role="button"
            tabIndex={0}
            aria-label="Upload avatar"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-border p-1 transition-all duration-200 group-hover:border-primary/50 group-hover:scale-[1.02]">
              <Avatar className="h-24 w-24">
                <AvatarImage src={meta.avatar_url} alt={meta.name} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {meta.name?.slice(0, 2).toUpperCase() ?? 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs text-muted-foreground">Click to upload</span>
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Name</Label>
              <Input
                id="agent-name"
                value={meta.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="e.g. Lead Capture"
                className="font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-description">Description</Label>
              <Input
                id="agent-description"
                value={meta.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Brief description of this agent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Appearance colors</Label>
          <div className="flex flex-wrap gap-4">
            {PRESET_COLORS.map(({ name, key, default: def }) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={meta.appearance?.[key] ?? def}
                  onChange={(e) =>
                    onChange({
                      appearance: {
                        ...meta.appearance,
                        [key]: e.target.value,
                      },
                    })
                  }
                  className="h-10 w-10 rounded-lg border border-border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  isPublished ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {isPublished ? 'Published' : 'Draft'}
              </span>
              <Switch
                checked={isPublished}
                onCheckedChange={(checked) =>
                  onChange({
                    status: checked ? 'published' : 'draft',
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Public link preview</Label>
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
              <Button
                variant="outline"
                size="sm"
                asChild
                className="shrink-0"
              >
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
      </CardContent>
    </Card>
  )
}
