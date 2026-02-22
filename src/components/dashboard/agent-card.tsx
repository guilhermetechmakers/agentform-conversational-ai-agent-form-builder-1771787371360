import { Link } from 'react-router-dom'
import {
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  MessageSquare,
  Link2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { AgentListItem } from '@/types/agents'

interface AgentCardProps {
  agent: AgentListItem
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  onCopyLink?: (id: string) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function getStatusVariant(
  status: AgentListItem['status']
): 'success' | 'secondary' | 'warning' {
  switch (status) {
    case 'Published':
      return 'success'
    case 'Unpublished':
      return 'secondary'
    case 'On Progress':
      return 'warning'
    default:
      return 'secondary'
  }
}

export function AgentCard({
  agent,
  onDuplicate,
  onDelete,
  onCopyLink,
}: AgentCardProps) {
  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300',
        'hover:shadow-card-hover hover:scale-[1.01]'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Link
            to={`/dashboard/agents/${agent.id}`}
            className="flex min-w-0 flex-1"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={agent.avatar_url} alt={agent.name} />
                <AvatarFallback className="text-sm font-medium">
                  {agent.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-foreground">
                    {agent.name}
                  </p>
                  <Badge variant={getStatusVariant(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {agent.sessions_count} sessions · {agent.conversion_rate}%
                  conversion
                </p>
              </div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {formatDate(agent.created_at)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Agent actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/agents/${agent.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDuplicate?.(agent.id)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/dashboard/sessions?agent=${agent.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View sessions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onCopyLink?.(agent.id)}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Copy public link
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete?.(agent.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
