import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { AnalyticsCard } from '@/components/public-links'
import { useLinkAnalytics } from '@/hooks/use-public-links'
import * as publicLinksApi from '@/api/public-links'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function AgentAnalyticsPage() {
  const { id } = useParams()
  const [linkId, setLinkId] = useState<string | null>(null)
  const [isLoadingLink, setIsLoadingLink] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoadingLink(true)
    publicLinksApi
      .getPublicLinkByAgent(id)
      .then((link) => {
        if (!cancelled && link) {
          setLinkId(link.link_id)
        }
      })
      .catch(() => {
        if (!cancelled) setLinkId(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingLink(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const { analytics, isLoading, refetch } = useLinkAnalytics(linkId)

  if (!id) {
    return (
      <div className="space-y-6 animate-fade-in">
        <p className="text-muted-foreground">Invalid agent</p>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Agents Overview', href: '/dashboard/agents' },
    { label: 'Analytics' },
  ]

  if (isLoadingLink) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!linkId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No public link</h3>
          <p className="mt-1 max-w-sm text-center text-muted-foreground">
            Generate a public link for this agent to view analytics.
          </p>
          <Button asChild className="mt-6">
            <Link to={`/dashboard/agents/${id}`}>Configure agent</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Back to agents"
          >
            <Link to="/dashboard/agents">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Link analytics</h1>
            <p className="text-muted-foreground mt-1">
              Views, visitors, and traffic sources for this agent&apos;s public
              link
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Refresh
        </Button>
      </div>
      <AnalyticsCard analytics={analytics} isLoading={isLoading} />
    </div>
  )
}
