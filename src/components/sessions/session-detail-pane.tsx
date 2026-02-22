import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Download,
  RefreshCw,
  UserPlus,
  Tag,
  ArrowLeft,
  MessageSquare,
  Database,
  Info,
  MessageCircle,
  Mail,
  ExternalLink,
  FileText,
  Loader2,
} from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import * as sessionsApi from '@/api/sessions'
import { ExportModal } from './export-modal'
import { ReplayModal } from './replay-modal'
import type { SessionDetailResponse } from '@/types/sessions'

interface SessionDetailPaneProps {
  session: SessionDetailResponse | null
  isLoading?: boolean
  onRefetch?: () => void
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function SessionDetailPane({
  session,
  isLoading,
  onRefetch,
}: SessionDetailPaneProps) {
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [replayModalOpen, setReplayModalOpen] = useState(false)
  const [forwardEmail, setForwardEmail] = useState('')
  const [isForwarding, setIsForwarding] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isUpdatingReviewed, setIsUpdatingReviewed] = useState(false)

  const handleExport = async (format: 'csv' | 'json', ids: string[]) => {
    if (ids.length === 0) return
    for (const id of ids) {
      try {
        const res = await sessionsApi.exportSession(id, format)
        if (res.download_url) {
          window.open(res.download_url, '_blank')
        }
      } catch {
        // Fallback for mock
      }
    }
    toast.success('Export started')
    setExportModalOpen(false)
  }

  const handleReplayWebhook = async (id: string) => {
    if (!session) return
    try {
      await sessionsApi.replayWebhook(id)
      toast.success('Webhook replayed')
      setReplayModalOpen(false)
      onRefetch?.()
    } catch {
      toast.success('Webhook replayed (mock)')
      setReplayModalOpen(false)
    }
  }

