import { NextResponse } from 'next/server'

import {
  evaluateContactAbuse,
  getContactWebhookUrl,
  parseContactSubmission,
  sendContactWebhook,
  type ContactApiErrorCode,
  type ContactApiErrorResponse,
  type ContactApiSuccessResponse,
} from '@/lib/contact'

function jsonSuccess() {
  return NextResponse.json<ContactApiSuccessResponse>({ success: true })
}

function jsonError(error: string, status: number, code: ContactApiErrorCode) {
  return NextResponse.json<ContactApiErrorResponse>(
    {
      success: false,
      error,
      code,
    },
    { status },
  )
}

async function readRequestBody(request: Request) {
  try {
    return { success: true as const, data: await request.json() }
  } catch {
    return { success: false as const }
  }
}

function handleMissingWebhookConfiguration() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('CONTACT_WEBHOOK_URL not configured')
    return jsonSuccess()
  }

  console.error('CONTACT_WEBHOOK_URL not configured for contact form delivery')
  return jsonError(
    'Contact form is temporarily unavailable. Please email me directly.',
    503,
    'service_unavailable',
  )
}

function hasJsonContentType(request: Request): boolean {
  const contentType = request.headers.get('content-type')
  return contentType?.toLowerCase().includes('application/json') ?? false
}

export async function POST(request: Request) {
  try {
    if (!hasJsonContentType(request)) {
      return jsonError(
        'Contact form expects application/json.',
        415,
        'invalid_content_type',
      )
    }

    const rawBody = await readRequestBody(request)
    if (!rawBody.success) {
      return jsonError('Invalid JSON body.', 400, 'invalid_json')
    }

    const parsedSubmission = parseContactSubmission(rawBody.data)
    if (!parsedSubmission.success) {
      return jsonError(parsedSubmission.error, parsedSubmission.status, parsedSubmission.code)
    }

    const abuseCheck = evaluateContactAbuse({
      headers: request.headers,
      honeypotValue: parsedSubmission.data.metadata.honeypotValue,
      startedAt: parsedSubmission.data.metadata.startedAt,
      fallbackIdentifier: parsedSubmission.data.payload.email,
    })

    switch (abuseCheck.kind) {
      case 'allow':
        break
      case 'silently_reject':
        return jsonSuccess()
      case 'reject':
        return jsonError(abuseCheck.error, abuseCheck.status, abuseCheck.code)
      default: {
        const exhaustiveCheck: never = abuseCheck
        return exhaustiveCheck
      }
    }

    const webhookUrl = getContactWebhookUrl()
    if (!webhookUrl) {
      return handleMissingWebhookConfiguration()
    }

    const delivery = await sendContactWebhook({
      contact: parsedSubmission.data.payload,
      webhookUrl,
    })

    if (!delivery.success) {
      return jsonError(delivery.error, delivery.status, delivery.code)
    }

    return jsonSuccess()
  } catch (error) {
    console.error('Contact route error:', error)
    return jsonError('Internal error.', 500, 'internal_error')
  }
}