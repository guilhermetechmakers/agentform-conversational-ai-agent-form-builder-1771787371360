import { useState } from 'react'
import { Key, Plus, Copy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiKeys } from '@/hooks/use-settings'
import * as settingsApi from '@/api/settings'
import { toast } from 'sonner'

export function APIKeysCard() {
  const { data: keys, isLoading, error, refetch } = useApiKeys()
  const [open, setOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const handleCreate = async () => {
    setCreateLoading(true)
    try {
      const res = await settingsApi.createApiKey()
      setNewKey(res.key)
      toast.success('API key created. Copy it now—you won\'t see it again.')
      refetch()
    } catch {
      toast.error('Failed to create API key')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleClose = () => {
    setOpen(false)
    setNewKey(null)
  }

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || keys === null) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-destructive text-center">{error ?? 'Failed to load API keys'}</p>
          <Button variant="outline" className="mt-4 mx-auto block" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="animate-fade-in transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for programmatic access</CardDescription>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Generate key
          </Button>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">No API keys yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generate an API key to integrate AgentForm with your applications.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
                Generate your first key
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {keys.map((apiKey) => (
                <li
                  key={apiKey.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-mono text-sm">{apiKey.key_prefix}••••••••</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(apiKey.key_prefix + '••••••••')}
                    aria-label="Copy key prefix"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{newKey ? 'API key created' : 'Generate API key'}</DialogTitle>
            <DialogDescription>
              {newKey
                ? 'Copy your key now. For security, it won\'t be shown again.'
                : 'Create a new API key for programmatic access.'}
            </DialogDescription>
          </DialogHeader>
          {newKey ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                <code className="flex-1 break-all text-sm font-mono">{newKey}</code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(newKey)}
                  aria-label="Copy API key"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={handleClose}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createLoading}>
                {createLoading ? 'Creating…' : 'Generate key'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
