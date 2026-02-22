import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { WebhookEventType } from '@/types/webhooks'

const WEBHOOK_EVENT_TYPES: { id: WebhookEventType; label: string }[] = [
  { id: 'session_completed', label: 'Session completed' },
  { id: 'session_started', label: 'Session started' },
  { id: 'session_updated', label: 'Session updated' },
  { id: 'field_extracted', label: 'Field extracted' },
]

const headersSchema = z.array(
  z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.string(),
  })
)

const webhookFormSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Enter a valid URL')
    .refine((v) => v.startsWith('https://'), 'URL must use HTTPS protocol'),
  headers: headersSchema.default([]),
  secretEnabled: z.boolean().default(false),
  secretKey: z.string().optional(),
  eventTypes: z.array(z.string()).min(1, 'Select at least one event type'),
}).refine(
  (data) => !data.secretEnabled || (data.secretKey && data.secretKey.length > 0),
  { message: 'Secret key is required when signing is enabled', path: ['secretKey'] }
)

export type WebhookFormValues = z.infer<typeof webhookFormSchema>

export interface WebhookFormProps {
  agentId: string
  agentName?: string
  initialValues?: Partial<WebhookFormValues> & { url?: string }
  onSubmit: (values: WebhookFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function WebhookForm({
  agentId: _agentId,
  agentName,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: WebhookFormProps) {
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      url: initialValues?.url ?? '',
      headers: initialValues?.headers ?? [],
      secretEnabled: initialValues?.secretEnabled ?? false,
      secretKey: initialValues?.secretKey ?? '',
      eventTypes: initialValues?.eventTypes ?? ['session_completed'],
    },
  })

  const headers = form.watch('headers')
  const secretEnabled = form.watch('secretEnabled')

  const addHeader = () => {
    form.setValue('headers', [...headers, { key: '', value: '' }])
  }

  const removeHeader = (index: number) => {
    form.setValue(
      'headers',
      headers.filter((_, i) => i !== index)
    )
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const next = [...headers]
    next[index] = { ...next[index], [field]: value }
    form.setValue('headers', next)
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      secretKey: values.secretEnabled ? values.secretKey : undefined,
      eventTypes: values.eventTypes as WebhookEventType[],
    })
  })

  const toggleEventType = (id: WebhookEventType) => {
    const current = form.getValues('eventTypes')
    const next = current.includes(id)
      ? current.filter((e) => e !== id)
      : [...current, id]
    form.setValue('eventTypes', next)
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover border-border">
      <CardHeader>
        <CardTitle className="text-lg">Webhook configuration</CardTitle>
        <CardDescription>
          {agentName
            ? `Configure webhook for ${agentName}`
            : 'Add a webhook endpoint to receive session events'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="required">
              Endpoint URL
            </Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-server.com/webhook"
              className={cn(
                form.formState.errors.url && 'border-destructive focus-visible:ring-destructive'
              )}
              {...form.register('url')}
            />
            {form.formState.errors.url && (
              <p className="text-sm text-destructive">
                {form.formState.errors.url.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              HTTPS only. Compatible with Zapier, Make, and custom endpoints.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Custom headers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHeader}
                className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Add header
              </Button>
            </div>
            {headers.map((_, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input
                  placeholder="Header name"
                  value={headers[index]?.key ?? ''}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={headers[index]?.value ?? ''}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHeader(index)}
                  className="text-destructive hover:text-destructive shrink-0"
                  aria-label="Remove header"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="secret-toggle">HMAC payload signing</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sign payloads so your endpoint can verify authenticity
                </p>
              </div>
              <Switch
                id="secret-toggle"
                checked={secretEnabled}
                onCheckedChange={(v) => form.setValue('secretEnabled', v)}
              />
            </div>
            {secretEnabled && (
              <div className="space-y-2 animate-in fade-in-0 duration-200">
                <Label htmlFor="secret-key">Secret key</Label>
                <Input
                  id="secret-key"
                  type="password"
                  placeholder="Enter your webhook secret"
                  {...form.register('secretKey')}
                  className={cn(
                    form.formState.errors.secretKey &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {form.formState.errors.secretKey && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.secretKey.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="required">Event types</Label>
            <p className="text-xs text-muted-foreground">
              Select which events trigger this webhook
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {WEBHOOK_EVENT_TYPES.map(({ id, label }) => (
                <div
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={`event-${id}`}
                    checked={form.watch('eventTypes').includes(id)}
                    onCheckedChange={() => toggleEventType(id)}
                  />
                  <Label
                    htmlFor={`event-${id}`}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.eventTypes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.eventTypes.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save webhook
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
