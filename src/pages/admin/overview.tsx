import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, MessageSquare, Zap, DollarSign } from 'lucide-react'
import { MetricsCard } from '@/components/admin'
import { fetchMetrics } from '@/api/admin'
import type { AdminMetrics } from '@/types/admin'

export function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load metrics')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-[#191A1D]">Dashboard</h1>
          <p className="text-[#687076] mt-1">
            Global metrics and system overview
          </p>
        </div>
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <p className="text-sm text-[#687076] mt-1">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    )
  }

  const apiUsagePercent = metrics
    ? Math.min(100, (metrics.apiUsage / metrics.apiUsageLimit) * 100)
    : 0
  const llmSpendPercent = metrics
    ? Math.min(100, (metrics.llmSpend / metrics.llmSpendLimit) * 100)
    : 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#191A1D]">Dashboard</h1>
        <p className="text-[#687076] mt-1">
          Global metrics and system overview
        </p>
      </div>

      {/* Global metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          label="Total Agents"
          value={isLoading ? '—' : metrics?.totalAgents ?? 0}
          icon={Bot}
        />
        <MetricsCard
          label="Total Sessions"
          value={isLoading ? '—' : metrics?.totalSessions?.toLocaleString() ?? 0}
          icon={MessageSquare}
        />
        <MetricsCard
          label="API Usage"
          value={isLoading ? '—' : `${((metrics?.apiUsage ?? 0) / 1000).toFixed(0)}k`}
          icon={Zap}
          progress={
            metrics
              ? {
                  value: metrics.apiUsage,
                  max: metrics.apiUsageLimit,
                  label: 'Requests',
                }
              : undefined
          }
          status={
            apiUsagePercent >= 100
              ? 'critical'
              : apiUsagePercent >= 90
                ? 'warning'
                : 'normal'
          }
        />
        <MetricsCard
          label="LLM Spend"
          value={
            isLoading ? '—' : `$${metrics?.llmSpend ?? 0}`
          }
          icon={DollarSign}
          progress={
            metrics
              ? {
                  value: metrics.llmSpend,
                  max: metrics.llmSpendLimit,
                  label: 'USD',
                }
              : undefined
          }
          status={
            llmSpendPercent >= 100
              ? 'critical'
              : llmSpendPercent >= 90
                ? 'warning'
                : 'normal'
          }
        />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/users"
          className="block p-6 rounded-xl border border-[#EDEDED] bg-[#FFFFFF] transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h3 className="font-semibold text-[#191A1D]">User Management</h3>
          <p className="text-sm text-[#687076] mt-1">
            Manage users, roles, and account status
          </p>
        </Link>
        <Link
          to="/admin/agents"
          className="block p-6 rounded-xl border border-[#EDEDED] bg-[#FFFFFF] transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h3 className="font-semibold text-[#191A1D]">Agent Moderation</h3>
          <p className="text-sm text-[#687076] mt-1">
            Review and moderate published agents
          </p>
        </Link>
        <Link
          to="/admin/logs"
          className="block p-6 rounded-xl border border-[#EDEDED] bg-[#FFFFFF] transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <h3 className="font-semibold text-[#191A1D]">Logs & Audit</h3>
          <p className="text-sm text-[#687076] mt-1">
            Webhook logs, errors, and security alerts
          </p>
        </Link>
      </div>
    </div>
  )
}
