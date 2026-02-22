import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAgents } from '@/hooks/use-agents'

interface AgentSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function AgentSidebar({
  collapsed = false,
  onToggleCollapse,
}: AgentSidebarProps) {
  const { id } = useParams()
  const [search, setSearch] = useState('')
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    all: true,
  })

  const { data, isLoading } = useAgents({
    search: search || undefined,
    page: 1,
    page_size: 20,
  })

  const agents = data?.agents ?? []

  const toggleSection = (key: string) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <aside
      className={cn(
        'flex flex-col bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="shrink-0 p-3 border-b border-border">
        {!collapsed && (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
                aria-label="Search agents"
              />
            </div>
            <Button asChild className="w-full" size="sm">
              <Link to="/dashboard/agents/new">
                <Plus className="h-4 w-4" />
                Create Agent
              </Link>
            </Button>
          </>
        )}
        {collapsed && (
          <Button asChild variant="ghost" size="icon" className="w-full">
            <Link to="/dashboard/agents/new" aria-label="Create agent">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {!collapsed && (
            <button
              type="button"
              onClick={() => toggleSection('all')}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg"
            >
              {sectionsOpen.all ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              All Agents
            </button>
          )}
          {sectionsOpen.all !== false && (
            <div className="mt-1 space-y-0.5">
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : agents.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No agents yet
                </div>
              ) : (
                agents.map((agent) => {
                  const isActive = id === agent.id
                  const content = (
                    <div
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2 py-2 transition-all duration-200',
                        isActive
                          ? 'bg-primary/20 text-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={agent.avatar_url} alt={agent.name} />
                        <AvatarFallback className="text-xs">
                          {agent.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {!collapsed && (
                        <span className="truncate text-sm font-medium">
                          {agent.name}
                        </span>
                      )}
                    </div>
                  )
                  return (
                    <div key={agent.id}>
                      {isActive ? (
                        <div>{content}</div>
                      ) : (
                        <Link to={`/dashboard/agents/${agent.id}`}>
                          {content}
                        </Link>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {onToggleCollapse && (
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5 rotate-[-90deg]" />
            )}
          </Button>
        </div>
      )}
    </aside>
  )
}
