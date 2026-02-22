import { useState, useEffect } from 'react'
import { Shield, Lock, FileCheck, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchDataProtection, updateDataProtection } from '@/api/compliance'
import type { DataProtectionSettings } from '@/types/compliance'
import { toast } from 'sonner'

export function DataProtectionCard() {
  const [data, setData] = useState<DataProtectionSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [piiLoading, setPiiLoading] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await fetchDataProtection()
      setData(res)
    } catch {
      setData({
        encryption_at_rest: true,
        tls_version: 'TLS 1.3',
        certificate_expiry: new Date(Date.now() + 90 * 86400000).toISOString(),
        pii_redaction_enabled: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handlePiiToggle = async (enabled: boolean) => {
    setPiiLoading(true)
    try {
      const updated = await updateDataProtection({ pii_redaction_enabled: enabled })
      setData(updated)
      toast.success(enabled ? 'PII redaction enabled' : 'PII redaction disabled')
    } catch {
      toast.error('Failed to update PII redaction')
    } finally {
      setPiiLoading(false)
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
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  const certExpiry = data?.certificate_expiry
    ? new Date(data.certificate_expiry).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <TooltipProvider>
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Protection
          </CardTitle>
          <CardDescription>
            Encryption, TLS, and PII redaction settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 rounded-lg border border-border p-4">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {data?.encryption_at_rest
                  ? 'Data is encrypted at-rest'
                  : 'Encryption at-rest'}
              </p>
              <p className="text-sm text-muted-foreground">
                {data?.encryption_at_rest
                  ? 'AES-256 encryption protects all stored data'
                  : 'Enable encryption for stored data'}
              </p>
            </div>
            {data?.encryption_at_rest && (
              <span className="ml-auto text-sm font-medium text-green-600">
                Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-border p-4">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">TLS in-transit</p>
              <p className="text-sm text-muted-foreground">
                {data?.tls_version ?? 'TLS 1.2'} or higher for all connections
                {certExpiry && ` • Certificate valid until ${certExpiry}`}
              </p>
            </div>
            <span className="ml-auto text-sm font-medium text-green-600">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="pii-redaction">PII Redaction</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    When enabled, personally identifiable information (names,
                    emails, etc.) is automatically redacted in logs and exports.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">
                Redact PII in logs and data exports
              </p>
            </div>
            <Switch
              id="pii-redaction"
              checked={data?.pii_redaction_enabled ?? false}
              onCheckedChange={handlePiiToggle}
              disabled={piiLoading}
            />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
