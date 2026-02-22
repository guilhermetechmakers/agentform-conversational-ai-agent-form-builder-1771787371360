import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDataPrivacy } from '@/hooks/use-settings'
import * as settingsApi from '@/api/settings'
import { toast } from 'sonner'

const retentionSchema = z.object({
  retention_policy_days: z.coerce.number().min(7).max(365),
})

type RetentionForm = z.infer<typeof retentionSchema>

const RETENTION_OPTIONS = [7, 14, 30, 60, 90, 180, 365]

export function DataPrivacyCard() {
  const { data, isLoading, error, refetch } = useDataPrivacy()
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const form = useForm<RetentionForm>({
    resolver: zodResolver(retentionSchema),
    defaultValues: { retention_policy_days: 90 },
  })

  useEffect(() => {
    if (data) {
      form.reset({ retention_policy_days: data.retention_policy_days })
    }
  }, [data, form])

  const handleRetentionSubmit = form.handleSubmit(async (values) => {
    try {
      await settingsApi.updateDataPrivacy(values)
      toast.success('Retention policy updated')
      refetch()
    } catch {
      toast.error('Failed to update retention policy')
    }
  })

  const handleExport = async () => {
    setExportLoading(true)
    try {
      await settingsApi.requestDataExport()
      toast.success('Data export requested. You will receive an email when ready.')
      refetch()
    } catch {
      toast.error('Failed to request data export')
    } finally {
      setExportLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    setDeleteLoading(true)
    try {
      await settingsApi.requestDataDeletion()
      toast.success('Data deletion requested. You will receive a confirmation email.')
      refetch()
    } catch {
      toast.error('Failed to request data deletion')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-destructive text-center">
            {error ?? 'Failed to load data privacy settings'}
          </p>
          <Button variant="outline" className="mt-4 mx-auto block" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Data & Privacy</CardTitle>
        <CardDescription>
          Session retention, data export, and deletion requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleRetentionSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention">Session retention (days)</Label>
            <Select
              value={String(form.watch('retention_policy_days'))}
              onValueChange={(v) => form.setValue('retention_policy_days', Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_OPTIONS.map((days) => (
                  <SelectItem key={days} value={String(days)}>
                    {days} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Sessions older than this will be automatically deleted.
            </p>
          </div>
          <Button type="submit" variant="outline" size="sm">
            Save retention policy
          </Button>
        </form>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <Download className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">Export your data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Request a copy of all your data. We'll email you when it's ready.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? 'Requesting…' : 'Request export'}
            </Button>
          </div>
          <div className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <Trash2 className="h-8 w-8 text-destructive mb-2" />
            <p className="font-medium">Delete your data</p>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete all your data. This cannot be undone.
            </p>
            <Button
              variant="outline"
              className="mt-4 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Requesting…' : 'Request deletion'}
            </Button>
          </div>
        </div>

        {(data.export_requests?.length ?? 0) > 0 && (
          <div>
            <h4 className="font-medium mb-2">Export requests</h4>
            <ul className="space-y-2">
              {data.export_requests!.map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
                >
                  <span>{req.status}</span>
                  <span className="text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
