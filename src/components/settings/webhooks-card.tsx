import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Webhook as WebhookIcon, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useWebhooks } from '@/hooks/use-settings'
import * as settingsApi from '@/api/settings'
import { toast } from 'sonner'

const webhookSchema = z.object({
  endpoint: z.string().url('Enter a valid URL'),
})

type WebhookForm = z.infer<typeof webhookSchema>

export function WebhooksCard() {
  const { data: webhooks, isLoading, error, refetch } = useWebhooks()
  const [open, setOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)

  const form = useForm<WebhookForm>({
    resolver: zodResolver(webhookSchema),
    defaultValues: { endpoint: '' },
  })

  const handleCreate = form.handleSubmit(async (values) => {
    setCreateLoading(true)
    try {
      await settingsApi.createWebhook(values.endpoint)
      toast.success('Webhook added successfully')
      form.reset({ endpoint: '' })
      setOpen(false)
      refetch()
    } catch {
      toast.error('Failed to add webhook')
    } finally {
      setCreateLoading(false)
    }
  })

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || webhooks === null) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-destructive text-center">{error ?? 'Failed to load webhooks'}</p>
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
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>Configure webhook endpoints for event notifications</CardDescription>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add webhook
          </Button>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <WebhookIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">No webhooks configured</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a webhook URL to receive events when sessions complete.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>
                Add your first webhook
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {webhooks.map((wh) => (
                <li
                  key={wh.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <WebhookIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <p className="text-sm font-mono truncate">{wh.endpoint}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label="Remove webhook"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            Webhooks can also be configured per agent in the Agent Builder.
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add webhook</DialogTitle>
            <DialogDescription>
              Enter the URL where you want to receive webhook events.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-endpoint">Endpoint URL</Label>
              <Input
                id="webhook-endpoint"
                type="url"
                placeholder="https://example.com/webhook"
                {...form.register('endpoint')}
              />
              {form.formState.errors.endpoint && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endpoint.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? 'Adding…' : 'Add webhook'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
