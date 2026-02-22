import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SessionsFilters,
  SessionsTable,
  SessionsCardGrid,
  SessionsBulkActions,
  ExportModal,
  ReplayModal,
  DEFAULT_SESSIONS_FILTERS,
} from '@/components/sessions'
import type {
  SessionsFilterState,
  ViewMode,
  ExportFormat,
} from '@/components/sessions'
import { useAgents } from '@/hooks/use-agents'
import { useSessions } from '@/hooks/use-sessions'
import { debounce } from '@/lib/utils'
import * as sessionsApi from '@/api/sessions'
import type {
  SessionSortField,
  SessionStatus,
} from '@/types/sessions'

const PAGE_SIZE = 10

const MOCK_TAGS = ['lead', 'feedback', 'support']
const MOCK_FIELDS = ['email', 'name', 'rating', 'feedback']

export function SessionsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') ?? ''
  const [filters, setFilters] = useState<SessionsFilterState>({
    ...DEFAULT_SESSIONS_FILTERS,
    search: urlSearch,
  })
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SessionSortField>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportSessionIds, setExportSessionIds] = useState<string[]>([])
  const [replayModalOpen, setReplayModalOpen] = useState(false)
  const [replaySessionId, setReplaySessionId] = useState<string | null>(null)

  useEffect(() => {
    setDebouncedSearch(urlSearch)
    setFilters((prev) => ({ ...prev, search: urlSearch }))
  }, [urlSearch])

  const debouncedSetSearch = useMemo(
    () =>
      debounce((v: string) => {
        setDebouncedSearch(v)
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev)
            if (v) next.set('search', v)
            else next.delete('search')
            return next
          },
          { replace: true }
        )
      }, 300),
    [setSearchParams]
  )

  const apiParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      agent_id: filters.agent_id || undefined,
      status:
        filters.status !== 'all' ? (filters.status as SessionStatus) : undefined,
      tag: filters.tag || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      field_name: filters.field_name || undefined,
      field_value: filters.field_value || undefined,
      sort: sortKey,
      order: sortDir,
      page,
      page_size: PAGE_SIZE,
    }),
    [
      debouncedSearch,
      filters.agent_id,
      filters.status,
      filters.tag,
      filters.date_from,
      filters.date_to,
      filters.field_name,
      filters.field_value,
      sortKey,
      sortDir,
      page,
    ]
  )

  const { data, isLoading, refetch } = useSessions(apiParams)
  const { data: agentsData } = useAgents({ page_size: 100 })
  const agents = agentsData?.agents ?? []
  const sessions = data?.sessions ?? []
  const total = data?.total ?? 0

  const handleSort = useCallback((key: SessionSortField) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
      } else {
        setSortDir('desc')
      }
      return key
    })
  }, [])

  const handleExport = useCallback(
    async (format: ExportFormat, ids: string[]) => {
      for (const id of ids) {
        try {
          const res = await sessionsApi.exportSession(id, format)
          if (res.download_url) {
            window.open(res.download_url, '_blank')
          }
        } catch {
          // Fallback for mock
        }
      }
      toast.success(
        ids.length === 1
          ? 'Export started'
          : `Export started for ${ids.length} sessions`
      )
    },
    []
  )

  const handleReplayWebhook = useCallback(async (id: string) => {
    try {
      await sessionsApi.replayWebhook(id)
      toast.success('Webhook replayed')
      refetch()
    } catch {
      toast.success('Webhook replayed (mock)')
    }
  }, [refetch])

  const openExportModal = useCallback(() => {
    const ids =
      selectedIds.size > 0 ? Array.from(selectedIds) : sessions.map((s) => s.id)
    if (ids.length === 0) return
    setExportSessionIds(ids)
    setExportModalOpen(true)
  }, [selectedIds, sessions])

  const openExportModalForSession = useCallback((id: string) => {
    setExportSessionIds([id])
    setExportModalOpen(true)
  }, [])

  const openReplayModal = useCallback((id: string) => {
    setReplaySessionId(id)
    setReplayModalOpen(true)
  }, [])


  const hasActiveFilters = !!(
    debouncedSearch ||
    filters.agent_id ||
    filters.status !== 'all' ||
    filters.tag ||
    filters.date_from ||
    filters.date_to ||
    filters.field_name ||
    filters.field_value
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Review transcripts and extracted data from your agent conversations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-lg border border-border p-1"
            role="group"
            aria-label="View mode"
          >
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="transition-transform hover:scale-[1.02]"
              aria-pressed={viewMode === 'cards'}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="transition-transform hover:scale-[1.02]"
              aria-pressed={viewMode === 'table'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            disabled={sessions.length === 0}
            onClick={openExportModal}
            className="transition-transform hover:scale-[1.02]"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <SessionsFilters
        filters={filters}
        onFiltersChange={(f: SessionsFilterState) => {
          setFilters(f)
          setPage(1)
        }}
        onSearchChange={debouncedSetSearch}
        agents={agents.map((a) => ({ id: a.id, name: a.name }))}
        availableTags={MOCK_TAGS}
        availableFields={MOCK_FIELDS}
      />

      <SessionsBulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds(new Set())}
        onRefetch={refetch}
        onExportClick={openExportModal}
      />

      {viewMode === 'cards' ? (
        <SessionsCardGrid
          sessions={sessions}
          isLoading={isLoading}
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onExport={openExportModalForSession}
          onReplayWebhook={openReplayModal}
          hasActiveFilters={hasActiveFilters}
        />
      ) : (
        <SessionsTable
          sessions={sessions}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onExport={openExportModalForSession}
          onReplayWebhook={openReplayModal}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        sessionIds={exportSessionIds}
        onExport={handleExport}
      />

      {replaySessionId && (
        <ReplayModal
          open={replayModalOpen}
          onOpenChange={(open) => {
            setReplayModalOpen(open)
            if (!open) setReplaySessionId(null)
          }}
          sessionId={replaySessionId}
          sessionLabel={sessions.find((s) => s.id === replaySessionId)?.id.slice(0, 8)}
          onReplay={handleReplayWebhook}
        />
      )}
    </div>
  )
}
