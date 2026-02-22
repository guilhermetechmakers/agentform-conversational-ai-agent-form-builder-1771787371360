/**
 * LLM Orchestration & Conversation Engine types
 * Aligns with API: POST /api/sessions, GET /api/sessions/:sessionId/messages, POST /api/sessions/:sessionId/message
 */

export type SessionStatus = 'active' | 'completed' | 'abandoned'

export interface CreateSessionRequest {
  agentId: string
}

export interface CreateSessionResponse {
  sessionId: string
  status: SessionStatus
}

export interface SessionMessage {
  message_id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface GetSessionMessagesResponse {
  messages: SessionMessage[]
}

export interface SendMessageRequest {
  content: string
}

export interface SendMessageResponse {
  status: 'success'
  nextPrompt?: string
  /** Extracted field data from the message */
  collected_fields?: Array<{ fieldId: string; label: string; value: string }>
  /** Agent response messages to display */
  messages?: Array<{ sender: 'agent'; content: string; timestamp: string }>
}

/** Session state machine step based on required fields */
export interface SessionStep {
  fieldId: string
  label: string
  required: boolean
  order: number
  validationRetries?: number
}

/** LLM provider configuration (for backend adapter layer) */
export type LLMProvider = 'openai' | 'anthropic' | 'custom'

export interface LLMProviderConfig {
  provider: LLMProvider
  model?: string
  rateLimit?: number
}
