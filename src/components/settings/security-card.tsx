import { useState } from 'react'
import { Shield, Smartphone, Monitor, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useSecuritySettings } from '@/hooks/use-settings'
import * as settingsApi from '@/api/settings'
import { toast } from 'sonner'

export function SecurityCard() {
  const { data, isLoading, error, refetch } = useSecuritySettings()
  const [twoFaLoading, setTwoFaLoading] = useState(false)

  const handle2FAToggle = async (enabled: boolean) => {
    setTwoFaLoading(true)
    try {
      await settingsApi.updateSecuritySettings({ two_fa_enabled: enabled })
      toast.success(enabled ? '2FA enabled' : '2FA disabled')
      refetch()
    } catch {
      toast.error('Failed to update 2FA settings')
    } finally {
      setTwoFaLoading(false)
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
          <Skeleton className="h-12 w-full" />
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
            {error ?? 'Failed to load security settings'}
          </p>
          <Button variant="outline" className="mt-4 mx-auto block" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const sessions = data.session_activity ?? []

  return (
    <Card className="animate-fade-in transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Password, two-factor authentication, sessions, and IP restrictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="2fa" className="font-medium">
                Two-factor authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <Switch
            id="2fa"
            checked={data.two_fa_enabled}
            onCheckedChange={handle2FAToggle}
            disabled={twoFaLoading}
          />
        </div>

        <Button variant="outline" className="w-full justify-start" disabled>
          <Smartphone className="h-4 w-4 mr-2" />
          Change password
        </Button>

        <div>
          <h4 className="font-medium mb-3">Active sessions</h4>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No session activity recorded.</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{session.device ?? 'Unknown device'}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.location ?? session.ip ?? '—'} • Last active{' '}
                      {new Date(session.last_active).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" disabled>
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">IP allowlist</p>
          <p className="text-sm text-muted-foreground">
            Restrict access to specific IP addresses (enterprise)
          </p>
          <Button variant="outline" className="mt-4" disabled>
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
