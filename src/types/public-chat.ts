export type SessionStatus = 'live' | 'completed'

export type MessageSender = 'user' | 'agent'

export interface PublicChatMessage {
  message_id: string
  session_id: string
  sender: MessageSender
  content: string
  timestamp: string
}

export interface PublicAgentField {
  id?: string
  type: string
  label: string
  validation_rules?: Record<string, unknown>
  order: number
  required?: boolean
  options?: string[]
}

export interface PublicAgent {
  agent_id: string
  name: string
  avatar_url?: string
  description?: string
  fields_required: PublicAgentField[]
  persona?: {
    name?: string
    instructions?: string
    tone?: string
  }
}

export interface PublicSession {
  session_id: string
  agent_id: string
  status: SessionStatus
  transcript?: PublicChatMessage[]
  created_at: string
  updated_at: string
}

export interface CollectedField {
  fieldId: string
  label: string
  value: string
}

export interface SendMessageRequest {
  session_id: string
  message: string
}

export interface SendMessageResponse {
  messages: Array<{
    sender: 'agent'
    content: string
    timestamp: string
  }>
  collected_fields?: CollectedField[]
}
