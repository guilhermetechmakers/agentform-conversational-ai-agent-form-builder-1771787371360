import { useEffect, useState, useCallback } from 'react'
import { AgentList } from '@/components/admin'
import { fetchAgents } from '@/api/admin'
import type { AdminAgent } from '@/types/admin'
import { toast } from 'sonner'

export function AdminAgentsPage() {
  const [agents, setAgents] = useState<AdminAgent[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadAgents = useCallback(() => {
    setIsLoading(true)
    fetchAgents({
      search: search || undefined,
      status: statusFilter || undefined,
      page,
      pageSize,
    })
      .then((res) => {
        setAgents(res.data)
        setTotal(res.total)
      })
      .catch(() => {
        toast.error('Failed to load agents')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [search, statusFilter, page, pageSize])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  const handleTakeDown = useCallback((agentId: string) => {
    toast.info(`Take down agent ${agentId} – implement with API when available`)
    loadAgents()
  }, [loadAgents])

  const handleFlag = useCallback((agentId: string) => {
    toast.info(`Flag agent ${agentId} for review – implement with API when available`)
    loadAgents()
  }, [loadAgents])

  const handleReview = useCallback((agentId: string) => {
    window.location.href = `/dashboard/sessions?agent=${agentId}`
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#191A1D]">Agents</h1>
        <p className="text-[#687076] mt-1">
          Moderate agents and review flagged sessions
        </p>
      </div>

      <AgentList
        agents={agents}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s)
          setPage(1)
        }}
        onTakeDown={handleTakeDown}
        onFlag={handleFlag}
        onReview={handleReview}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  )
}
