/**
 * Terms of Service API types.
 */

export interface TermsSubSection {
  title: string
  content: string
}

export interface TermsSectionData {
  id: string
  title: string
  subsections?: TermsSubSection[]
  content?: string
  isNew?: boolean
}

export interface TermsResponse {
  content: string
  effective_date: string
  version: string
  sections?: TermsSectionData[]
}

export interface AcknowledgeTermsRequest {
  userId: string
  termsId: string
}

export interface AcknowledgeTermsResponse {
  success: boolean
  message?: string
}
