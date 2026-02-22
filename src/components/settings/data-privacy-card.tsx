import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, Trash2, Globe, Clock } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDataPrivacy } from '@/hooks/use-settings'
import * as settingsApi from '@/api/settings'
import { toast } from 'sonner'

const DATA_RESIDENCY_OPTIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'EU (Ireland)' },
  { value: 'eu-central-1', label: 'EU (Frankfurt)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
]

const retentionSchema = z.object({
  retention_policy_days: z.coerce.number().min(7).max(365),
})

type RetentionForm = z.infer<typeof retentionSchema>

const RETENTION_OPTIONS = [7, 14, 30, 60, 90, 180, 365]

export function DataPrivacyCard() {
  const { data, isLoading, error, refetch } = useDataPrivacy()
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingRetention, setPendingRetention] = useState<number | null>(null)
  const [pendingResidency, setPendingResidency] = useState<string | null>(null)
  const [localResidency, setLocalResidency] = useState<string>('us-east-1')
  const [saveLoading, setSaveLoading] = useState(false)

  const form = useForm<RetentionForm>({
    resolver: zodResolver(retentionSchema),
    defaultValues: { retention_policy_days: 90 },
  })

  useEffect(() => {
    if (data) {
      form.reset({ retention_policy_days: data.retention_policy_days })
      setLocalResidency(data.data_residency ?? 'us-east-1')
    }
  }, [data, form])

  const handleRetentionSubmit = form.handleSubmit((values) => {
    setPendingRetention(values.retention_policy_days)
    setPendingResidency(null)
    setConfirmOpen(true)
  })

  const handleResidencySave = (value: string) => {
    if (value === (data?.data_residency ?? 'us-east-1')) return
    setPendingResidency(value)
    setPendingRetention(null)
    setConfirmOpen(true)
  }

  const handleConfirmSave = async () => {
    setSaveLoading(true)
    try {
      const updates: { retention_policy_days?: number; data_residency?: string } = {}
      if (pendingRetention != null) updates.retention_policy_days = pendingRetention
      if (pendingResidency != null) updates.data_residency = pendingResidency
      if (Object.keys(updates).length > 0) {
        await settingsApi.updateDataPrivacy(updates)
        toast.success('Compliance settings updated')
        refetch()
      }
      setConfirmOpen(false)
      setPendingRetention(null)
      setPendingResidency(null)
    } catch {
      toast.error('Failed to update settings')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancelConfirm = () => {
    setConfirmOpen(false)
    setPendingRetention(null)
    setPendingResidency(null)
  }

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
        {/* Compliance Policy Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Compliance Policy</h4>
          <form onSubmit={handleRetentionSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="retention">Retention policy</Label>
                  <p className="text-sm text-muted-foreground">
                    Sessions older than this will be automatically deleted.
                  </p>
                </div>
              </div>
              <Select
                value={String(form.watch('retention_policy_days'))}
                onValueChange={(v) => form.setValue('retention_policy_days', Number(v))}
              >
                <SelectTrigger id="retention" className="w-full sm:w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {RETENTION_OPTIONS.map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="data-residency">Data residency</Label>
                  <p className="text-sm text-muted-foreground">
                    Ensure data is stored in the selected region for compliance.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={localResidency}
                  onValueChange={setLocalResidency}
                >
                  <SelectTrigger id="data-residency" className="w-full sm:w-48">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_RESIDENCY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleResidencySave(localResidency)}
                  disabled={localResidency === (data?.data_residency ?? 'us-east-1')}
                >
                  Save
                </Button>
              </div>
            </div>
            <Button type="submit" variant="outline" size="sm">
              Save retention policy
            </Button>
          </form>
        </div>

        <Dialog open={confirmOpen} onOpenChange={(open) => !open && handleCancelConfirm()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm compliance changes</DialogTitle>
              <DialogDescription>
                You are about to change compliance settings. This may affect data storage and retention. Continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelConfirm} disabled={saveLoading}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSave} disabled={saveLoading}>
                {saveLoading ? 'Saving…' : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
