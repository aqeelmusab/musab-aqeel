export interface ContactPayload {
  name: string
  email: string
  budget: string
  projectType: string
  message: string
}

export interface ContactSubmission extends ContactPayload {
  website: string
  startedAt: number
}

export interface ParsedContactSubmission {
  payload: ContactPayload
  metadata: {
    honeypotValue: string
    startedAt: number
  }
}

export type ContactFormStatus = 'idle' | 'sending' | 'sent' | 'error'

export type ContactApiErrorCode =
  | 'invalid_content_type'
  | 'invalid_json'
  | 'invalid_payload'
  | 'missing_fields'
  | 'invalid_email'
  | 'invalid_timestamp'
  | 'rate_limited'
  | 'service_unavailable'
  | 'webhook_failed'
  | 'internal_error'

export interface ContactApiSuccessResponse {
  success: true
}

export interface ContactApiErrorResponse {
  success: false
  error: string
  code: ContactApiErrorCode
}

export type ContactApiResponse =
  | ContactApiSuccessResponse
  | ContactApiErrorResponse

export type ContactWebhookTarget = 'discord' | 'slack' | 'generic'

export type ContactAbuseCheckResult =
  | {
      kind: 'allow'
      ipAddress: string | null
    }
  | {
      kind: 'silently_reject'
      reason: 'honeypot' | 'submitted_too_fast'
      ipAddress: string | null
    }
  | {
      kind: 'reject'
      status: 429
      error: string
      code: 'rate_limited'
      ipAddress: string | null
    }

export type ContactWebhookDeliveryResult =
  | {
      success: true
    }
  | {
      success: false
      status: 502
      error: string
      code: 'webhook_failed'
    }
