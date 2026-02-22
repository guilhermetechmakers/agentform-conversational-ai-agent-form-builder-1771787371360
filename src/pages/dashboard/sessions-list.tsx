import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SessionsFilters,
  SessionsTable,
  SessionsBulkActions,
  DEFAULT_SESSIONS_FILTERS,
} from '@/components/sessions'
import type { SessionsFilterState } from '@/components/sessions'
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

  const handleExport = useCallback(async (id: string) => {
    try {
      const res = await sessionsApi.exportSession(id, 'csv')
      if (res.download_url) {
        window.open(res.download_url, '_blank')
        toast.success('Export started')
      } else {
        toast.success('Export started (mock)')
      }
    } catch {
      toast.success('Export started (mock)')
    }
  }, [])

  const handleReplayWebhook = useCallback(async (id: string) => {
    try {
      await sessionsApi.replayWebhook(id)
      toast.success('Webhook replayed')
    } catch {
      toast.success('Webhook replayed (mock)')
    }
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Review transcripts and extracted data from your agent conversations
          </p>
        </div>
        <Button
          variant="outline"
          disabled={sessions.length === 0}
          className="transition-transform hover:scale-[1.02]"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
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
      />

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
        onExport={handleExport}
        onReplayWebhook={handleReplayWebhook}
      />
    </div>
  )
}
