import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageSquare, Bell, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { NotificationPreferences } from '@/types/settings'

export interface NotificationSettingsProps {
  preferences: NotificationPreferences | null
  isLoading: boolean
  onFetch: () => void
  onUpdate: (data: Partial<NotificationPreferences>) => Promise<NotificationPreferences | void>
}

export function NotificationSettings({
  preferences,
  isLoading,
  onFetch,
  onUpdate,
}: NotificationSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(preferences)

  useEffect(() => {
    if (preferences) setLocalPrefs(preferences)
  }, [preferences])

  const handleToggle = useCallback(
    async (
      key: keyof Pick<
        NotificationPreferences,
        | 'email_notifications'
        | 'sms_notifications'
        | 'push_notifications'
      >
    ) => {
      const current = localPrefs ?? preferences
      if (!current) return
      const next = { ...current, [key]: !current[key] }
      setLocalPrefs(next)
      setIsSaving(true)
      try {
        await onUpdate(next)
        toast.success('Preferences updated')
      } catch {
        toast.error('Failed to update preferences')
        setLocalPrefs(current)
      } finally {
        setIsSaving(false)
      }
    },
    [localPrefs, preferences, onUpdate]
  )

  if (isLoading) {
    return (
      <Card className="animate-fade-in transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-11" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const prefs = localPrefs ?? preferences
  if (!prefs) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-muted-foreground text-center">No preferences set</p>
          <Button variant="outline" className="mt-4 mx-auto block" onClick={onFetch}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="email-notifications" className="font-medium cursor-pointer">
                Email notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
          </div>
          <Switch
            id="email-notifications"
            checked={prefs.email_notifications}
            onCheckedChange={() => handleToggle('email_notifications')}
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="sms-notifications" className="font-medium cursor-pointer">
                SMS notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive text message alerts</p>
            </div>
          </div>
          <Switch
            id="sms-notifications"
            checked={prefs.sms_notifications}
            onCheckedChange={() => handleToggle('sms_notifications')}
            disabled={isSaving}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="push-notifications" className="font-medium cursor-pointer">
                Push notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
            </div>
          </div>
          <Switch
            id="push-notifications"
            checked={prefs.push_notifications}
            onCheckedChange={() => handleToggle('push_notifications')}
            disabled={isSaving}
          />
        </div>
        <div className="pt-4 border-t border-border">
          <Button asChild variant="outline" size="sm" className="transition-transform hover:scale-[1.02]">
            <Link to="/dashboard/settings/notifications">
              Manage email alerts (sessions, webhooks, billing)
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
