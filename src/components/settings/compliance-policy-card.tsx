import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Database, HelpCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  fetchComplianceSettings,
  updateComplianceSettings,
} from '@/api/compliance'
import type {
  ComplianceSettings,
  DataResidencyRegion,
  RetentionPeriod,
} from '@/types/compliance'
import { toast } from 'sonner'

const schema = z.object({
  retention_period: z.enum(['7', '30', '90', '180', '365']),
  data_residency: z.enum(['default', 'us-east', 'eu-west', 'ap-southeast']),
})

type FormValues = z.infer<typeof schema>

const RETENTION_OPTIONS: { value: RetentionPeriod; label: string }[] = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
  { value: '365', label: '365 days' },
]

const DATA_RESIDENCY_OPTIONS: { value: DataResidencyRegion; label: string }[] = [
  { value: 'default', label: 'Default (Auto)' },
  { value: 'us-east', label: 'US East' },
  { value: 'eu-west', label: 'EU West' },
  { value: 'ap-southeast', label: 'Asia Pacific' },
]

export function CompliancePolicyCard() {
  const [settings, setSettings] = useState<ComplianceSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      retention_period: '90',
      data_residency: 'default',
    },
  })

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchComplianceSettings()
      setSettings(res)
      form.reset({
        retention_period: res.retention_period,
        data_residency: res.data_residency,
      })
    } catch {
      setSettings({
        data_residency: 'default',
        retention_period: '90',
        pii_redaction: false,
      })
      form.reset({
        retention_period: '90',
        data_residency: 'default',
      })
    } finally {
      setIsLoading(false)
    }
  }, [form])

  useEffect(() => {
    load()
  }, [load])

  const hasChanges =
    form.watch('retention_period') !== (settings?.retention_period ?? '90') ||
    form.watch('data_residency') !== (settings?.data_residency ?? 'default')

  const handleSaveClick = form.handleSubmit(() => {
    setConfirmOpen(true)
  })

  const handleConfirmSave = useCallback(async () => {
    const values = form.getValues()
    setIsSaving(true)
    try {
      await updateComplianceSettings({
        retention_period: values.retention_period,
        data_residency: values.data_residency,
      })
      setSettings((prev) =>
        prev ? { ...prev, ...values } : null
      )
      setConfirmOpen(false)
      toast.success('Compliance policy updated')
      load()
    } catch {
      toast.error('Failed to update compliance policy')
    } finally {
      setIsSaving(false)
    }
  }, [form, load])

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Compliance Policy
          </CardTitle>
          <CardDescription>
            Retention policies and data residency options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSaveClick} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="retention">Retention policy</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Data older than this period will be automatically deleted.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={form.watch('retention_period')}
                onValueChange={(v) =>
                  form.setValue('retention_period', v as RetentionPeriod)
                }
              >
                <SelectTrigger id="retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  {RETENTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Sessions and data older than this will be automatically deleted.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="data-residency">Data residency</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Ensures data is stored in the selected region for compliance.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={form.watch('data_residency')}
                onValueChange={(v) =>
                  form.setValue('data_residency', v as DataResidencyRegion)
                }
              >
                <SelectTrigger id="data-residency">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_RESIDENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={!hasChanges}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Confirm compliance changes</DialogTitle>
            <DialogDescription>
              You are about to update retention and data residency settings.
              Changes may take effect over the next 24 hours. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
