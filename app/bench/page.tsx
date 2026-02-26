'use client'

import { useEffect, useState, useCallback } from 'react'
import Nav from '@/components/Nav'
import DropCard from '@/components/DropCard'
import { supabase } from '@/lib/supabase'
import { Drop } from '@/lib/types'

const PAGE_SIZE = 10
const ROLES = ['Account Executive','SDR / BDR','Sales Manager','VP of Sales','Founder / Selling Yourself','Customer Success','Revenue Operations','Other']
const YEARS = ['1–3 years','3–7 years','7–12 years','12+ years']
const MAX = 800

export default function BenchPage() {
  const [drops, setDrops] = useState<Drop[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const [composerOpen, setComposerOpen] = useState(false)
  const [content, setContent] = useState('')
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [years, setYears] = useState('')
  const [industry, setIndustry] = useState('')
  const [showMagic, setShowMagic] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')
  const [postStatus, setPostStatus] = useState<'idle'|'posting'|'done'|'magic-sent'>('idle')

  const remaining = MAX - content.length
  const finalRole = role === 'Other' ? customRole : role

  const fetchDrops = useCallback(async (reset = false) => {
    const from = reset ? 0 : page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    const { data, error } = await supabase
      .from('drops').select('*').eq('is_flagged', false)
      .order('created_at', { ascending: false }).range(from, to)
    if (error) { setLoading(false); return }
    if (reset) { setDrops(data || []); setPage(1) }
    else { setDrops(prev => [...prev, ...(data || [])]); setPage(p => p + 1) }
    setHasMore((data?.length || 0) === PAGE_SIZE)
    setLoading(false)
  }, [page])

  useEffect(() => { fetchDrops(true) }, []) // eslint-disable-line

  useEffect(() => {
    const channel = supabase.channel('drops-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'drops' }, payload => {
        const d = payload.new as Drop
        if (!d.is_flagged) setDrops(prev => [d, ...prev])
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  function openComposer() {
    setComposerOpen(true)
    setTimeout(() => document.querySelector<HTMLTextAreaElement>('.composer-textarea')?.focus(), 100)
  }

  function closeComposer() {
    setComposerOpen(false)
    setContent(''); setRole(''); setCustomRole('')
    setYears(''); setIndustry(''); setShowMagic(false)
    setMagicEmail(''); setPostStatus('idle')
  }

  async function postDrop() {
    const { error } = await supabase.from('drops').insert({
      content, role: finalRole || null,
      years_in_sales: years || null,
      industry: industry || null,
    })
    if (error) throw error
  }

  async function submitAnonymously() {
    if (!content.trim()) return
    setPostStatus('posting')
    try {
      await postDrop()
      setPostStatus('done')
      setTimeout(() => { closeComposer(); fetchDrops(true) }, 1500)
    } catch { setPostStatus('idle') }
  }

  async function submitWithSpace() {
    if (!content.trim()) return
    if (!showMagic) { setShowMagic(true); return }
    if (!magicEmail || !magicEmail.includes('@')) return
    setPostStatus('posting')
    try {
      await postDrop()
      await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: { emailRedirectTo: `${window.location.origin}/bench` },
      })
      setPostStatus('magic-sent')
      setTimeout(() => { closeComposer(); fetchDrops(true) }, 2500)
    } catch { setPostStatus('idle') }
  }

  return (
    <>
      <Nav />

      <div className="bench-page">
        <div className="bench-header">
          <div className="hero-tag" style={{ justifyContent: 'center' }}>Anonymous · Real · Unfiltered</div>
          <h1 className="bench-title">The <em>Bench</em></h1>
          <p className="bench-desc">Real stories from real salespeople. No names. No judgment.</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0', fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            Loading stories...
          </div>
        )}

        {!loading && drops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌿</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 900, color: 'var(--ink)', marginBottom: '0.4rem' }}>
              The bench is empty.
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              Be the first to drop a story. Nobody knows it&apos;s you.
            </p>
          </div>
        )}

        {drops.map(drop => <DropCard key={drop.id} drop={drop} />)}

        {hasMore && !loading && drops.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => fetchDrops(false)}>Load more stories</button>
          </div>
        )}
      </div>

      {/* ── COMPOSER BAR ── */}
      <div className={`composer-bar${composerOpen ? ' expanded' : ''}`}>
        <div className="composer-inner">

          {/* Collapsed — WhatsApp style tap to open */}
          {!composerOpen && (
            <div className="composer-collapsed" onClick={openComposer}>
              <span className="composer-collapsed-text">What happened to you in sales today?</span>
              <button className="composer-collapsed-btn">Drop it →</button>
            </div>
          )}

          {/* Expanded */}
          {composerOpen && postStatus !== 'done' && postStatus !== 'magic-sent' && (
            <div className="composer-expanded">
              <textarea
                className="composer-textarea"
                placeholder="What happened? Say it here. Nobody knows it's you."
                value={content}
                onChange={e => setContent(e.target.value.slice(0, MAX))}
              />

              <div className="composer-fields">
                <select className="composer-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="">Your role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                {role === 'Other'
                  ? <input className="composer-input-sm" placeholder="Type your role" value={customRole} onChange={e => setCustomRole(e.target.value)} />
                  : <select className="composer-select" value={years} onChange={e => setYears(e.target.value)}>
                      <option value="">Years in sales</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                }

                <input
                  className="composer-input-sm"
                  placeholder="Industry (SaaS, Real Estate...)"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  style={{ gridColumn: role === 'Other' ? 'span 1' : 'span 2' }}
                />
              </div>

              {showMagic && (
                <div className="magic-panel">
                  <div className="magic-panel-title">🌳 Save this to Your Space</div>
                  <p className="magic-panel-sub">Drop your email — we&apos;ll send a magic link. Your story posts either way.</p>
                  <input
                    className="wl-input"
                    type="email"
                    placeholder="your@email.com"
                    value={magicEmail}
                    onChange={e => setMagicEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitWithSpace()}
                  />
                </div>
              )}

              <div className="composer-actions">
                <span className={`composer-char${remaining < 80 ? ' warn' : ''}`}>{remaining} left</span>
                <div className="composer-btns">
                  <button className="composer-cancel" onClick={closeComposer}>Cancel</button>
                  <button className="btn btn-ghost" onClick={submitAnonymously} disabled={!content.trim() || postStatus === 'posting'}>
                    {postStatus === 'posting' ? 'Posting...' : 'Post Anonymously'}
                  </button>
                  <button className="btn btn-orange" onClick={submitWithSpace} disabled={!content.trim() || postStatus === 'posting'}>
                    {showMagic ? 'Save & Post →' : 'Save to Your Space →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {postStatus === 'done' && (
            <div style={{ textAlign: 'center', padding: '0.5rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
              🌿 Your story is on the bench.
            </div>
          )}

          {postStatus === 'magic-sent' && (
            <div style={{ textAlign: 'center', padding: '0.5rem', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
              🔑 Story posted. Magic link sent to {magicEmail}
            </div>
          )}

        </div>
      </div>
    </>
  )
}