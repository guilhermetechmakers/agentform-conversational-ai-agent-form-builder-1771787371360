import { useState, useCallback, useEffect } from 'react'
import { Mail, MessageCircle, Webhook, CreditCard, User, Key } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { fetchEmailEvents } from '@/api/email'
import type { EmailEvent, EmailEventType } from '@/types/email'

const EVENT_TYPE_LABELS: Record<EmailEventType, string> = {
  signup: 'Signup confirmation',
  reset: 'Password reset',
  session_completed: 'Session completed',
  webhook_failure: 'Webhook failure',
  billing_alert: 'Billing alert',
}

const EVENT_TYPE_ICONS: Record<EmailEventType, typeof Mail> = {
  signup: User,
  reset: Key,
  session_completed: MessageCircle,
  webhook_failure: Webhook,
  billing_alert: CreditCard,
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  } catch {
    return ts
  }
}

export function EmailEventsTable() {
  const [events, setEvents] = useState<EmailEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchEmailEvents({ page_size: 10 })
      setEvents(res.events ?? [])
    } catch {
      setEvents([])
      setError('Could not load email history')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  if (isLoading) {
    return (
      <Card className="transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Email History</CardTitle>
        <CardDescription>
          Recent emails sent to you (signup, sessions, webhooks, billing)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}
        {events.length === 0 ? (
          <div className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No email events yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Emails you receive will appear here
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 transition-transform hover:scale-[1.02]"
              onClick={loadEvents}
            >
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 10).map((ev) => {
              const Icon = EVENT_TYPE_ICONS[ev.event_type]
              return (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {EVENT_TYPE_LABELS[ev.event_type]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(ev.timestamp)} · {ev.status}
                    </p>
                  </div>
                </div>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={loadEvents}
            >
              Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
