import { useState, useCallback, useEffect } from 'react'
import {
  Mail,
  MessageSquare,
  Bell,
  MessageCircle,
  AlertTriangle,
  CreditCard,
  Inbox,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import {
  useNotificationPreferences,
} from '@/hooks/use-settings'
import type { NotificationPreferences } from '@/types/settings'
import type { ApiError } from '@/lib/api'
import { fetchEmailEvents } from '@/api/email'
import type { EmailEvent, EmailEventType } from '@/types/email'
import { cn } from '@/lib/utils'

const EMAIL_EVENT_LABELS: Record<EmailEventType, string> = {
  signup: 'Signup confirmation',
  reset: 'Password reset',
  session_completed: 'Session completed',
  webhook_failure: 'Webhook failure',
  billing_alert: 'Billing alert',
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function NotificationsSection() {
  const { data: prefs, isLoading, error, refetch, update } = useNotificationPreferences()
  const [isSaving, setIsSaving] = useState(false)
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(prefs)
  const [emailEvents, setEmailEvents] = useState<EmailEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    if (prefs) setLocalPrefs(prefs)
  }, [prefs])

  const handleToggle = useCallback(
    async (
      key: keyof Pick<
        NotificationPreferences,
        | 'email_notifications'
        | 'sms_notifications'
        | 'push_notifications'
        | 'session_completed_email'
        | 'webhook_failure_email'
        | 'billing_alerts_email'
      >
    ) => {
      const current = localPrefs ?? prefs
      if (!current) return
      const next = { ...current, [key]: !current[key] }
      setLocalPrefs(next)
      setIsSaving(true)
      try {
        await update(next)
        toast.success('Preferences updated')
      } catch (err) {
        const e = err as ApiError
        toast.error(e?.message ?? 'Failed to update preferences')
        setLocalPrefs(current)
      } finally {
        setIsSaving(false)
      }
    },
    [localPrefs, prefs, update]
  )

  useEffect(() => {
    let cancelled = false
    setEventsLoading(true)
    fetchEmailEvents({ page_size: 10 })
      .then((res) => {
        if (!cancelled) setEmailEvents(res.events ?? [])
      })
      .catch(() => {
        if (!cancelled) setEmailEvents([])
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-11" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !prefs) {
    return (
      <div className="space-y-8 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Email & Notifications
        </h1>
        <Card>
          <CardContent className="py-12">
            <p className="text-destructive text-center">
              {error ?? 'Failed to load notification preferences'}
            </p>
            <Button
              variant="outline"
              className="mt-4 mx-auto block transition-transform hover:scale-[1.02]"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayPrefs = localPrefs ?? prefs

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Email & Notifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your email preferences, alerts, and notification settings
        </p>
      </div>

      {/* General notification channels */}
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Notification channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="email-notifications"
                  className="font-medium cursor-pointer"
                >
                  Email notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates and alerts via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={displayPrefs.email_notifications}
              onCheckedChange={() => handleToggle('email_notifications')}
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="sms-notifications"
                  className="font-medium cursor-pointer"
                >
                  SMS notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive text message alerts
                </p>
              </div>
            </div>
            <Switch
              id="sms-notifications"
              checked={displayPrefs.sms_notifications}
              onCheckedChange={() => handleToggle('sms_notifications')}
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="push-notifications"
                  className="font-medium cursor-pointer"
                >
                  Push notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={displayPrefs.push_notifications}
              onCheckedChange={() => handleToggle('push_notifications')}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email-specific alerts */}
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email alerts
          </CardTitle>
          <CardDescription>
            Configure which events trigger email notifications. Requires email
            notifications to be enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              'flex items-center justify-between rounded-lg border border-border p-4 transition-colors',
              !displayPrefs.email_notifications && 'opacity-60'
            )}
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="session-completed"
                  className="font-medium cursor-pointer"
                >
                  Session completed
                </Label>
                <p className="text-sm text-muted-foreground">
                  Email when a conversation session completes, with summary and
                  link to view
                </p>
              </div>
            </div>
            <Switch
              id="session-completed"
              checked={displayPrefs.session_completed_email ?? true}
              onCheckedChange={() =>
                handleToggle('session_completed_email')
              }
              disabled={isSaving || !displayPrefs.email_notifications}
            />
          </div>
          <div
            className={cn(
              'flex items-center justify-between rounded-lg border border-border p-4 transition-colors',
              !displayPrefs.email_notifications && 'opacity-60'
            )}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="webhook-failure"
                  className="font-medium cursor-pointer"
                >
                  Webhook failure alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Email when a webhook delivery fails, with error details and
                  troubleshooting steps
                </p>
              </div>
            </div>
            <Switch
              id="webhook-failure"
              checked={displayPrefs.webhook_failure_email ?? true}
              onCheckedChange={() => handleToggle('webhook_failure_email')}
              disabled={isSaving || !displayPrefs.email_notifications}
            />
          </div>
          <div
            className={cn(
              'flex items-center justify-between rounded-lg border border-border p-4 transition-colors',
              !displayPrefs.email_notifications && 'opacity-60'
            )}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="billing-alerts"
                  className="font-medium cursor-pointer"
                >
                  Billing alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Email for billing updates, payment confirmations, and usage
                  alerts
                </p>
              </div>
            </div>
            <Switch
              id="billing-alerts"
              checked={displayPrefs.billing_alerts_email ?? true}
              onCheckedChange={() => handleToggle('billing_alerts_email')}
              disabled={isSaving || !displayPrefs.email_notifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent email events */}
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Recent email activity
            </CardTitle>
            <CardDescription>
              Emails sent to your account in the last 30 days
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="transition-transform hover:scale-[1.02]">
            <Link to="/dashboard/sessions">
              View sessions
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : emailEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium text-muted-foreground">
                No email events yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Signup confirmations, session completions, and other emails will
                appear here
              </p>
              <Button
                variant="outline"
                className="mt-4 transition-transform hover:scale-[1.02]"
                asChild
              >
                <Link to="/dashboard/sessions">View sessions</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {emailEvents.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {EMAIL_EVENT_LABELS[ev.event_type] ?? ev.event_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(ev.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      ev.status === 'delivered' || ev.status === 'sent'
                        ? 'success'
                        : ev.status === 'bounced' || ev.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {ev.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
