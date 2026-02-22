import { useState, useCallback } from 'react'
import { Webhook as WebhookIcon, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { WebhookForm, type WebhookFormValues } from '@/components/webhooks'
import { useWebhookConfigs } from '@/hooks/use-webhooks'
import { useAgents } from '@/hooks/use-agents'
import * as webhooksApi from '@/api/webhooks'
import { toast } from 'sonner'
import type { WebhookConfig } from '@/types/webhooks'

export function WebhooksCard() {
  const { data: webhooks, isLoading, error, refetch } = useWebhookConfigs()
  const { data: agentsData } = useAgents({ page_size: 100 })
  const agents = agentsData?.agents ?? []
  const agentOptions = agents.map((a) => ({ id: a.id, name: a.name }))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const handleSubmit = useCallback(
    async (values: WebhookFormValues) => {
      const agentId = editingWebhook?.agent_id ?? selectedAgentId
      if (!agentId) {
        toast.error('Please select an agent')
        return
      }
      setCreateLoading(true)
      try {
        const headers: Record<string, string> = {}
        ;(values.headers ?? []).forEach((h) => {
          if (h.key?.trim()) headers[h.key.trim()] = h.value ?? ''
        })
        const payload = {
          agent_id: agentId,
          url: values.url,
          headers: Object.keys(headers).length ? headers : undefined,
          secret_key: values.secretEnabled ? values.secretKey : undefined,
          event_types: values.eventTypes as WebhookConfig['event_types'],
        }
        if (editingWebhook) {
          await webhooksApi.updateWebhook(editingWebhook.id, payload)
          toast.success('Webhook updated successfully')
        } else {
          await webhooksApi.createWebhook(payload)
          toast.success('Webhook added successfully')
        }
        setDialogOpen(false)
        setEditingWebhook(null)
        refetch()
      } catch {
        toast.error(editingWebhook ? 'Failed to update webhook' : 'Failed to add webhook')
      } finally {
        setCreateLoading(false)
      }
    },
    [refetch, editingWebhook, selectedAgentId]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await webhooksApi.deleteWebhook(id)
        toast.success('Webhook removed')
        refetch()
      } catch {
        toast.error('Failed to remove webhook')
      }
    },
    [refetch]
  )

  const openAdd = useCallback(() => {
    setEditingWebhook(null)
    setSelectedAgentId(agentOptions[0]?.id ?? '')
    setDialogOpen(true)
  }, [agentOptions])

  const openEdit = useCallback((wh: WebhookConfig) => {
    setEditingWebhook(wh)
    setSelectedAgentId(wh.agent_id)
    setDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingWebhook(null)
  }, [])

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
            <CardDescription>
              Configure per-agent webhook endpoints for session events
            </CardDescription>
          </div>
          <Button
            onClick={openAdd}
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
              <Button variant="outline" className="mt-4" onClick={openAdd}>
                Add your first webhook
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {webhooks.map((wh) => {
                const agent = agents.find((a) => a.id === wh.agent_id)
                return (
                  <li
                    key={wh.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <WebhookIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-mono truncate">{wh.url}</p>
                        {agent && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Agent: {agent.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(wh)}
                        className="transition-transform hover:scale-[1.02]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(wh.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label="Remove webhook"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            Webhooks can also be configured per agent in the Agent Builder.
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingWebhook ? 'Edit webhook' : 'Add webhook'}</DialogTitle>
            <DialogDescription>
              Configure the endpoint URL, headers, signing, and event types for webhook delivery.
            </DialogDescription>
          </DialogHeader>
          {agentOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Agent</Label>
              <Select
                value={editingWebhook ? editingWebhook.agent_id : selectedAgentId}
                onValueChange={(v) => setSelectedAgentId(v)}
                disabled={!!editingWebhook}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agentOptions.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <WebhookForm
            agentId={editingWebhook?.agent_id ?? selectedAgentId}
            agentName={
              editingWebhook
                ? agents.find((a) => a.id === editingWebhook.agent_id)?.name
                : agents.find((a) => a.id === selectedAgentId)?.name
            }
            initialValues={
              editingWebhook
                ? {
                    url: editingWebhook.url,
                    headers: editingWebhook.headers
                      ? Object.entries(editingWebhook.headers).map(([key, value]) => ({
                          key,
                          value,
                        }))
                      : [],
                    secretEnabled: !!editingWebhook.secret_key,
                    secretKey: editingWebhook.secret_key ?? '',
                    eventTypes: editingWebhook.event_types,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            isLoading={createLoading}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
