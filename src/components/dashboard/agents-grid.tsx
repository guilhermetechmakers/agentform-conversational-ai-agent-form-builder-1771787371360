import { AgentCard } from './agent-card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AgentListItem } from '@/types/agents'

interface AgentsGridProps {
  agents: AgentListItem[]
  isLoading?: boolean
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  onCopyLink?: (id: string) => void
}

function AgentCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  )
}

export function AgentsGrid({
  agents,
  isLoading,
  onDuplicate,
  onDelete,
  onCopyLink,
}: AgentsGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid gap-4',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      )}
    >
      {agents.map((agent, index) => (
        <div
          key={agent.id}
          className="animate-fade-in"
          style={
            {
              animationDelay: `${Math.min(index * 50, 300)}ms`,
              animationFillMode: 'both',
            } as React.CSSProperties
          }
        >
          <AgentCard
            agent={agent}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onCopyLink={onCopyLink}
          />
        </div>
      ))}
    </div>
  )
}
