import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ChevronRight, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { fetchEmailEvents } from '@/api/email'
import type { EmailEvent } from '@/types/email'
import { cn } from '@/lib/utils'

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function SessionNotificationsCard() {
  const [events, setEvents] = useState<EmailEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setEvents([])
    fetchEmailEvents({ event_type: 'session_completed', page_size: 5 })
      .then((res) => {
        if (!cancelled) setEvents(res.events ?? [])
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Session notifications
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Recent session completion emails sent to you
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link
            to="/dashboard/settings/notifications"
            className="flex items-center gap-1 transition-transform hover:scale-[1.02]"
          >
            Settings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Mail className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No session notifications yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Enable session completed emails in notification settings
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/dashboard/settings/notifications">
                Configure notifications
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border border-border p-3',
                  'transition-colors hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      Session completed
                      {ev.session_id && (
                        <span className="text-muted-foreground font-normal ml-1">
                          ({ev.session_id.slice(0, 8)}…)
                        </span>
                      )}
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
                      : 'secondary'
                  }
                  className="shrink-0"
                >
                  {ev.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
