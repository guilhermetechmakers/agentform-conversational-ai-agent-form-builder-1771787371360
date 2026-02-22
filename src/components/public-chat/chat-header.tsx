import { Link } from 'react-router-dom'
import { Bot, Flag } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PublicAgent, SessionStatus } from '@/types/public-chat'

interface ChatHeaderProps {
  agent: PublicAgent | null
  status: SessionStatus
  className?: string
}

export function ChatHeader({ agent, status, className }: ChatHeaderProps) {
  const isLive = status === 'live'

  return (
    <header
      className={cn(
        'sticky top-0 z-10 border-b border-border bg-[#F7F8FA] px-4 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 shrink-0 rounded-xl">
            <AvatarImage src={agent?.avatar_url} alt={agent?.name} />
            <AvatarFallback className="rounded-xl bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="font-bold text-[#191A1D] truncate">
              {agent?.name ?? 'Agent'}
            </h1>
            <p className="text-sm text-[#687076] truncate">
              {agent?.description ?? 'Conversational form assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={isLive ? 'warning' : 'secondary'}
            className={cn(
              'font-medium',
              isLive && 'bg-[#FFE066] text-[#191A1D] border-transparent'
            )}
          >
            {isLive ? 'Live' : 'Completed'}
          </Badge>
          <Link
            to="/help"
            className="flex items-center gap-1.5 text-xs text-[#687076] hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1"
            aria-label="Report abuse"
          >
            <Flag className="h-3.5 w-3.5" />
            Report abuse
          </Link>
        </div>
      </div>
    </header>
  )
}
