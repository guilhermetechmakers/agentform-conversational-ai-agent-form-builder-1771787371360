import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { ChatProvider, useChat } from '@/contexts/chat-context'
import {
  ChatHeader,
  MessageList,
  SuggestionChips,
  InputComposer,
  ProgressSummary,
  SessionControls,
  ErrorRetry,
  LinkExpired,
  LinkUnauthorized,
} from '@/components/public-chat'
import { AccessModal } from '@/components/public-links'
import { Skeleton } from '@/components/ui/skeleton'
import * as publicLinksApi from '@/api/public-links'

type LinkCheckStatus =
  | 'loading'
  | 'expired'
  | 'password_required'
  | 'valid'
  | 'legacy'
  | 'error'

function PublicChatContent() {
  const {
    agent,
    session,
    messages,
    collectedFields,
    suggestions,
    isAgentLoading,
    isSessionLoading,
    isSending,
    error,
    hasEnded,
    sendMessage,
    endSession,
    retry,
    clearError,
    downloadTranscript,
  } = useChat()

  if (isAgentLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Skeleton className="h-[73px] rounded-none" />
        <div className="flex-1 p-4 max-w-3xl mx-auto w-full space-y-4">
          <Skeleton className="h-16 w-3/4 rounded-xl" />
          <Skeleton className="h-16 w-1/2 rounded-xl ml-auto" />
          <Skeleton className="h-16 w-2/3 rounded-xl" />
          <Skeleton className="h-16 w-4/5 rounded-xl ml-auto" />
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Agent not found
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          This agent may have been removed or the link may be incorrect.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ChatHeader
        agent={agent}
        status={session?.status ?? (hasEnded ? 'completed' : 'live')}
        sessionControls={
          session && (
            <SessionControls
              onEndSession={endSession}
              onDownloadTranscript={downloadTranscript}
              onRequestHuman={() =>
                toast.info(
                  'Your request has been submitted. We will contact you shortly.'
                )
              }
              disabled={isSending}
              hasEnded={hasEnded}
              variant="compact"
            />
          )
        }
      />

      {error && !session && (
        <div className="p-4 max-w-3xl mx-auto w-full">
          <ErrorRetry message={error} onRetry={retry} />
        </div>
      )}

      {error && session && (
        <div className="px-4 py-2 max-w-3xl mx-auto w-full">
          <ErrorRetry message={error} onRetry={clearError} />
        </div>
      )}

      {session && (
        <>
          <ProgressSummary
            fields={agent.fields_required}
            collected={collectedFields}
          />

          {isSessionLoading ? (
            <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
              <Skeleton className="h-16 w-3/4 rounded-xl" />
            </div>
          ) : (
            <>
              <MessageList messages={messages} isTyping={isSending} />

              <SuggestionChips
                suggestions={suggestions}
                onSelect={sendMessage}
                disabled={isSending || hasEnded}
              />

              <InputComposer
                onSend={sendMessage}
                disabled={isSending || hasEnded}
              />

              <SessionControls
                onEndSession={endSession}
                onDownloadTranscript={downloadTranscript}
                onRequestHuman={() =>
                  toast.info(
                    'Your request has been submitted. We will contact you shortly.'
                  )
                }
                disabled={isSending}
                hasEnded={hasEnded}
                variant="full"
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

export function PublicChatPage() {
  const { publicId } = useParams<{ publicId: string }>()
  const navigate = useNavigate()
  const [linkCheckStatus, setLinkCheckStatus] =
    useState<LinkCheckStatus>('loading')
  const [accessGranted, setAccessGranted] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const validatePassword = useCallback(
    async (password: string) => {
      if (!publicId) return
      setPasswordError(null)
      try {
        const res = await publicLinksApi.validatePublicLinkAccess(publicId, {
          password,
        })
        if (res.success) {
          setAccessGranted(true)
        } else {
          setPasswordError(res.message ?? 'Invalid password')
          throw new Error(res.message ?? 'Invalid password')
        }
      } catch (err) {
        const e = err as { message?: string }
        const msg = e?.message ?? 'Invalid password'
        setPasswordError(msg)
        toast.error(msg)
        throw err
      }
    },
    [publicId]
  )

  useEffect(() => {
    if (!publicId) return
    const token: string = publicId

    let cancelled = false

    async function checkLink() {
      try {
        const info = await publicLinksApi.getPublicLinkByToken(token)
        if (cancelled) return
        if (info.is_expired) {
          setLinkCheckStatus('expired')
        } else if (info.password_protected && !accessGranted) {
          setLinkCheckStatus('password_required')
        } else {
          setLinkCheckStatus('valid')
        }
      } catch {
        if (cancelled) return
        setLinkCheckStatus('legacy')
      }
    }

    if (accessGranted) {
      setLinkCheckStatus('valid')
      return
    }

    checkLink()
    return () => {
      cancelled = true
    }
  }, [publicId, accessGranted])

  if (!publicId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Invalid link
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please use a valid agent link to start a conversation.
        </p>
      </div>
    )
  }

  if (linkCheckStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">
          Verifying link...
        </p>
      </div>
    )
  }

  if (linkCheckStatus === 'expired') {
    return <LinkExpired />
  }

  if (linkCheckStatus === 'password_required') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="mb-4 text-center">
          <p className="text-muted-foreground">
            This agent link is password-protected.
          </p>
        </div>
        <AccessModal
          open={true}
          onOpenChange={(open) => {
            if (!open) navigate('/')
          }}
          onSubmit={validatePassword}
          error={passwordError}
          onClearError={() => setPasswordError(null)}
        />
      </div>
    )
  }

  if (linkCheckStatus === 'error') {
    return (
      <LinkUnauthorized message="This link is invalid or has been deactivated." />
    )
  }

  return (
    <ChatProvider urlToken={publicId}>
      <PublicChatContent />
    </ChatProvider>
  )
}
