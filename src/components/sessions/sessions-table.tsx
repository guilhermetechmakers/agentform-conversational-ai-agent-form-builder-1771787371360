import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionActionsMenu } from './session-actions-menu'
import type { SessionListItem } from '@/types/sessions'

type SortKey =
  | 'id'
  | 'agent_name'
  | 'visitor_identifier'
  | 'status'
  | 'created_at'
  | 'extracted_fields'

interface SessionsTableProps {
  sessions: SessionListItem[]
  isLoading?: boolean
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: SortKey) => void
  page: number
  pageSize: number
  total: number
  onPageChange?: (page: number) => void
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onExport?: (id: string) => void
  onReplayWebhook?: (id: string) => void
  onAssign?: (id: string) => void
  onTag?: (id: string) => void
  /** When true, show "create agent" CTA in empty state */
  hasActiveFilters?: boolean
}

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
  return entries.map(([k, v]) => `${k}: ${v}`).join(', ')
}

export function SessionsTable({
  sessions,
  isLoading,
  sortKey = 'created_at',
  sortDir = 'desc',
  onSort,
  page,
  pageSize,
  total,
  onPageChange,
  selectedIds,
  onSelectionChange,
  onExport,
  onReplayWebhook,
  onAssign,
  onTag,
  hasActiveFilters = false,
}: SessionsTableProps) {
  const totalPages = Math.ceil(total / pageSize) || 1
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const allSelected =
    sessions.length > 0 &&
    sessions.every((s) => selectedIds.has(s.id))

  const toggleAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(sessions.map((s) => s.id)))
    }
  }, [allSelected, sessions, onSelectionChange])

  const toggleOne = useCallback(
    (id: string) => {
      const next = new Set(selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      onSelectionChange(next)
    },
    [selectedIds, onSelectionChange]
  )

  const SortButton = useCallback(
    (col: SortKey) => {
      if (!onSort) return null
      const active = sortKey === col
      return (
        <button
          type="button"
          onClick={() => onSort(col)}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ml-1"
          aria-label={`Sort by ${col}`}
        >
          {active && sortDir === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : active && sortDir === 'desc' ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" />
          )}
        </button>
      )
    },
    [onSort, sortKey, sortDir]
  )

  if (sessions.length === 0 && !isLoading) {
    const noSessionsYet = !hasActiveFilters
    return (
      <Card className="transition-all duration-200 hover:shadow-card-hover border-border">
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4 transition-all duration-200 hover:shadow-card">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              {noSessionsYet ? 'No sessions yet' : 'No sessions match your filters'}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              {noSessionsYet
                ? 'Create an agent and share its public link to start collecting conversations. Sessions will appear here once visitors complete forms.'
                : 'Try adjusting your search or filters to find what you\'re looking for.'}
            </p>
            {noSessionsYet ? (
              <Button asChild className="mt-6 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/dashboard/agents/new">
                  <Bot className="h-4 w-4 mr-2" />
                  Create your first agent
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 w-10 sticky left-0 bg-card z-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Session ID
                    {SortButton('id')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Agent Name
                    {SortButton('agent_name')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Visitor
                    {SortButton('visitor_identifier')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Status
                    {SortButton('status')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <span className="inline-flex items-center">
                    Created
                    {SortButton('created_at')}
                  </span>
                </th>
                <th className="text-left py-3 px-4 font-medium max-w-[200px]">
                  <span className="inline-flex items-center">
                    Collected Fields
                    {SortButton('extracted_fields')}
                  </span>
                </th>
                <th className="text-right py-3 px-4 w-12" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="py-3 px-4" />
                  </tr>
                ))
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors group"
                  >
                    <td className="py-3 px-4 sticky left-0 bg-inherit z-[1] group-hover:bg-muted/50">
                      <Checkbox
                        checked={selectedIds.has(session.id)}
                        onCheckedChange={() => toggleOne(session.id)}
                        aria-label={`Select session ${session.id}`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/dashboard/sessions/${session.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {session.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="py-3 px-4">{session.agent_name}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {session.visitor_identifier || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          session.status === 'completed' ? 'success' : 'secondary'
                        }
                      >
                        {session.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {formatDate(session.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm max-w-[200px] truncate">
                      {fieldsSummary(session.extracted_fields_summary)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <SessionActionsMenu
                        session={session}
                        onExport={onExport}
                        onReplayWebhook={onReplayWebhook}
                        onAssign={onAssign}
                        onTag={onTag}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of{' '}
              {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
