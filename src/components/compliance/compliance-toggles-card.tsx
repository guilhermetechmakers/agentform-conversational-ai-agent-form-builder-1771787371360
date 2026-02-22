import { useState, useCallback } from 'react'
import { Shield, Clock, HelpCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
import type {
  ComplianceSettings,
  DataResidencyRegion,
  RetentionPeriod,
} from '@/types/compliance'

const DATA_RESIDENCY_OPTIONS: { value: DataResidencyRegion; label: string }[] = [
  { value: 'default', label: 'Default (Auto)' },
  { value: 'us-east', label: 'US East' },
  { value: 'eu-west', label: 'EU West' },
  { value: 'ap-southeast', label: 'Asia Pacific' },
]

const RETENTION_OPTIONS: { value: RetentionPeriod; label: string }[] = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
  { value: '365', label: '365 days' },
]

interface ComplianceTogglesCardProps {
  settings: ComplianceSettings | null
  isLoading?: boolean
  onSave: (settings: Partial<ComplianceSettings>) => Promise<void>
}

export function ComplianceTogglesCard({
  settings,
  isLoading,
  onSave,
}: ComplianceTogglesCardProps) {
  const [dataResidency, setDataResidency] = useState<DataResidencyRegion>(
    settings?.data_residency ?? 'default'
  )
  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>(
    settings?.retention_period ?? '90'
  )
  const [piiRedaction, setPiiRedaction] = useState(settings?.pii_redaction ?? false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingSettings, setPendingSettings] = useState<Partial<ComplianceSettings> | null>(null)

  const hasChanges =
    dataResidency !== (settings?.data_residency ?? 'default') ||
    retentionPeriod !== (settings?.retention_period ?? '90') ||
    piiRedaction !== (settings?.pii_redaction ?? false)

  const handleSaveClick = useCallback(() => {
    const updates: Partial<ComplianceSettings> = {
      data_residency: dataResidency,
      retention_period: retentionPeriod,
      pii_redaction: piiRedaction,
    }
    setPendingSettings(updates)
    setConfirmOpen(true)
  }, [dataResidency, retentionPeriod, piiRedaction])

  const handleConfirmSave = useCallback(async () => {
    if (!pendingSettings) return
    setIsSaving(true)
    try {
      await onSave(pendingSettings)
      setConfirmOpen(false)
      setPendingSettings(null)
    } finally {
      setIsSaving(false)
    }
  }, [pendingSettings, onSave])

  const handleCancelConfirm = useCallback(() => {
    setConfirmOpen(false)
    setPendingSettings(null)
  }, [])

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Settings
          </CardTitle>
          <CardDescription>
            Data residency and retention policy controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="data-residency">Data residency</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Ensures data is stored in the selected region for compliance with
                  local regulations (e.g., GDPR, CCPA).
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={dataResidency}
              onValueChange={(v) => setDataResidency(v as DataResidencyRegion)}
            >
              <SelectTrigger id="data-residency">
                <SelectValue />
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
              value={retentionPeriod}
              onValueChange={(v) => setRetentionPeriod(v as RetentionPeriod)}
            >
              <SelectTrigger id="retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="pii">PII redaction</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Automatically redact personally identifiable information in
                      logs and exports.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  Redact PII in logs and exports
                </p>
              </div>
            </div>
            <Switch
              id="pii"
              checked={piiRedaction}
              onCheckedChange={setPiiRedaction}
            />
          </div>

          <Button
            onClick={handleSaveClick}
            disabled={!hasChanges}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && handleCancelConfirm()}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Confirm compliance changes</DialogTitle>
            <DialogDescription>
              You are about to update compliance settings. Data residency and
              retention changes may take effect over the next 24 hours. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConfirm}>
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
