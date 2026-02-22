import { useState } from 'react'
import { Shield, MapPin, Clock, HelpCircle } from 'lucide-react'
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
import { fetchComplianceSettings, updateComplianceSettings } from '@/api/admin'
import type { ComplianceSettings } from '@/types/admin'
import { toast } from 'sonner'
import { useEffect, useCallback } from 'react'

const RETENTION_OPTIONS = ['30', '60', '90', '180', '365']
const DATA_RESIDENCY_OPTIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']

export function ComplianceToggles() {
  const [settings, setSettings] = useState<ComplianceSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<Partial<ComplianceSettings>>({})

  const loadSettings = useCallback(() => {
    setIsLoading(true)
    fetchComplianceSettings()
      .then(setSettings)
      .catch(() => {
        toast.error('Failed to load compliance settings')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleChange = (key: keyof ComplianceSettings, value: boolean | string) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveClick = () => {
    if (Object.keys(pendingChanges).length > 0) setConfirmOpen(true)
  }

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      setConfirmOpen(false)
      return
    }
    setIsSaving(true)
    try {
      await updateComplianceSettings(pendingChanges)
      setSettings((prev) => (prev ? { ...prev, ...pendingChanges } : null))
      setPendingChanges({})
      setConfirmOpen(false)
      toast.success('Compliance settings updated')
      loadSettings()
    } catch {
      toast.error('Failed to update compliance settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelConfirm = () => {
    setPendingChanges({})
    setConfirmOpen(false)
  }

  if (isLoading) {
    return (
      <Card className="rounded-xl border-[#EDEDED] transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-destructive text-center">Failed to load compliance settings</p>
          <Button variant="outline" className="mt-4 mx-auto block" onClick={loadSettings}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const displaySettings = { ...settings, ...pendingChanges }

  return (
    <>
      <Card className="rounded-xl border-[#EDEDED] transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance settings
          </CardTitle>
          <CardDescription>
            Data residency and retention policy controls for compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="data-residency" className="font-medium">
                    Data residency
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Ensures data is stored in the selected region for compliance with local data
                        sovereignty requirements.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  Store data in selected region
                </p>
              </div>
            </div>
            <Select
              value={displaySettings.data_residency}
              onValueChange={(v) => handleChange('data_residency', v)}
            >
              <SelectTrigger id="data-residency" className="w-40">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {DATA_RESIDENCY_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
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
                  <Label htmlFor="retention" className="font-medium">
                    Retention policy
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Data older than the selected period will be automatically deleted to comply
                        with retention requirements.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  Auto-delete data after period
                </p>
              </div>
            </div>
            <Select
              value={displaySettings.retention_period}
              onValueChange={(v) => handleChange('retention_period', v)}
            >
              <SelectTrigger id="retention" className="w-32">
                <SelectValue placeholder="Days" />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="pii-redaction" className="font-medium">
                    PII redaction
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        When enabled, personally identifiable information is redacted from logs and
                        exports.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">
                  Redact PII in logs and exports
                </p>
              </div>
            </div>
            <Switch
              id="pii-redaction"
              checked={displaySettings.pii_redaction}
              onCheckedChange={(v) => handleChange('pii_redaction', v)}
            />
          </div>

          {Object.keys(pendingChanges).length > 0 && (
            <Button
              onClick={handleSaveClick}
              className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Save changes
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={(open) => !open && handleCancelConfirm()}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Confirm compliance changes</DialogTitle>
            <DialogDescription>
              You are about to update compliance settings. These changes may affect data storage and
              retention. Do you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConfirm} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
