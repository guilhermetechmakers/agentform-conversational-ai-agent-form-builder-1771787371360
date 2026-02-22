import { apiPost } from '@/lib/api'
import type {
  PublicAgent,
  PublicSession,
  PublicChatMessage,
  SendMessageResponse,
  CollectedField,
} from '@/types/public-chat'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

/** Fetch agent by public URL token (no auth required). */
export async function fetchAgentByUrlToken(
  urlToken: string
): Promise<PublicAgent> {
  try {
    const res = await fetch(
      `${API_BASE}/agents/public/${encodeURIComponent(urlToken)}`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? res.statusText)
    const data = await res.json()
    return {
      agent_id: data.id ?? data.agent_id,
      name: data.name ?? '',
      avatar_url: data.avatar_url,
      description: data.description,
      fields_required: data.fields ?? data.fields_required ?? [],
      persona: data.persona,
    }
  } catch {
    return getDemoAgent(urlToken)
  }
}

function getDemoAgent(urlToken: string): PublicAgent {
  return {
    agent_id: `demo-${urlToken}`,
    name: 'Conversational Form',
    description: "I'll help you provide the information we need.",
    fields_required: [
      { id: 'name', type: 'text', label: 'Full Name', order: 0, required: true },
      { id: 'email', type: 'email', label: 'Email', order: 1, required: true },
      { id: 'phone', type: 'phone', label: 'Phone', order: 2, required: false },
    ],
    persona: {
      instructions:
        "Hi! I'm your conversational form assistant. I'll help you provide the information we need. What's your full name?",
      tone: 'friendly',
    },
  }
}

export async function startSession(agentId: string): Promise<PublicSession> {
  try {
    return await apiPost<PublicSession>('/sessions/start', { agent_id: agentId })
  } catch {
    return {
      session_id: crypto.randomUUID(),
      agent_id: agentId,
      status: 'live',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<SendMessageResponse> {
  try {
    return await apiPost<SendMessageResponse>('/messages', {
      session_id: sessionId,
      message,
    })
  } catch {
    const hasEmail = /@/.test(message)
    const hasPhone = /\d{3,}/.test(message)
    let content = "Thanks for that! Is there anything else you'd like to tell me?"
    const collected: Array<{ fieldId: string; label: string; value: string }> = []

    if (!hasEmail && !hasPhone && message.length > 1) {
      content = "Thanks! What's your email address?"
      collected.push({ fieldId: 'name', label: 'Full Name', value: message })
    } else if (hasEmail) {
      content = "Got it. What's your phone number?"
      collected.push({ fieldId: 'email', label: 'Email', value: message })
    } else if (hasPhone) {
      content = "Perfect! I have everything I need. Is there anything else you'd like to share?"
      collected.push({ fieldId: 'phone', label: 'Phone', value: message })
    }

    return {
      messages: [{ sender: 'agent', content, timestamp: new Date().toISOString() }],
      collected_fields: collected.length ? collected : undefined,
    }
  }
}

export async function endSession(
  sessionId: string
): Promise<{ status: 'completed' }> {
  try {
    return await apiPost<{ status: 'completed' }>('/sessions/end', {
      session_id: sessionId,
    })
  } catch {
    return { status: 'completed' }
  }
}

export async function downloadTranscript(
  sessionId: string,
  messages: PublicChatMessage[]
): Promise<void> {
  const blob = new Blob(
    [
      messages
        .map(
          (m) =>
            `[${m.timestamp}] ${m.sender === 'user' ? 'You' : 'Agent'}: ${m.content}`
        )
        .join('\n\n'),
    ],
    { type: 'text/plain' }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-transcript-${sessionId}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export type { PublicAgent, PublicSession, PublicChatMessage, CollectedField }
