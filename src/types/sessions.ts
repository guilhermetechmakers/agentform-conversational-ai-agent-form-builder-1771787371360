export type SessionStatus = 'completed' | 'incomplete' | 'in-progress'

export interface SessionListItem {
  id: string
  agent_id: string
  agent_name: string
  visitor_identifier: string | null
  status: SessionStatus
  created_at: string
  extracted_fields_summary: Record<string, string>
  tags?: string[]
}

export interface SessionsListResponse {
  sessions: SessionListItem[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

export type SessionSortField =
  | 'id'
  | 'agent_name'
  | 'visitor_identifier'
  | 'status'
  | 'created_at'
  | 'extracted_fields'

export type SessionSortOrder = 'asc' | 'desc'

export interface SessionsListParams {
  search?: string
  agent_id?: string
  status?: SessionStatus
  tag?: string
  date_from?: string
  date_to?: string
  field_name?: string
  field_value?: string
  sort?: SessionSortField
  order?: SessionSortOrder
  page?: number
  page_size?: number
}

export interface TranscriptMessage {
  message_id: string
  sender: 'user' | 'agent'
  content: string
  timestamp: string
}

export interface ExtractedField {
  id: string
  field_name: string
  field_value: string
}

export interface SessionMetadata {
  ip?: string
  user_agent?: string
  referrer?: string
}

export interface SessionComment {
  id: string
  comment_text: string
  created_by: string
  created_at: string
}

export interface SessionDetailResponse {
  id: string
  agent_id: string
  agent_name: string
  visitor_identifier: string | null
  status: SessionStatus
  created_at: string
  updated_at: string
  transcript: TranscriptMessage[]
  extracted_fields: ExtractedField[]
  metadata: SessionMetadata
  tags: string[]
  comments: SessionComment[]
  reviewed?: boolean
}

export interface SessionExportResponse {
  download_url: string
}

export type BulkActionType = 'export' | 'delete'

export interface BulkActionRequest {
  session_ids: string[]
  action: BulkActionType
}
