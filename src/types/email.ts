/** Email event types for logging and filtering */
export type EmailEventType =
  | 'signup'
  | 'reset'
  | 'session_completed'
  | 'webhook_failure'
  | 'billing_alert'

/** Email delivery status */
export type EmailStatus = 'sent' | 'delivered' | 'bounced' | 'failed'

/** Request payload for sending an email */
export interface SendEmailRequest {
  userId: string
  templateName: string
  variables?: Record<string, string>
}

/** Response from send email endpoint */
export interface SendEmailResponse {
  status: 'success'
  messageId: string
}

/** Response from email status endpoint */
export interface EmailStatusResponse {
  status: 'delivered' | 'bounced'
  timestamp: string
}

/** Email event for display in UI */
export interface EmailEvent {
  id: string
  user_id: string
  event_type: EmailEventType
  status: EmailStatus
  timestamp: string
  subject?: string
  session_id?: string
  message_id?: string
}
