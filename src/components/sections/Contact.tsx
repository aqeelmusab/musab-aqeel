'use client'

import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import SplitText from '@/components/ui/reveal/SplitText'
import RevealText from '@/components/ui/reveal/RevealText'
import MagneticButton from '@/components/ui/MagneticButton'
import {
  CONTACT_BUDGET_PLACEHOLDER_ENABLED,
  CONTACT_HONEYPOT_FIELD_NAME,
  CONTACT_PROJECT_TYPES,
  createEmptyContactSubmission,
  getBudgetOptionsForProjectType,
  type ContactApiErrorCode,
  type ContactApiResponse,
  type ContactFormStatus,
  type ContactSubmission,
} from '@/lib/contact'

const BUDGET_HELPER_ID = 'contact-budget-helper'
import CopyEmail from '@/components/ui/CopyEmail'
import { CONTACT_EMAIL_HREF } from '@/lib/config'

const GENERIC_ERROR_MESSAGE =
  'Something went wrong sending your message. Please try again.'
const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Check your connection and try again."

// Friendlier, more specific client copy per server error code. Falls back to
// the server's own message, then to a generic line, so new codes still surface.
const ERROR_COPY: Record<ContactApiErrorCode, string> = {
  invalid_content_type: GENERIC_ERROR_MESSAGE,
  invalid_json: GENERIC_ERROR_MESSAGE,
  invalid_payload: 'Please double-check the form and try again.',
  missing_fields: 'Please complete all required fields.',
  invalid_email: 'Please enter a valid email address.',
  invalid_timestamp: 'Please refresh the page and try again.',
  rate_limited: 'Too many attempts. Please wait a few minutes, then try again.',
  service_unavailable: 'The form is temporarily unavailable right now.',
  webhook_failed:
    "Your message couldn't be delivered. Please try again in a moment.",
  internal_error: 'Something went wrong on our end. Please try again.',
}

function resolveErrorMessage(
  data: ContactApiResponse | null,
  httpStatus: number,
): string {
  if (data && data.success === false) {
    return ERROR_COPY[data.code] ?? data.error ?? GENERIC_ERROR_MESSAGE
  }
  if (httpStatus === 429) return ERROR_COPY.rate_limited
  if (httpStatus >= 500) return ERROR_COPY.internal_error
  return GENERIC_ERROR_MESSAGE
}

const SelectArrow = () => (
  <span
    className="text-theme-tertiary pointer-events-none absolute inset-y-0 right-3 flex items-center"
    aria-hidden="true"
  >
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
)

