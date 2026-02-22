import { useEffect, useState, useCallback } from 'react'
import { LogsViewer } from '@/components/admin'
import { fetchLogs } from '@/api/admin'
import type { AdminLog } from '@/types/admin'
import { toast } from 'sonner'

export function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const loadLogs = useCallback(() => {
    setIsLoading(true)
    fetchLogs({
      type: typeFilter || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
      page,
      pageSize,
    })
      .then((res) => {
        setLogs(res.data)
        setTotal(res.total)
      })
      .catch(() => {
        toast.error('Failed to load logs')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [typeFilter, dateFrom, dateTo, page, pageSize])

  useEffect(() => {
    queueMicrotask(() => loadLogs())
  }, [loadLogs])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#191A1D]">Logs & Audit</h1>
        <p className="text-[#687076] mt-1">
          Webhook delivery logs, system errors, and security alerts
        </p>
      </div>

      <LogsViewer
        logs={logs}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s)
          setPage(1)
        }}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        search={search}
        onSearchChange={setSearch}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />
    </div>
  )
}
