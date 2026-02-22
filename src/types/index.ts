export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  timezone?: string
  role: string
  preferences?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface AgentField {
  id: string
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea'
  label: string
  validations?: Record<string, unknown>
  required?: boolean
  conditionalRules?: unknown
  order: number
  options?: string[]
}

export interface AgentAppearance {
  colors?: {
    primary?: string
    background?: string
  }
}

export interface AgentPersona {
  instructions?: string
  tonePreset?: string
}

export interface Agent {
  id: string
  ownerId: string
  name: string
  description?: string
  avatarUrl?: string
  appearance?: AgentAppearance
  persona?: AgentPersona
  fields: AgentField[]
  contextualDocs?: Array<{ type: string; url?: string; contentHash?: string }>
  webhookConfig?: { url?: string; headers?: Record<string, string> }
  publishedFlag?: boolean
  publicLinkConfig?: {
    publicId?: string
    password?: string
    expiry?: string
  }
  retentionPolicy?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  versions?: unknown
}

export interface SessionMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface Session {
  id: string
  agentId: string
  status: 'active' | 'completed' | 'abandoned'
  transcript?: SessionMessage[]
  parsedFields?: Record<string, unknown>
  visitorMetadata?: {
    ip?: string
    ua?: string
    referrer?: string
    utm?: Record<string, string>
  }
  attachments?: string[]
  createdAt: string
  completedAt?: string
  webhookDeliveryStatus?: string
}
