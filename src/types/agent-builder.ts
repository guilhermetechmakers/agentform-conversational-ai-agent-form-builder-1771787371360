export type AgentFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'textarea'

export type PersonaTone = 'formal' | 'friendly' | 'sales-y'

export type AgentStatus = 'draft' | 'published' | 'unpublished'

export type ContextualDocType = 'rich_text' | 'pdf' | 'url' | 'faq'

export interface AgentField {
  id: string
  type: AgentFieldType
  label: string
  validation_rules?: Record<string, unknown>
  required?: boolean
  conditional_logic?: unknown
  order: number
  options?: string[]
}

export interface AgentAppearance {
  primary?: string
  background?: string
}

export interface AgentPersona {
  name?: string
  instructions?: string
  tone?: PersonaTone
}

export interface ContextualDoc {
  id: string
  type: ContextualDocType
  content?: string
  url?: string
}

export interface PublishSettings {
  url_token?: string
  expiry?: string
  password?: string
  webhook_url?: string
  webhook_headers?: Record<string, string>
}

export interface AgentBuilderState {
  name: string
  description: string
  avatar_url?: string
  appearance?: AgentAppearance
  status: AgentStatus
  fields: AgentField[]
  persona?: AgentPersona
  contextualDocs: ContextualDoc[]
  publishSettings?: PublishSettings
}
