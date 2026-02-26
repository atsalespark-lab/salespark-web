'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Drop } from '@/lib/types'

interface Reply {
  id: string
  reason: string
  created_at: string
}

interface Props {
  drop: Drop
}

export default function DropCard({ drop }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [beenThere, setBeenThere] = useState(drop.been_there_count)
  const [beenThereActive, setBeenThereActive] = useState(false)
  const [showDisagreeForm, setShowDisagreeForm] = useState(false)
  const [disagreeText, setDisagreeText] = useState('')
  const [disagreeShake, setDisagreeShake] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [replies, setReplies] = useState<Reply[]>([])

  const isLong = drop.content.length > 220
  const storageKey = `bt_${drop.id}`

  // Check localStorage on mount
  useEffect(() => {
    const already = localStorage.getItem(storageKey)
    if (already) setBeenThereActive(true)
  }, [storageKey])

  // Load replies
  useEffect(() => {
    async function loadReplies() {
      const { data } = await supabase
        .from('reactions')
        .select('id, reason, created_at')
        .eq('drop_id', drop.id)
        .eq('type', 'disagree')
        .not('reason', 'is', null)
        .order('created_at', { ascending: true })
      if (data) setReplies(data)
    }
    loadReplies()
  }, [drop.id])

  function buildMeta() {
    const parts = []
    if (drop.role) parts.push(drop.role)
    if (drop.years_in_sales) parts.push(drop.years_in_sales)
    if (drop.industry) parts.push(drop.industry)
    return parts.length > 0 ? parts.join(' · ') : 'A salesperson'
  }

  async function handleBeenThere() {
    if (beenThereActive) return
    setBeenThereActive(true)
    setBeenThere(n => n + 1)
    localStorage.setItem(storageKey, '1')
    await supabase.rpc('increment_been_there', { drop_id: drop.id })
  }

  async function handleDisagreeSubmit() {
    if (disagreeText.trim().length < 20) {
      setDisagreeShake(true)
      setTimeout(() => setDisagreeShake(false), 400)
      return
    }
    const reason = disagreeText.trim()
    const { data } = await supabase
      .from('reactions')
      .insert({ drop_id: drop.id, type: 'disagree', reason })
      .select('id, reason, created_at')
      .single()
    if (data) setReplies(prev => [...prev, data])
    setDisagreeText('')
    setShowDisagreeForm(false)
  }

  async function handleReport() {
    if (flagged) return
    setFlagged(true)
    await supabase.from('drops').update({ is_flagged: true }).eq('id', drop.id)
  }

  return (
    <div className="drop-card">
      <div className="drop-meta">{buildMeta()}</div>

      <div className={`drop-content${isLong && !expanded ? ' clamped' : ''}`}>
        {drop.content}
      </div>

      {isLong && (
        <button className="read-more" onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Show less ↑' : 'Read more →'}
        </button>
      )}

      {replies.length > 0 && (
        <div className="drop-replies">
          {replies.map(reply => (
            <div key={reply.id} className="reply-card">
              <div className="reply-label">🤔 Don&apos;t agree</div>
              <div className="reply-text">{reply.reason}</div>
            </div>
          ))}
        </div>
      )}

      <div className="drop-actions">
        <button
          className={`react-btn${beenThereActive ? ' active' : ''}`}
          onClick={handleBeenThere}
          title={beenThereActive ? 'Already reacted' : ''}
        >
          <span>🤝</span>
          <span>Been There</span>
          {beenThere > 0 && <span className="react-count">{beenThere}</span>}
        </button>

        <button
          className={`react-btn${showDisagreeForm ? ' active' : ''}`}
          onClick={() => setShowDisagreeForm(s => !s)}
        >
          <span>🤔</span>
          <span>Don&apos;t Agree</span>
          {replies.length > 0 && <span className="react-count">{replies.length}</span>}
        </button>

        <button className="report-btn" onClick={handleReport} disabled={flagged}>
          {flagged ? 'reported' : 'report'}
        </button>
      </div>

      {showDisagreeForm && (
        <div className="disagree-form">
          <textarea
            className={`disagree-input${disagreeShake ? ' shake' : ''}`}
            placeholder="Tell us why — even one line helps"
            value={disagreeText}
            onChange={e => setDisagreeText(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="disagree-submit" onClick={handleDisagreeSubmit}>Post reply →</button>
            <button className="disagree-submit" style={{ background: 'var(--bg-card2)', color: 'var(--ink-muted)' }} onClick={() => { setShowDisagreeForm(false); setDisagreeText('') }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}