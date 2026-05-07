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
  CONTACT_BUDGET_OPTIONS,
  CONTACT_HONEYPOT_FIELD_NAME,
  CONTACT_PROJECT_TYPES,
  createEmptyContactSubmission,
  type ContactApiResponse,
  type ContactFormStatus,
  type ContactSubmission,
} from '@/lib/contact'
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF } from '@/lib/config'

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
  const isSubmittingRef = useRef(false)

  useEffect(() => {
    if (status !== 'sent') return
    const t = setTimeout(() => setStatus('idle'), 5000)
    return () => clearTimeout(t)
  }, [status])

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
        setForm(createEmptyContactSubmission())
      } else {
        const data = (await res
          .json()
          .catch(() => null)) as ContactApiResponse | null
        setErrorMessage(
          data && !data.success && typeof data.error === 'string'
            ? data.error
            : 'Something went wrong. Try emailing me directly.',
        )
        setStatus('error')
      }
    } catch {
      setErrorMessage('Something went wrong. Try emailing me directly.')
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

  const labelClass = 'block mb-1.5 text-xs tracking-widest font-mono'
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
            <a
              href={CONTACT_EMAIL_HREF}
              className="group font-body relative mb-6 inline-block text-lg font-medium"
            >
              {CONTACT_EMAIL}
              <span
                className="bg-theme-primary absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{
                  transitionTimingFunction: 'var(--ease-out)',
                }}
              />
            </a>
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
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            aria-busy={status === 'sending'}
          >
            <RevealText delay={0.05}>
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
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
            </RevealText>

            <RevealText delay={0.1}>
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
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
            </RevealText>

            <RevealText delay={0.15}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                      className={`${inputClass} appearance-none pr-10 ${form.budget ? 'text-theme-primary' : 'text-theme-tertiary'}`}
                    >
                      <option value="" disabled>
                        Select range
                      </option>
                      {CONTACT_BUDGET_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
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
                      onChange={handleChange}
                      className={`${inputClass} appearance-none pr-10 ${form.projectType ? 'text-theme-primary' : 'text-theme-tertiary'}`}
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      {CONTACT_PROJECT_TYPES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
              </div>
            </RevealText>

            <RevealText delay={0.2}>
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

            <RevealText delay={0.25}>
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
                disabled={status === 'sending'}
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
                    Message received. I will be in touch within 24 hours.
                  </p>
                )}
                {status === 'error' && (
                  <p className="text-theme-error">{errorMessage}</p>
                )}
              </div>
            </RevealText>
          </form>
        </div>
      </div>
    </section>
  )
}
