import { NextResponse } from 'next/server'

import {
  CONTACT_MAX_REQUEST_BODY_BYTES,
  evaluateContactAbuse,
  getContactWebhookUrl,
  logContactFailure,
  parseContactSubmission,
  sendContactWebhook,
  type ContactApiErrorCode,
  type ContactApiErrorResponse,
  type ContactApiSuccessResponse,
} from '@/lib/contact'

function jsonSuccess() {
  return NextResponse.json<ContactApiSuccessResponse>({ success: true })
}

function jsonError(
  error: string,
  status: number,
  code: ContactApiErrorCode,
  init?: ResponseInit,
) {
  return NextResponse.json<ContactApiErrorResponse>(
    {
      success: false,
      error,
      code,
    },
    { status, ...init },
  )
}

function concatUint8Arrays(chunks: Uint8Array[], totalLength: number) {
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.byteLength
  }

  return result
}

// Stream the body and stop reading once it exceeds the byte cap. This is the
// real size guard: unlike the content-length check, it does not trust client
// headers, so missing or spoofed content-length cannot bypass it.
async function readRequestBody(request: Request) {
  try {
    if (!request.body) {
      return { success: false as const, code: 'invalid_json' as const }
    }

    const reader = request.body.getReader()
    const chunks: Uint8Array[] = []
    let receivedBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      receivedBytes += value.byteLength

      if (receivedBytes > CONTACT_MAX_REQUEST_BODY_BYTES) {
        await reader.cancel().catch(() => {})
        return { success: false as const, code: 'payload_too_large' as const }
      }

      chunks.push(value)
    }

    const body = new TextDecoder().decode(
      chunks.length === 1
        ? chunks[0]
        : concatUint8Arrays(chunks, receivedBytes),
    )

    return { success: true as const, data: JSON.parse(body) }
  } catch {
    return { success: false as const, code: 'invalid_json' as const }
  }
}

function handleMissingWebhookConfiguration() {
  if (process.env.NODE_ENV === 'development') {
    console.warn('CONTACT_WEBHOOK_URL not configured')
    return jsonSuccess()
  }

  console.error('CONTACT_WEBHOOK_URL not configured for contact form delivery')
  logContactFailure({
    reason: 'missing_webhook_config',
    code: 'service_unavailable',
    httpStatus: 503,
  })
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

// Cheap fast-path: reject obviously oversized payloads before reading the
// body. A missing or unparseable content-length falls through to the
// stream-based guard in readRequestBody(), which is the real protection.
function exceedsMaxBodySize(request: Request): boolean {
  const contentLength = request.headers.get('content-length')
  if (contentLength === null) return false

  const declaredBytes = Number(contentLength)
  if (!Number.isFinite(declaredBytes)) return false

  return declaredBytes > CONTACT_MAX_REQUEST_BODY_BYTES
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

    if (exceedsMaxBodySize(request)) {
      return jsonError('Request body is too large.', 413, 'payload_too_large')
    }

    const rawBody = await readRequestBody(request)

    if (!rawBody.success) {
      if (rawBody.code === 'payload_too_large') {
        return jsonError('Request body is too large.', 413, 'payload_too_large')
      }

      return jsonError('Invalid JSON body.', 400, 'invalid_json')
    }

    const parsedSubmission = parseContactSubmission(rawBody.data)
    if (!parsedSubmission.success) {
      return jsonError(
        parsedSubmission.error,
        parsedSubmission.status,
        parsedSubmission.code,
      )
    }

    const abuseCheck = await evaluateContactAbuse({
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
        logContactFailure({
          reason: 'rate_limited',
          code: abuseCheck.code,
          httpStatus: abuseCheck.status,
          email: parsedSubmission.data.payload.email,
          ipAddress: abuseCheck.ipAddress,
        })
        return jsonError(abuseCheck.error, abuseCheck.status, abuseCheck.code, {
          headers: {
            'Retry-After': String(abuseCheck.retryAfterSeconds),
          },
        })
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
    logContactFailure({
      reason: 'internal_error',
      code: 'internal_error',
      httpStatus: 500,
      ...(error instanceof Error ? { errorName: error.name } : {}),
    })
    return jsonError('Internal error.', 500, 'internal_error')
  }
}
