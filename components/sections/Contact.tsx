'use client'

import { useState, useEffect } from 'react'
import SplitText from '@/components/ui/SplitText'
import RevealText from '@/components/ui/RevealText'
import MagneticButton from '@/components/ui/MagneticButton'

const BUDGET_OPTIONS = [
  'Under $1k',
  '$1k–$5k',
  '$5k–$15k',
  '$15k+',
  "Let's discuss",
]

const PROJECT_TYPES = [
  'Full Stack Build',
  'Landing Page',
  'Design System',
  'Consultation',
  'Other',
]

const SelectArrow = () => (
  <span
    className="absolute inset-y-0 right-3 flex items-center pointer-events-none"
    style={{ color: 'var(--color-text-tertiary)' }}
    aria-hidden="true"
  >
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({
    name: '',
    email: '',
    budget: '',
    projectType: '',
    message: '',
  })

  useEffect(() => {
    if (status !== 'sent') return
    const t = setTimeout(() => setStatus('idle'), 5000)
    return () => clearTimeout(t)
  }, [status])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus('sent')
        setForm({ name: '', email: '', budget: '', projectType: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const inputStyle = {
    backgroundColor: 'var(--color-surface-up)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  const labelClass = 'block mb-1.5 text-xs uppercase tracking-widest font-mono'
  const labelStyle = { color: 'var(--color-text-tertiary)' }
  const inputClass = 'w-full pl-4 pr-4 py-3 text-sm rounded-[2px] outline-none transition-colors duration-200 font-body'

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Left column */}
        <div>
          <RevealText>
            <span className="section-label block mb-4">
              {'// 05 Contact'}
            </span>
          </RevealText>

          <SplitText
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-8 font-display"
          >
            Start a project
          </SplitText>

          <RevealText delay={0.05}>
            <div
              className="mb-10 pl-4"
              style={{ borderLeft: '2px solid var(--color-border-sub)' }}
            >
              <p
                className="text-sm leading-relaxed font-body"
                style={{
                  fontWeight: 300,
                  color: 'var(--color-text-secondary)',
                }}
              >
                I price based on what the project is worth to your business, not how many hours I spend on it.
                Fast delivery is a feature, not a discount. Clients who need something shipped in days
                pay accordingly because that speed has real business value.
                If you need the cheapest option, I am not it. If you need something built properly, and fast, let&apos;s talk.
              </p>
            </div>
          </RevealText>

          <RevealText delay={0.1}>
            <a
              href="mailto:hello@musabaqeel.com"
              className="inline-block text-lg font-medium mb-6 relative group font-body"
            >
              hello@musabaqeel.com
              <span
                className="absolute bottom-0 left-0 w-full h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                style={{ backgroundColor: 'var(--color-text-primary)', transitionTimingFunction: 'var(--ease-out)' }}
              />
            </a>
          </RevealText>

          <RevealText delay={0.15}>
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              </span>
              <span
                className="text-xs font-mono"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Available for new projects
              </span>
            </div>
            <p
              className="text-xs font-mono"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Response within 24 hours.
            </p>
          </RevealText>
        </div>

        {/* Right column — form */}
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <RevealText delay={0.05}>
              <div className="form-field">
                <label className={labelClass} style={labelStyle}>Name</label>
                <input
                  type="text" name="name" required value={form.name} onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </RevealText>

            <RevealText delay={0.1}>
              <div className="form-field">
                <label className={labelClass} style={labelStyle}>Email</label>
                <input
                  type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="your@email.com"
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </RevealText>

            <RevealText delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="form-field">
                  <label className={labelClass} style={labelStyle}>Budget</label>
                  <div className="relative">
                    <select
                      name="budget" required value={form.budget} onChange={handleChange}
                      className={`${inputClass} pr-10 appearance-none`}
                      style={{ ...inputStyle, color: form.budget ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                    >
                      <option value="" disabled>Select range</option>
                      {BUDGET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
                <div className="form-field">
                  <label className={labelClass} style={labelStyle}>Project type</label>
                  <div className="relative">
                    <select
                      name="projectType" required value={form.projectType} onChange={handleChange}
                      className={`${inputClass} pr-10 appearance-none`}
                      style={{ ...inputStyle, color: form.projectType ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                    >
                      <option value="" disabled>Select type</option>
                      {PROJECT_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <SelectArrow />
                  </div>
                </div>
              </div>
            </RevealText>

            <RevealText delay={0.2}>
              <div className="form-field">
                <label className={labelClass} style={labelStyle}>Project brief</label>
                <textarea
                  name="message" required value={form.message} onChange={handleChange}
                  placeholder="Tell me about your project" rows={4}
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                />
              </div>
            </RevealText>

            <RevealText delay={0.25}>
              <MagneticButton className="btn-outline w-full mt-2" type="submit">
                {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent ✓' : 'Send message'}
              </MagneticButton>

              {status === 'sent' && (
                <p className="text-xs text-center mt-4 font-mono" style={{ color: 'var(--color-accent)' }}>
                  Message received. I will be in touch within 24 hours.
                </p>
              )}
              {status === 'error' && (
                <p className="text-xs text-center mt-4 font-mono" style={{ color: 'var(--color-error)' }}>
                  Something went wrong. Try emailing me directly.
                </p>
              )}
            </RevealText>
          </form>
        </div>
      </div>
    </section>
  )
}
