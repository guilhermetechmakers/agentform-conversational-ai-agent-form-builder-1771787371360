import { useCallback } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionCard } from './session-card'
import { Link } from 'react-router-dom'
import { Bot } from 'lucide-react'
import type { SessionListItem } from '@/types/sessions'

export type ViewMode = 'cards' | 'table'

interface SessionsCardGridProps {
  sessions: SessionListItem[]
  isLoading?: boolean
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
  hasActiveFilters?: boolean
}

export function SessionsCardGrid({
  sessions,
  isLoading,
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
}: SessionsCardGridProps) {
  const totalPages = Math.ceil(total / pageSize) || 1
  const hasPrev = page > 1
  const hasNext = page < totalPages

  const allSelected =
    sessions.length > 0 && sessions.every((s) => selectedIds.has(s.id))

  const toggleAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(sessions.map((s) => s.id)))
    }
  }, [allSelected, sessions, onSelectionChange])

  const toggleOne = useCallback(
    (id: string, selected: boolean) => {
      const next = new Set(selectedIds)
      if (selected) next.add(id)
      else next.delete(id)
      onSelectionChange(next)
    },
    [selectedIds, onSelectionChange]
  )

  if (sessions.length === 0 && !isLoading) {
    const noSessionsYet = !hasActiveFilters
    return (
      <Card className="transition-all duration-200 hover:shadow-card-hover border-border">
        <CardHeader>
          <CardTitle className="sr-only">All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4 transition-all duration-200 hover:shadow-card">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              {noSessionsYet
                ? 'No sessions yet'
                : 'No sessions match your filters'}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              {noSessionsYet
                ? 'Create an agent and share its public link to start collecting conversations. Sessions will appear here once visitors complete forms.'
                : "Try adjusting your search or filters to find what you're looking for."}
            </p>
            {noSessionsYet ? (
              <Button
                asChild
                className="mt-6 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
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
    <div className="space-y-4">
      {sessions.length > 0 && (
        <div className="flex items-center gap-2 py-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            aria-label="Select all sessions on this page"
          />
          <span className="text-sm text-muted-foreground">
            Select all on this page
          </span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-4 w-32 mt-2" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          : sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                selected={selectedIds.has(session.id)}
                onSelectChange={(v) => toggleOne(session.id, v)}
                onExport={onExport}
                onReplayWebhook={onReplayWebhook}
                onAssign={onAssign}
                onTag={onTag}
              />
            ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, total)} of {total}
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
    </div>
  )
}
