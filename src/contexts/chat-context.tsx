import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import * as publicChatApi from '@/api/public-chat'
import type {
  PublicAgent,
  PublicSession,
  PublicChatMessage,
  CollectedField,
} from '@/types/public-chat'
import type { ApiError } from '@/lib/api'

export interface MessageWithId extends Omit<PublicChatMessage, 'message_id'> {
  id: string
}

/** Default retry limit for field validation failures */
const DEFAULT_VALIDATION_RETRY_LIMIT = 3

interface ChatContextValue {
  agent: PublicAgent | null
  session: PublicSession | null
  messages: MessageWithId[]
  collectedFields: CollectedField[]
  suggestions: string[]
  isAgentLoading: boolean
  isSessionLoading: boolean
  isSending: boolean
  error: string | null
  /** True when last error was a validation failure (user can retry by sending again) */
  isValidationError: boolean
  /** Remaining validation retries for current field (when applicable) */
  validationRetriesLeft: number
  hasEnded: boolean
  initializeAgent: (urlToken: string) => Promise<void>
  startSession: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
  endSession: () => Promise<void>
  retry: () => void
  clearError: () => void
  downloadTranscript: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

const DEMO_SUGGESTIONS = ['John Doe', 'john@example.com', '+1 555-0123']

function toMessageWithId(m: PublicChatMessage | { sender: 'user' | 'agent'; content: string; timestamp: string }, id: string): MessageWithId {
  return {
    id,
    session_id: 'session_id' in m ? m.session_id : '',
    sender: m.sender,
    content: m.content,
    timestamp: m.timestamp,
  }
}

export function ChatProvider({
  children,
  urlToken,
}: {
  children: ReactNode
  urlToken: string
}) {
  const [agent, setAgent] = useState<PublicAgent | null>(null)
  const [session, setSession] = useState<PublicSession | null>(null)
  const [messages, setMessages] = useState<MessageWithId[]>([])
  const [collectedFields, setCollectedFields] = useState<CollectedField[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isAgentLoading, setIsAgentLoading] = useState(true)
  const [isSessionLoading, setIsSessionLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidationError, setIsValidationError] = useState(false)
  const [validationRetriesLeft, setValidationRetriesLeft] = useState(DEFAULT_VALIDATION_RETRY_LIMIT)
  const [hasEnded, setHasEnded] = useState(false)

  const initializeAgent = useCallback(async (token: string) => {
    setIsAgentLoading(true)
    setError(null)
    try {
      const a = await publicChatApi.fetchAgentByUrlToken(token)
      setAgent(a)
    } catch (err) {
      const e = err as ApiError
      const msg = e?.message ?? 'Failed to load agent'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsAgentLoading(false)
    }
  }, [])

  const startSession = useCallback(async () => {
    if (!agent) return
    setIsSessionLoading(true)
    setError(null)
    try {
      const res = await publicChatApi.startSession(agent.agent_id)
      setSession(res)
      const greeting =
        agent.persona?.instructions ??
        `Hi! I'm ${agent.name}. I'll help you provide the information we need. What's your full name?`
      setMessages([
        toMessageWithId(
          {
            session_id: res.session_id,
            message_id: '',
            sender: 'agent',
            content: greeting,
            timestamp: new Date().toISOString(),
          },
          crypto.randomUUID()
        ),
      ])
      setSuggestions(DEMO_SUGGESTIONS)
    } catch (err) {
      const e = err as ApiError
      setError(e?.message ?? 'Failed to start session')
      toast.error(e?.message ?? 'Failed to start session')
    } finally {
      setIsSessionLoading(false)
    }
  }, [agent])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!session || isSending || !content.trim()) return

      const userMsg: MessageWithId = {
        id: crypto.randomUUID(),
        session_id: session.session_id,
        sender: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setSuggestions([])
      setIsSending(true)
      setError(null)
      setIsValidationError(false)

      try {
        const res = await publicChatApi.sendMessage(session.session_id, content)
        if (res.collected_fields?.length) {
          setCollectedFields((prev) => [...prev, ...res.collected_fields!])
          setValidationRetriesLeft(DEFAULT_VALIDATION_RETRY_LIMIT)
        }
        for (const m of res.messages ?? []) {
          setMessages((prev) => [
            ...prev,
            toMessageWithId(
              {
                message_id: '',
                session_id: session.session_id,
                sender: m.sender,
                content: m.content,
                timestamp: m.timestamp,
              },
              crypto.randomUUID()
            ),
          ])
        }
      } catch (err) {
        const e = err as ApiError
        const msg = e?.message ?? 'Failed to send message'
        const isValidation = msg.toLowerCase().includes('invalid') ||
          msg.toLowerCase().includes('validation') ||
          msg.toLowerCase().includes('format') ||
          e?.code === 'VALIDATION_ERROR'
        setIsValidationError(isValidation)
        if (isValidation) {
          setValidationRetriesLeft((prev) => Math.max(0, prev - 1))
        }
        setError(msg)
        toast.error(msg)
      } finally {
        setIsSending(false)
      }
    },
    [session, isSending]
  )

  const endSession = useCallback(async () => {
    if (!session || hasEnded) return
    try {
      await publicChatApi.endSession(session.session_id)
      setSession((prev) =>
        prev ? { ...prev, status: 'completed' as const } : null
      )
      setHasEnded(true)
      toast.success('Session ended')
    } catch (err) {
      const e = err as ApiError
      toast.error(e?.message ?? 'Failed to end session')
    }
  }, [session, hasEnded])

  const retry = useCallback(() => {
    setError(null)
    setIsValidationError(false)
    setValidationRetriesLeft(DEFAULT_VALIDATION_RETRY_LIMIT)
    if (agent && !session) {
      startSession()
    }
  }, [agent, session, startSession])

  const clearError = useCallback(() => {
    setError(null)
    setIsValidationError(false)
  }, [])

  const downloadTranscript = useCallback(() => {
    publicChatApi.downloadTranscript(
      session?.session_id ?? 'export',
      messages.map((m) => ({
        message_id: m.id,
        session_id: m.session_id,
        sender: m.sender,
        content: m.content,
        timestamp: m.timestamp,
      }))
    )
    toast.success('Transcript downloaded')
  }, [messages, session?.session_id])

  useEffect(() => {
    initializeAgent(urlToken)
  }, [urlToken, initializeAgent])

  useEffect(() => {
    if (agent && !session && !isAgentLoading && !error) {
      startSession()
    }
  }, [agent, session, isAgentLoading, error, startSession])

  const value = useMemo<ChatContextValue>(
    () => ({
      agent,
      session,
      messages,
      collectedFields,
      suggestions,
      isAgentLoading,
      isSessionLoading,
      isSending,
      error,
      isValidationError,
      validationRetriesLeft,
      hasEnded,
      initializeAgent,
      startSession,
      sendMessage,
      endSession,
      retry,
      clearError,
      downloadTranscript,
    }),
    [
      agent,
      session,
      messages,
      collectedFields,
      suggestions,
      isAgentLoading,
      isSessionLoading,
      isSending,
      error,
      isValidationError,
      validationRetriesLeft,
      hasEnded,
      initializeAgent,
      startSession,
      sendMessage,
      endSession,
      retry,
      clearError,
      downloadTranscript,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
