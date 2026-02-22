import {
  MoreHorizontal,
  Download,
  RefreshCw,
  UserPlus,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SessionListItem } from '@/types/sessions'

interface SessionActionsMenuProps {
  session: SessionListItem
  onExport?: (sessionId: string) => void
  onReplayWebhook?: (sessionId: string) => void
  onAssign?: (sessionId: string) => void
  onTag?: (sessionId: string) => void
}

export function SessionActionsMenu({
  session,
  onExport,
  onReplayWebhook,
  onAssign,
  onTag,
}: SessionActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-transform hover:scale-105"
          aria-label="Session actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => onExport?.(session.id)}
          className="cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onReplayWebhook?.(session.id)}
          className="cursor-pointer"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Replay Webhook
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onAssign?.(session.id)}
          className="cursor-pointer"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Assign
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onTag?.(session.id)}
          className="cursor-pointer"
        >
          <Tag className="mr-2 h-4 w-4" />
          Tag
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
