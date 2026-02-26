'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const ROLES = [
  'Account Executive',
  'SDR / BDR',
  'Sales Manager',
  'VP of Sales',
  'Founder / Selling Yourself',
  'Customer Success',
  'Revenue Operations',
  'Other',
]

const YEARS = ['1–3 years', '3–7 years', '7–12 years', '12+ years']

interface Props {
  onClose: () => void
  onPosted: () => void
}

export default function DropForm({ onClose, onPosted }: Props) {
  const [content, setContent] = useState('')
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [years, setYears] = useState('')
  const [industry, setIndustry] = useState('')
  const [showMagic, setShowMagic] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'posting' | 'done' | 'magic-sent'>('idle')

  const MAX = 800
  const remaining = MAX - content.length
  const finalRole = role === 'Other' ? customRole : role

  async function postDrop(userId?: string) {
    const { error } = await supabase.from('drops').insert({
      content,
      role: finalRole || null,
      years_in_sales: years || null,
      industry: industry || null,
      user_id: userId || null,
    })
    if (error) throw error
  }

  async function submitAnonymously() {
    if (!content.trim()) return
    setStatus('posting')
    try {
      await postDrop()
      setStatus('done')
      setTimeout(() => { onPosted(); onClose() }, 1500)
    } catch {
      setStatus('idle')
    }
  }

  async function submitWithMagicLink() {
    if (!content.trim()) return
    if (!showMagic) { setShowMagic(true); return }
    if (!magicEmail || !magicEmail.includes('@')) return

    setStatus('posting')
    try {
      // Post drop anonymously first — story goes live either way
      await postDrop()
      // Then send magic link
      await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: { emailRedirectTo: `${window.location.origin}/bench` },
      })
      setStatus('magic-sent')
    } catch {
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div className="drop-form-overlay open">
        <div className="drop-form-inner" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌿</div>
          <div className="drop-form-title">Your story is on the bench.</div>
          <p style={{ color: 'var(--ink-muted)', marginTop: '0.5rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem' }}>
            Someone out there needed to read that.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'magic-sent') {
    return (
      <div className="drop-form-overlay open">
        <div className="drop-form-inner" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔑</div>
          <div className="drop-form-title">Check your email.</div>
          <p style={{ color: 'var(--ink-muted)', marginTop: '0.5rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', maxWidth: '340px', margin: '0.5rem auto 0' }}>
            Your story is live on the bench. We sent a magic link to <strong>{magicEmail}</strong> — click it to save this to Your Space.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="drop-form-overlay open">
      <div className="drop-form-inner">
        <div className="drop-form-header">
          <div className="drop-form-title">Drop your story</div>
          <button className="wl-close" onClick={onClose} style={{ position: 'static' }}>✕</button>
        </div>

        {/* Main textarea */}
        <textarea
          className="drop-textarea"
          placeholder="What happened? Say it here. Nobody knows it's you."
          value={content}
          onChange={e => setContent(e.target.value.slice(0, MAX))}
          autoFocus
        />
        <div className={`char-count${remaining < 80 ? ' warn' : ''}`}>{remaining} characters left</div>

        {/* Fields */}
        <div className="drop-fields">
          <div className="drop-field">
            <label className="drop-label">Your Role</label>
            <select className="drop-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="">Select role</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {role === 'Other' && (
            <div className="drop-field">
              <label className="drop-label">Your Role (type it)</label>
              <input
                className="drop-input"
                placeholder="e.g. Insurance Advisor"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
              />
            </div>
          )}

          <div className="drop-field">
            <label className="drop-label">Years in Sales</label>
            <select className="drop-select" value={years} onChange={e => setYears(e.target.value)}>
              <option value="">Select</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="drop-field">
            <label className="drop-label">Industry</label>
            <input
              className="drop-input"
              placeholder="SaaS, Real Estate, Insurance..."
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            />
          </div>
        </div>

        {/* Magic link panel */}
        {showMagic && (
          <div className="magic-panel">
            <div className="magic-panel-title">🌳 Your Space saves this story</div>
            <p className="magic-panel-sub">
              Drop your email — we&apos;ll send a magic link. One click and this story is saved to your private career record.
            </p>
            <input
              className="wl-input"
              type="email"
              placeholder="your@email.com"
              value={magicEmail}
              onChange={e => setMagicEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitWithMagicLink()}
            />
            <div className="magic-note">Your story posts either way. The magic link is a bonus, not a gate.</div>
          </div>
        )}

        {/* Action buttons */}
        <div className="drop-buttons">
          <button
            className="btn btn-ghost"
            onClick={submitAnonymously}
            disabled={!content.trim() || status === 'posting'}
          >
            {status === 'posting' ? 'Posting...' : 'Submit Anonymously'}
          </button>
          <button
            className="btn btn-orange"
            onClick={submitWithMagicLink}
            disabled={!content.trim() || status === 'posting'}
          >
            {showMagic ? 'Save & Post →' : 'Save to Your Space →'}
          </button>
        </div>
      </div>
    </div>
  )
}
