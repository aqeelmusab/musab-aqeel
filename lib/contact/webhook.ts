import { FAVICON_96_URL, SITE_DOMAIN } from '../config'

import { CONTACT_WEBHOOK_TIMEOUT_MS } from './constants'
import type {
  ContactPayload,
  ContactWebhookDeliveryResult,
  ContactWebhookTarget,
} from './types'

type ContactWebhookPayload = Record<string, unknown>

function buildDiscordPayload(contact: ContactPayload, timestamp: string): ContactWebhookPayload {
  return {
    username: SITE_DOMAIN,
    avatar_url: FAVICON_96_URL,
    embeds: [
      {
        author: {
          name: '📬  New Project Inquiry',
        },
        description: `**${contact.name}** submitted a project inquiry.`,
        color: 0xd4ff00,
        fields: [
          { name: '👤  Name', value: `\`${contact.name}\``, inline: true },
          { name: '📧  Email', value: `\`${contact.email}\``, inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '💰  Budget', value: `\`${contact.budget}\``, inline: true },
          { name: '📁  Project Type', value: `\`${contact.projectType}\``, inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '📝  Message', value: `>>> ${contact.message}` },
        ],
        thumbnail: {
          url: FAVICON_96_URL,
        },
        footer: {
          text: `${SITE_DOMAIN}  •  Contact Form`,
          icon_url: FAVICON_96_URL,
        },
        timestamp,
      },
    ],
  }
}

function buildSlackPayload(contact: ContactPayload): ContactWebhookPayload {
  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New Project Inquiry' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${contact.name}` },
          { type: 'mrkdwn', text: `*Email:*\n${contact.email}` },
          { type: 'mrkdwn', text: `*Budget:*\n${contact.budget}` },
          { type: 'mrkdwn', text: `*Project Type:*\n${contact.projectType}` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n${contact.message}` },
      },
    ],
  }
}

function buildGenericPayload(contact: ContactPayload, timestamp: string): ContactWebhookPayload {
  return {
    ...contact,
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