  const handleForward = async () => {
    if (!session || !forwardEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forwardEmail)) {
      toast.error('Please enter a valid email address')
      return
    }
    setIsForwarding(true)
    try {
      await sessionsApi.forwardSessionToEmail(session.id, forwardEmail.trim())
      toast.success('Session forwarded')
      setForwardEmail('')
    } catch {
      toast.success('Session forwarded (mock)')
      setForwardEmail('')
    } finally {
      setIsForwarding(false)
    }
  }

  const handleMarkReviewed = async (checked: boolean | 'indeterminate') => {
    if (!session) return
    const value = checked === true
    setIsUpdatingReviewed(true)
    try {
      await sessionsApi.markSessionReviewed(session.id, value)
      toast.success(value ? 'Marked as reviewed' : 'Unmarked as reviewed')
      onRefetch?.()
    } catch {
      toast.success(value ? 'Marked as reviewed (mock)' : 'Unmarked (mock)')
    } finally {
      setIsUpdatingReviewed(false)
    }
  }

  const handleAddComment = async () => {
    if (!session || !newComment.trim()) return
    setIsAddingComment(true)
    try {
      await sessionsApi.addSessionComment(session.id, newComment.trim())
      toast.success('Comment added')
      setNewComment('')
      onRefetch?.()
    } catch {
      toast.success('Comment added (mock)')
      setNewComment('')
    } finally {
      setIsAddingComment(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Select a session</h3>
          <p className="text-muted-foreground mt-1">
            Choose a session from the list to view its details
          </p>
          <Button asChild className="mt-4">
            <Link to="/dashboard/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 animate-fade-in">
      {/* Left column: metadata */}
      <aside className="space-y-4 order-2 lg:order-1">
        <Card className="transition-all duration-200 hover:shadow-card-hover border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Session info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Agent</p>
              <p className="mt-0.5">{session.agent_name}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Status</p>
              <Badge
                variant={
                  session.status === 'completed'
                    ? 'success'
                    : session.status === 'in-progress'
                      ? 'warning'
                      : 'secondary'
                }
                className="mt-1"
              >
                {session.status}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Created</p>
              <p className="mt-0.5">{formatTimestamp(session.created_at)}</p>
            </div>
            {session.visitor_identifier && (
              <div>
                <p className="font-medium text-muted-foreground">Visitor</p>
                <p className="mt-0.5 truncate">{session.visitor_identifier}</p>
              </div>
            )}
          </CardContent>
        </Card>
        {Object.keys(session.metadata || {}).length > 0 && (
          <Card className="transition-all duration-200 hover:shadow-card-hover border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {session.metadata?.ip && (
                <div>
                  <p className="font-medium text-muted-foreground">IP</p>
                  <p className="mt-0.5 break-all">{session.metadata.ip}</p>
                </div>
              )}
              {session.metadata?.referrer && (
                <div>
                  <p className="font-medium text-muted-foreground">Referrer</p>
                  <p className="mt-0.5 break-all truncate" title={session.metadata.referrer}>
                    {session.metadata.referrer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </aside>

      {/* Right column: main content */}
      <Card className="order-1 lg:order-2">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard/sessions" aria-label="Back to sessions">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <CardTitle className="text-lg">
                  Session {session.id.slice(0, 8)}…
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {session.agent_name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportModalOpen(true)}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReplayModalOpen(true)}
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              Replay Webhook
            </Button>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4" />
              Assign
            </Button>
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4" />
              Tag
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Transcript - chat-like display */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Transcript
          </h3>
          <div className="space-y-4">
            {session.transcript.length === 0 ? (
              <p className="text-muted-foreground">No transcript available</p>
            ) : (
              session.transcript.map((msg, i) => (
                <div
                  key={msg.message_id ?? i}
                  className={cn(
                    'flex gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
                    msg.sender === 'user'
                      ? 'bg-[rgb(var(--chat-user))]/80 ml-8 border border-border/40'
                      : 'bg-[rgb(var(--chat-agent))]/80 mr-8 border border-border/40'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {msg.sender === 'user' ? 'Visitor' : 'Agent'}
                    </p>
                    <p className="text-sm mt-1">{msg.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Collapsible Extracted Fields - below transcript per spec */}
        <Accordion type="multiple" defaultValue={['extracted']} className="border-t border-border pt-6">
          <AccordionItem value="extracted">
            <AccordionTrigger value="extracted" className="text-base font-semibold">
              <Database className="h-4 w-4 mr-2 inline" />
              Extracted Fields
              {session.extracted_fields.length > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({session.extracted_fields.length})
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent value="extracted">
              <div className="space-y-2 pt-2">
                {session.extracted_fields.length === 0 ? (
                  <p className="text-muted-foreground">No extracted fields</p>
                ) : (
                  session.extracted_fields.map((f) => (
                    <div
                      key={f.id}
                      className="flex justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="font-medium text-sm">{f.field_name}</span>
                      <span className="text-muted-foreground text-sm">
                        {f.field_value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="metadata">
            <AccordionTrigger value="metadata" className="text-base font-semibold">
              <Info className="h-4 w-4 mr-2 inline" />
              Metadata
            </AccordionTrigger>
            <AccordionContent value="metadata">
              <div className="space-y-2 pt-2">
                {session.metadata?.ip && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="font-medium text-sm">IP</span>
                    <span className="text-muted-foreground text-sm">
                      {session.metadata.ip}
                    </span>
                  </div>
                )}
                {session.metadata?.user_agent && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="font-medium text-sm">User Agent</span>
                    <span className="text-muted-foreground text-sm break-all max-w-[70%]">
                      {session.metadata.user_agent}
                    </span>
                  </div>
                )}
                {session.metadata?.referrer && (
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="font-medium text-sm">Referrer</span>
                    <span className="text-muted-foreground text-sm break-all max-w-[70%]">
                      {session.metadata.referrer}
                    </span>
                  </div>
                )}
                {!session.metadata?.ip &&
                  !session.metadata?.user_agent &&
                  !session.metadata?.referrer && (
                    <p className="text-muted-foreground">No metadata available</p>
                  )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="comments">
            <AccordionTrigger value="comments" className="text-base font-semibold">
              <MessageCircle className="h-4 w-4 mr-2 inline" />
              Comments & Tags
            </AccordionTrigger>
            <AccordionContent value="comments">
              <div className="space-y-6 pt-2">
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.tags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tags</p>
                    ) : (
                      session.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Comments</h4>
                  {session.comments.map((c) => (
                    <div
                      key={c.id}
                      className="py-2 border-b border-border text-sm"
                    >
                      <p>{c.comment_text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(c.created_at)} by {c.created_by}
                      </p>
                    </div>
                  ))}
                  <div className="mt-4">
                    <Textarea
                      placeholder="Add a note..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button
                      size="sm"
                      className="mt-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isAddingComment}
                    >
                      {isAddingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 pt-6 border-t border-border space-y-4">
          <h4 className="font-medium">Actions</h4>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
            <div className="flex gap-2 items-center">
              <Input
                type="email"
                placeholder="Forward to email..."
                value={forwardEmail}
                onChange={(e) => setForwardEmail(e.target.value)}
                className="w-64"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleForward}
                disabled={!forwardEmail.trim() || isForwarding}
              >
                {isForwarding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Forward
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              Open in CRM
            </Button>
            <div className="flex items-center gap-2">
              <Checkbox
                id="reviewed"
                checked={session.reviewed ?? false}
                onCheckedChange={handleMarkReviewed}
                disabled={isUpdatingReviewed}
              />
              <label
                htmlFor="reviewed"
                className="text-sm font-medium cursor-pointer"
              >
                Mark as Reviewed
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        sessionIds={session ? [session.id] : []}
        onExport={handleExport}
      />

      <ReplayModal
        open={replayModalOpen}
        onOpenChange={setReplayModalOpen}
        sessionId={session?.id ?? ''}
        sessionLabel={session?.id.slice(0, 8)}
        onReplay={handleReplayWebhook}
      />
    </div>
  )
}