export default function Contact() {
  const [status, setStatus] = useState<ContactFormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState<ContactSubmission>(() =>
    createEmptyContactSubmission(),
  )
  // Bumped when the post-send cooldown ends to remount the fields and replay
  // their fade-up. 0 = first render (pure scroll-driven reveal); >0 = a replay
  // (isolated one-shot fade-up, then hands back to the scroll-synced reveal).
  const [revealCycle, setRevealCycle] = useState(0)
  const isSubmittingRef = useRef(false)

  useEffect(() => {
    if (status !== 'sent') return
    const t = setTimeout(() => {
      setStatus('idle')
      setRevealCycle((cycle) => cycle + 1)
    }, 5000)
    return () => clearTimeout(t)
  }, [status])

  const isReplay = revealCycle > 0
  const revealTrigger = isReplay ? 'load' : 'scroll'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (isSubmittingRef.current) {
      return
    }

    isSubmittingRef.current = true
    setStatus('sending')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('sent')
        // Preserve `startedAt` so a rapid second submission isn't blocked by
        // the server-side time-trap (CONTACT_MIN_SUBMISSION_TIME_MS).
        setForm((prev) => createEmptyContactSubmission(prev.startedAt))
      } else {
        const data = (await res
          .json()
          .catch(() => null)) as ContactApiResponse | null
        setErrorMessage(resolveErrorMessage(data, res.status))
        setStatus('error')
      }
    } catch {
      setErrorMessage(NETWORK_ERROR_MESSAGE)
      setStatus('error')
    } finally {
      isSubmittingRef.current = false
    }
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleProjectTypeChange(e: ChangeEvent<HTMLSelectElement>) {
    const projectType = e.target.value
    // Reset budget so a previously selected value can't survive a project type
    // change (its options come from BUDGET_MAP[projectType]).
    setForm((prev) => ({ ...prev, projectType, budget: '' }))
  }

  const budgetOptions = getBudgetOptionsForProjectType(form.projectType)
  const isBudgetDisabled = !form.projectType

  const labelClass =
    'field-label block mb-1.5 text-xs tracking-widest font-mono'
  const inputClass =
    'bg-theme-surface-up border-theme text-theme-primary w-full rounded-xs border px-4 py-3 text-sm font-body outline-none transition-colors duration-200'

  return (
    <section id="contact" className="px-6 py-24 md:px-12 md:py-32 lg:px-24">
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Left column */}
        <div>
          <RevealText>
            <span className="section-label mb-4 block">{'// 05 Contact'}</span>
          </RevealText>

          <SplitText
            as="h2"
            className="font-display mb-8 text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl"
          >
            Start a project
          </SplitText>

          <RevealText delay={0.05}>
            <div className="border-theme-sub mb-10 border-l-2 pl-4">
              <p className="text-theme-secondary font-body text-sm leading-relaxed font-light">
                I price based on what the project is worth to your business, not
                how many hours I spend on it. Fast delivery is a feature, not a
                discount. Clients who need something shipped in days pay
                accordingly because that speed has real business value. If you
                need the cheapest option, I am not it. If you need something
                built properly, and fast, let&apos;s talk.
              </p>
            </div>
          </RevealText>

          <RevealText delay={0.1}>
            <div className="mb-6">
              <CopyEmail />
            </div>
          </RevealText>

          <RevealText delay={0.15}>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="bg-theme-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-theme-accent relative inline-flex h-1.5 w-1.5 rounded-full" />
              </span>
              <span className="text-theme-secondary font-mono text-xs">
                Available for new projects
              </span>
            </div>
            <p className="text-theme-tertiary font-mono text-xs">
              Response within 24 hours.
            </p>
          </RevealText>
        </div>

        {/* Right column - form */}
        <div>
          <form
            key={revealCycle}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            aria-busy={status === 'sending'}
          >
            <RevealText trigger={revealTrigger} delay={0.05}>
              <div className="form-field">
                <label
                  htmlFor="contact-name"
                  className={`${labelClass} text-theme-tertiary`}
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
            </RevealText>

            <RevealText trigger={revealTrigger} delay={0.1}>
              <div className="form-field">
                <label
                  htmlFor="contact-email"
                  className={`${labelClass} text-theme-tertiary`}
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
            </RevealText>

            <RevealText trigger={revealTrigger} delay={0.15}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="form-field">
                  <label
                    htmlFor="contact-project-type"
                    className={`${labelClass} text-theme-tertiary`}
                  >
                    Project Type
                  </label>
                  <div className="relative">
                    <select
                      id="contact-project-type"
                      name="projectType"
                      required
                      value={form.projectType}
                      onChange={handleProjectTypeChange}
                      className={`${inputClass} appearance-none pr-10 ${form.projectType ? 'text-theme-primary' : 'text-theme-tertiary'}`}
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      {CONTACT_PROJECT_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
                <div className="form-field">
                  <label
                    htmlFor="contact-budget"
                    className={`${labelClass} text-theme-tertiary`}
                  >
                    Budget
                  </label>
                  <div className="relative">
                    <select
                      id="contact-budget"
                      name="budget"
                      required
                      value={form.budget}
                      onChange={handleChange}
                      disabled={isBudgetDisabled}
                      aria-disabled={isBudgetDisabled}
                      aria-describedby={
                        isBudgetDisabled ? BUDGET_HELPER_ID : undefined
                      }
                      className={`${inputClass} appearance-none pr-10 transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${form.budget ? 'text-theme-primary' : 'text-theme-tertiary'}`}
                    >
                      <option value="" disabled>
                        {CONTACT_BUDGET_PLACEHOLDER_ENABLED}
                      </option>
                      {!isBudgetDisabled &&
                        budgetOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </select>
                    <SelectArrow />
                  </div>
                  {isBudgetDisabled && (
                    <p
                      id={BUDGET_HELPER_ID}
                      className="text-theme-tertiary mt-1.5 font-mono text-xs"
                    >
                      Pick a project type to unlock
                    </p>
                  )}
                </div>
              </div>
            </RevealText>

            <RevealText trigger={revealTrigger} delay={0.2}>
              <div className="form-field">
                <label
                  htmlFor="contact-message"
                  className={`${labelClass} text-theme-tertiary`}
                >
                  Project Brief
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project"
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </RevealText>

            <RevealText trigger={revealTrigger} delay={0.25}>
              <div
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', top: 'auto' }}
              >
                <label htmlFor="contact-website">Leave this field blank</label>
                <input
                  id="contact-website"
                  type="text"
                  name={CONTACT_HONEYPOT_FIELD_NAME}
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>

              <MagneticButton
                className="btn-outline mt-2 w-full"
                type="submit"
                disabled={status === 'sending' || status === 'sent'}
              >
                {status === 'sending'
                  ? 'Sending...'
                  : status === 'sent'
                    ? 'Sent ✓'
                    : 'Send message'}
              </MagneticButton>

              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="mt-4 text-center font-mono text-xs"
              >
                {status === 'sent' && (
                  <p className="text-theme-accent">
                    Message received. I&apos;ll be in touch within 24 hours.
                  </p>
                )}
              </div>
              {status === 'error' && (
                <p
                  role="alert"
                  aria-atomic="true"
                  className="text-theme-error mt-4 text-center font-mono text-xs"
                >
                  {errorMessage}{' '}
                  <a
                    href={CONTACT_EMAIL_HREF}
                    className="underline underline-offset-2 hover:no-underline"
                  >
                    Or email me directly
                  </a>
                  .
                </p>
              )}
            </RevealText>
          </form>
        </div>
      </div>
    </section>
  )
}
