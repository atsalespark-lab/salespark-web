import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, section } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const formspreeId = process.env.FORMSPREE_ID
    if (!formspreeId) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, section, source: 'SalesPark Waitlist' }),
    })

    if (res.ok) return NextResponse.json({ ok: true })
    return NextResponse.json({ error: 'Formspree error' }, { status: 502 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
