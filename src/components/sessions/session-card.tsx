import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { SessionActionsMenu } from './session-actions-menu'
import type { SessionListItem } from '@/types/sessions'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function fieldsSummary(fields: Record<string, string>): string {
  const entries = Object.entries(fields)
  if (entries.length === 0) return '—'
  return entries
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
}

function getStatusVariant(
  status: SessionListItem['status']
): 'success' | 'secondary' | 'warning' {
  if (status === 'completed') return 'success'
  if (status === 'in-progress') return 'warning'
  return 'secondary'
}

interface SessionCardProps {
  session: SessionListItem
  selected: boolean
  onSelectChange: (selected: boolean) => void
  onExport?: (id: string) => void
  onReplayWebhook?: (id: string) => void
  onAssign?: (id: string) => void
  onTag?: (id: string) => void
}

export function SessionCard({
  session,
  selected,
  onSelectChange,
  onExport,
  onReplayWebhook,
  onAssign,
  onTag,
}: SessionCardProps) {
  return (
    <Card
      className="group transition-all duration-200 hover:shadow-card-hover border-border overflow-hidden"
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Checkbox
              checked={selected}
              onCheckedChange={(v) => onSelectChange(v === true)}
              aria-label={`Select session ${session.id}`}
              className="mt-1 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <Link
                to={`/dashboard/sessions/${session.id}`}
                className="font-medium text-primary hover:underline block truncate"
              >
                {session.id.slice(0, 8)}…
              </Link>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {session.agent_name}
              </p>
            </div>
          </div>
          <SessionActionsMenu
            session={session}
            onExport={onExport}
            onReplayWebhook={onReplayWebhook}
            onAssign={onAssign}
            onTag={onTag}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant={getStatusVariant(session.status)}>
            {session.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(session.created_at)}
          </span>
        </div>
        {session.visitor_identifier && (
          <p className="text-sm text-muted-foreground truncate mb-2">
            {session.visitor_identifier}
          </p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {fieldsSummary(session.extracted_fields_summary)}
        </p>
        <Link
          to={`/dashboard/sessions/${session.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-3 group/link"
        >
          View details
          <ChevronRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
