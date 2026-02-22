import { useParams } from 'react-router-dom'
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
} from '@/components/public-chat'
import { Skeleton } from '@/components/ui/skeleton'

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
                onRequestHuman={() => toast.info('Your request has been submitted. We will contact you shortly.')}
                disabled={isSending}
                hasEnded={hasEnded}
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

  return (
    <ChatProvider urlToken={publicId}>
      <PublicChatContent />
    </ChatProvider>
  )
}
