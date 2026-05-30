import { SITE_DOMAIN, SITE_URL } from '../config'
import { APP_VERSION } from '../package-version'

const CONTACT_FAVICON_URL = `${SITE_URL}/favicons/favicon-96x96.png?v=${APP_VERSION}`

import {
  CONTACT_WEBHOOK_TIMEOUT_MS,
  getBudgetLabel,
  getProjectTypeLabel,
} from './constants'
import type {
  ContactPayload,
  ContactWebhookDeliveryResult,
  ContactWebhookTarget,
} from './types'

type ContactWebhookPayload = Record<string, unknown>

// Provider-side hard limits. Discord caps each embed field value at 1024 chars
// and the embed description at 4096; Slack caps a section text object at 3000.
// Our message field allows far more than a Discord field can hold, so the
// message goes in the description (Discord) or is split across sections (Slack).
const DISCORD_FIELD_VALUE_LIMIT = 1024
const DISCORD_DESCRIPTION_LIMIT = 4096
const SLACK_TEXT_LIMIT = 3000

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 3))}...`
}

// Neutralize backticks so a value can't break out of an inline-code span or
// fenced block in Discord markdown.
function sanitizeDiscord(text: string): string {
  return text.replace(/`/g, "'")
}

// Slack mrkdwn requires &, <, > to be HTML-escaped; this also defuses
// control-sequence mentions like <!channel>.
function escapeSlack(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function chunkText(text: string, size: number): string[] {
  if (text.length <= size) {
    return [text]
  }

  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

// Resolves slug-shaped fields to their human-readable labels for rendering.
// Falls back to the raw slug if the lookup misses (e.g. a replayed payload
// that bypassed validation), so we never silently drop data.
function humanize(contact: ContactPayload): ContactPayload {
  return {
    ...contact,
    projectType:
      getProjectTypeLabel(contact.projectType) ?? contact.projectType,
    budget:
      getBudgetLabel(contact.projectType, contact.budget) ?? contact.budget,
  }
}

function buildDiscordPayload(
  contact: ContactPayload,
  timestamp: string,
): ContactWebhookPayload {
  const display = humanize(contact)
  const code = (value: string) =>
    `\`${truncate(sanitizeDiscord(value), DISCORD_FIELD_VALUE_LIMIT - 2)}\``
  const intro = `**${sanitizeDiscord(display.name)}** submitted a project inquiry.`
  const body = `>>> ${sanitizeDiscord(display.message)}`
  return {
    username: SITE_DOMAIN,
    avatar_url: CONTACT_FAVICON_URL,
    // Embed mentions never ping, but this guarantees no accidental pings even
    // if the payload shape changes later.
    allowed_mentions: { parse: [] },
    embeds: [
      {
        author: {
          name: '📬  New Project Inquiry',
        },
        // The message lives here (4096-char budget) rather than in a field
        // (1024-char cap), so long briefs deliver instead of 400-ing.
        description: truncate(`${intro}\n\n${body}`, DISCORD_DESCRIPTION_LIMIT),
        color: 0xd4ff00,
        fields: [
          { name: '👤  Name', value: code(display.name), inline: true },
          { name: '📧  Email', value: code(display.email), inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '💰  Budget', value: code(display.budget), inline: true },
          {
            name: '📁  Project Type',
            value: code(display.projectType),
            inline: true,
          },
          { name: '\u200b', value: '\u200b', inline: true },
        ],
        thumbnail: {
          url: CONTACT_FAVICON_URL,
        },
        footer: {
          text: `${SITE_DOMAIN}  •  Contact Form`,
          icon_url: CONTACT_FAVICON_URL,
        },
        timestamp,
      },
    ],
  }
}

function buildSlackPayload(contact: ContactPayload): ContactWebhookPayload {
  const display = humanize(contact)
  // Split the message across as many sections as needed; a single section text
  // object is capped at 3000 chars, which a long brief can exceed.
  const messageBlocks = chunkText(
    escapeSlack(display.message),
    SLACK_TEXT_LIMIT,
  ).map((chunk) => ({
    type: 'section',
    text: { type: 'mrkdwn', text: chunk },
  }))
  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Project Inquiry' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${escapeSlack(display.name)}` },
          { type: 'mrkdwn', text: `*Email:*\n${escapeSlack(display.email)}` },
          { type: 'mrkdwn', text: `*Budget:*\n${escapeSlack(display.budget)}` },
          {
            type: 'mrkdwn',
            text: `*Project Type:*\n${escapeSlack(display.projectType)}`,
          },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*Message:*' },
      },
      ...messageBlocks,
    ],
  }
}

function buildGenericPayload(
  contact: ContactPayload,
  timestamp: string,
): ContactWebhookPayload {
  // Generic consumers get both the raw slug payload and a `display` object
  // with resolved labels — they can pick whichever is easier to consume.
  return {
    ...contact,
    display: humanize(contact),
    source: 'contact-form',
    timestamp,
  }
}

export function resolveWebhookTarget(webhookUrl: string): ContactWebhookTarget {
  if (webhookUrl.includes('discord.com/api/webhooks')) {
    return 'discord'
  }

  if (webhookUrl.includes('hooks.slack.com')) {
    return 'slack'
  }

  return 'generic'
}

export function getContactWebhookUrl(): string | null {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL?.trim()
  return webhookUrl ? webhookUrl : null
}

export function buildContactWebhookPayload({
  contact,
  webhookUrl,
  now = new Date(),
}: {
  contact: ContactPayload
  webhookUrl: string
  now?: Date
}): ContactWebhookPayload {
  const timestamp = now.toISOString()
  const target = resolveWebhookTarget(webhookUrl)

  switch (target) {
    case 'discord':
      return buildDiscordPayload(contact, timestamp)
    case 'slack':
      return buildSlackPayload(contact)
    case 'generic':
      return buildGenericPayload(contact, timestamp)
    default: {
      const exhaustiveCheck: never = target
      return exhaustiveCheck
    }
  }
}

export async function sendContactWebhook({
  contact,
  webhookUrl,
  fetchImpl = fetch,
}: {
  contact: ContactPayload
  webhookUrl: string
  fetchImpl?: typeof fetch
}): Promise<ContactWebhookDeliveryResult> {
  const payload = buildContactWebhookPayload({
    contact,
    webhookUrl,
  })

  try {
    const webhookResponse = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(CONTACT_WEBHOOK_TIMEOUT_MS),
    })

    if (!webhookResponse.ok) {
      const details = await webhookResponse.text().catch(() => 'Unknown error')
      console.error(`Webhook failed (${webhookResponse.status}): ${details}`)

      return {
        success: false,
        status: 502,
        code: 'webhook_failed',
        error: 'Webhook delivery failed.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Webhook delivery error:', error)

    return {
      success: false,
      status: 502,
      code: 'webhook_failed',
      error: 'Webhook delivery failed.',
    }
  }
}
