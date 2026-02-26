'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  section: string
  onClose: () => void
}

export default function WaitlistModal({ section, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit() {
    if (!email || !email.includes('@')) {
      inputRef.current?.focus()
      if (inputRef.current) {
        inputRef.current.style.borderColor = 'var(--acc)'
        setTimeout(() => { if (inputRef.current) inputRef.current.style.borderColor = '' }, 1200)
      }
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, section }),
      })
      if (res.ok) {
        setStatus('done')
        setTimeout(onClose, 3500)
      } else throw new Error('failed')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="wl-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="wl-box">
        <button className="wl-close" onClick={onClose}>✕</button>

        {status === 'done' ? (
          <div className="wl-success show">
            <div className="s-icon">🌿</div>
            <div className="s-head">You&apos;re on the list.</div>
            <p className="s-sub">We&apos;ll reach out the moment <strong>{section}</strong> is ready. Until then — the park is open.</p>
          </div>
        ) : (
          <>
            <div className="wl-tag">We are building</div>
            <div className="wl-section">{section}</div>
            <div className="wl-heading">Thanks for your interest.<br /><em>We&apos;re building this<br />as you read this.</em></div>
            <p className="wl-body">Join the waitlist and we&apos;ll let you know the moment this section opens. No spam. One email when it&apos;s ready.</p>
            <div className="wl-form">
              <input
                ref={inputRef}
                className="wl-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              <button
                className="wl-submit"
                onClick={submit}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : status === 'error' ? 'Something went wrong — try again' : 'Join the Waitlist →'}
              </button>
            </div>
            <div className="wl-note">No spam. No selling your email. Ever.</div>
          </>
        )}
      </div>
    </div>
  )
}
