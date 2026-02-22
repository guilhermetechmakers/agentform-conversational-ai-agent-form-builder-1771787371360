import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Webhook as WebhookIcon, Plus, Trash2, Pencil, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { WebhookForm } from './webhook-form'
import { useAgentWebhooks } from '@/hooks/use-webhooks'
import * as webhooksApi from '@/api/webhooks'
import { toast } from 'sonner'
import type { WebhookConfig, WebhookEventType } from '@/types/webhooks'
import type { WebhookFormValues } from './webhook-form'

export interface AgentWebhooksPanelProps {
  agentId: string
  agentName: string
}

export function AgentWebhooksPanel({ agentId, agentName }: AgentWebhooksPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null)

  const { data: webhooks, isLoading, refetch } = useAgentWebhooks(agentId)
  const webhooksList = webhooks ?? []

  const handleAddWebhook = () => {
    setEditingWebhook(null)
    setShowForm(true)
  }

  const handleEditWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingWebhook(null)
  }

  const handleSubmit = async (values: WebhookFormValues) => {
    const headersObj =
      values.headers.length > 0
        ? values.headers.reduce(
            (acc, { key, value }) => {
              if (key.trim()) acc[key.trim()] = value
              return acc
            },
            {} as Record<string, string>
          )
        : undefined

    try {
      if (editingWebhook) {
        await webhooksApi.updateWebhook(editingWebhook.id, {
          agent_id: agentId,
          url: values.url,
          headers: headersObj,
          secret_key: values.secretKey,
          event_types: values.eventTypes as WebhookEventType[],
        })
        toast.success('Webhook updated')
      } else {
        await webhooksApi.createWebhook({
          agent_id: agentId,
          url: values.url,
          headers: headersObj,
          secret_key: values.secretKey,
          event_types: values.eventTypes as WebhookEventType[],
        })
        toast.success('Webhook added successfully')
      }
      setShowForm(false)
      setEditingWebhook(null)
      refetch()
    } catch {
      toast.error('Failed to save webhook')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await webhooksApi.deleteWebhook(id)
      toast.success('Webhook removed')
      refetch()
    } catch {
      toast.error('Failed to remove webhook')
    }
  }

  if (showForm) {
    return (
      <WebhookForm
        agentId={agentId}
        agentName={agentName}
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
        onCancel={handleCancelForm}
      />
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover border-border animate-fade-in">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <WebhookIcon className="h-5 w-5" />
            Webhooks & integrations
          </CardTitle>
          <CardDescription>
            Configure webhooks to send session data to external systems
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link
            to="/dashboard/settings/api-webhooks"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            All webhooks
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : webhooksList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <WebhookIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">No webhooks configured</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a webhook to receive events when sessions complete for this agent.
            </p>
            <Button
              variant="outline"
              className="mt-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleAddWebhook}
            >
              <Plus className="h-4 w-4" />
              Add webhook
            </Button>
          </div>
        ) : (
          <ul className="space-y-4">
            {webhooksList.map((wh) => (
              <li
                key={wh.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-all duration-200 hover:shadow-card hover:bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <WebhookIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-mono truncate">{wh.url}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {wh.event_types.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditWebhook(wh)}
                    aria-label="Edit webhook"
                    className="transition-transform hover:scale-[1.02]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(wh.id)}
                    aria-label="Remove webhook"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
            <li>
              <Button
                variant="outline"
                className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleAddWebhook}
              >
                <Plus className="h-4 w-4" />
                Add another webhook
              </Button>
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
