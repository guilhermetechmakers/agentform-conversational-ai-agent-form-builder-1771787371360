import { useState, useCallback, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bot, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import {
  AgentsGrid,
  QuickStatsBar,
  FilterControls,
  PaginationControl,
} from '@/components/dashboard'
import type { FilterState } from '@/components/dashboard'
import { useAgents, useQuickStats } from '@/hooks/use-agents'
import * as agentsApi from '@/api/agents'
import { debounce } from '@/lib/utils'
import type { AgentStatus } from '@/types/agents'
import type { AgentListItem } from '@/types/agents'

const PAGE_SIZE = 12

export function AgentsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearch = searchParams.get('search') ?? ''
  const [filters, setFilters] = useState<FilterState>({
    search: urlSearch,
    status: 'all',
    tag: '',
    sort: 'created_at',
  })
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch)
  const [page, setPage] = useState(1)
  const [accumulatedAgents, setAccumulatedAgents] = useState<AgentListItem[]>([])

  useEffect(() => {
    setDebouncedSearch(urlSearch)
    setFilters((f) => ({ ...f, search: urlSearch }))
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
      },
      300
    ),
    [setSearchParams]
  )

  const apiParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status !== 'all' ? (filters.status as AgentStatus) : undefined,
      tag: filters.tag || undefined,
      sort: filters.sort,
      page,
      page_size: PAGE_SIZE,
    }),
    [debouncedSearch, filters.status, filters.tag, filters.sort, page]
  )

  const { data, isLoading, refetch } = useAgents(apiParams)
  const { stats, isLoading: statsLoading } = useQuickStats()

  useEffect(() => {
    if (!data?.agents) return
    if (page === 1) {
      setAccumulatedAgents(data.agents)
    } else {
      setAccumulatedAgents((prev) => {
        const ids = new Set(prev.map((a) => a.id))
        const newOnes = data.agents.filter((a) => !ids.has(a.id))
        return [...prev, ...newOnes]
      })
    }
  }, [data?.agents, page])

  useEffect(() => {
    setPage(1)
    setAccumulatedAgents([])
  }, [debouncedSearch, filters.status, filters.tag, filters.sort])

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1)
  }, [])

  const handleDuplicate = useCallback(async (id: string) => {
    try {
      await agentsApi.duplicateAgent(id)
      toast.success('Agent duplicated')
      refetch()
    } catch {
      toast.error('Failed to duplicate agent')
    }
  }, [refetch])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this agent?')) return
      try {
        await agentsApi.deleteAgent(id)
        toast.success('Agent deleted')
        refetch()
      } catch {
        toast.error('Failed to delete agent')
      }
    },
    [refetch]
  )

  const handleCopyLink = useCallback((id: string) => {
    const base = window.location.origin
    const url = `${base}/a/${id}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Public link copied to clipboard'),
      () => toast.error('Failed to copy link')
    )
  }, [])

  const agents = accumulatedAgents
  const hasMore = data?.has_more ?? false
  const isLoadingMore = isLoading && page > 1

  return (
    <div className="space-y-8 animate-fade-in">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Agents Overview' },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your conversational form agents
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/dashboard/agents/new">
            <Plus className="h-4 w-4" />
            Create Agent
          </Link>
        </Button>
      </div>

      <FilterControls
        filters={filters}
        onFiltersChange={(f) => {
          setFilters(f)
          setPage(1)
        }}
        onSearchChange={debouncedSetSearch}
        placeholder="Search agents..."
      />

      <QuickStatsBar stats={stats} isLoading={statsLoading} />

      {agents.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Bot className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No agents yet</h3>
          <p className="mt-1 max-w-sm text-muted-foreground">
            Create your first conversational agent to start collecting structured
            data through chat. Build forms that feel like natural conversations.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/dashboard/agents/new">
                <Plus className="h-4 w-4" />
                Create your first agent
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Tip: Start with a simple lead capture form, then add more fields as
            you go.
          </p>
        </div>
      ) : (
        <>
          <AgentsGrid
            agents={agents}
            isLoading={isLoading && page === 1}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onCopyLink={handleCopyLink}
          />
          <PaginationControl
            hasMore={hasMore}
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </>
      )}
    </div>
  )
}
