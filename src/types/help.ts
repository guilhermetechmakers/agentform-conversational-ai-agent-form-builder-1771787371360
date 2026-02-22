export interface KnowledgeBaseArticle {
  id: number
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface KnowledgeBaseResponse {
  articles: KnowledgeBaseArticle[]
  total: number
  page: number
  per_page: number
}

export interface FAQ {
  id: number
  question: string
  answer: string
  related_links: string[]
  created_at: string
}

export interface SupportTicketPayload {
  name: string
  email: string
  subject: string
  message: string
  attachment?: string
}

export interface SupportTicketResponse {
  id: number
  message: string
}

export interface ChangelogEntry {
  id: number
  title: string
  description: string
  status: 'New' | 'Updated'
  release_date: string
}

export interface GettingStartedStep {
  id: string
  title: string
  description: string
  completed: boolean
  icon: string
}
