'use client'
// app/report/page.tsx
// ─────────────────────────────────────────────────────────────
// Post-payment report page
// Loads customer data, triggers AI generation if needed,
// displays full report + dynamic affiliate product picks
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  brand: string
  label: string
  tier: string
  price_display: string
  affiliate_url: string
  badge: string
  image_url: string
}

interface ReportData {
  customer: any
  recommendations: Record<string, Product[]>
  aiReport: any
}

function ReportContent() {
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customer_id')
  const sessionId = searchParams.get('session_id')

  const [state, setState] = useState<'loading' | 'generating' | 'ready' | 'error'>('loading')
  const [report, setReport] = useState<ReportData | null>(null)
  const [phase, setPhase] = useState(0)

  const loadingPhases = [
    'Verifying payment…',
    'Loading your profile…',
    'Generating AI analysis…',
    'Building hair & beard plan…',
    'Matching products to your archetype…',
    'Compiling your blueprint…',
  ]

  useEffect(() => {
    if (!customerId && !sessionId) {
      setState('error')
      return
    }
    loadReport()
  }, [customerId, sessionId])

  useEffect(() => {
    if (state === 'generating') {
      const t = setInterval(() => setPhase(p => Math.min(p + 1, loadingPhases.length - 1)), 1200)
      return () => clearInterval(t)
    }
  }, [state])

  const loadReport = async () => {
    setState('generating')

    try {
      // 1. Get customer data
      let customerData = null
      if (customerId) {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single()
        customerData = data
      }

      // 2. Generate AI report if not already done
      let aiReport = customerData?.ai_report
      if (!aiReport && customerId) {
        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId }),
        })
        const genData = await genRes.json()
        aiReport = genData.report
      }

      // 3. Get product recommendations
      let recommendations: Record<string, Product[]> = {}
      if (customerId) {
        const recRes = await fetch(`/api/recommendations?customerId=${customerId}`)
        const recData = await recRes.json()
        recommendations = recData.recommendations || {}
      }

      setReport({ customer: customerData, recommendations, aiReport })
      setState('ready')

    } catch (err) {
      console.error('loadReport error:', err)
      setState('error')
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { background: '#0a0804', minHeight: '100vh', color: '#f5ece0', fontFamily: 'system-ui, sans-serif', padding: '0 0 80px' },
    header: { borderBottom: '1px solid rgba(200,169,110,0.15)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    body: { padding: '28px 20px', maxWidth: 600, margin: '0 auto' },
    sectionTitle: { fontSize: 'clamp(18px,4vw,24px)', fontFamily: "'Georgia', serif", fontWeight: 700, color: '#f5ece0', marginBottom: 6 },
    sectionSub: { fontSize: 13, color: '#8b7355', marginBottom: 16 },
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px', marginBottom: 12 },
    goldCard: { background: 'linear-gradient(135deg, rgba(200,169,110,0.12), rgba(200,169,110,0.04))', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 12, padding: '18px 20px', marginBottom: 12 },
    scroll: { display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' },
  }

  // Loading state
  if (state === 'loading' || state === 'generating') {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 20px', border: '2px solid rgba(200,169,110,0.2)', borderTop: '2px solid #c8a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: 22, fontFamily: "'Georgia', serif", color: '#f5ece0', marginBottom: 8 }}>
            Building your report
          </h2>
          <p style={{ color: '#c8a96e', fontSize: 14, marginBottom: 24 }}>{loadingPhases[phase]}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 260, margin: '0 auto' }}>
            {loadingPhases.slice(0, phase + 1).map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ color: i < phase ? '#c8a96e' : '#f0d080' }}>{i < phase ? '✓' : '◈'}</span>
                <span style={{ color: i < phase ? '#6b5a44' : '#d4c5a9' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40, maxWidth: 380 }}>
          <p style={{ color: '#f5ece0', fontSize: 18, marginBottom: 12 }}>Something went wrong loading your report.</p>
          <p style={{ color: '#8b7355', fontSize: 14, marginBottom: 24 }}>Email us at hello@glowupmen.com and we'll get it to you within 24 hours.</p>
          <a href="/" style={{ color: '#c8a96e', fontSize: 14 }}>← Back to home</a>
        </div>
      </div>
    )
  }

  const ai = report?.aiReport || {}
  const recs = report?.recommendations || {}
  const customer = report?.customer || {}

  const SECTIONS = [
    { key: 'tops', emoji: '👕', title: 'TOPS', sub: 'Foundation of your look' },
    { key: 'jackets', emoji: '🧥', title: 'JACKETS', sub: 'High impact pieces' },
    { key: 'pants', emoji: '👖', title: 'PANTS', sub: 'Fit is everything here' },
    { key: 'shoes', emoji: '👟', title: 'SHOES', sub: 'Quietly one of the biggest upgrades' },
    { key: 'grooming', emoji: '✨', title: 'GROOMING', sub: 'Daily routine products' },
  ]

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap'); ::-webkit-scrollbar{display:none;} *{box-sizing:border-box;margin:0;padding:0;}`}</style>

      {/* Header */}
      <div style={s.header}>
        <span style={{ fontSize: 12, color: '#8b7355', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace' }}>◈ GlowUpMen.com</span>
        <button onClick={() => window.print()} style={{ padding: '6px 14px', background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 7, color: '#c8a96e', fontSize: 12, cursor: 'pointer' }}>
          Download PDF
        </button>
      </div>

      <div style={s.body}>
        {/* Archetype */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 8 }}>Your Archetype</p>
          <h1 style={{ fontSize: 'clamp(22px,5vw,32px)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, color: '#f5ece0', marginBottom: 8 }}>
            {ai?.archetype_summary?.type || 'Structured, masculine, composed'}
          </h1>
          <p style={{ color: '#a89070', fontSize: 14 }}>
            {ai?.archetype_summary?.summary || 'Your complete appearance blueprint is ready below.'}
          </p>
        </div>

        {/* Hair section */}
        {ai?.hair_plan && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={s.sectionTitle}>💈 Hair Plan</h2>
            <p style={s.sectionSub}>Your exact barber script and product stack</p>
            <div style={s.goldCard}>
              <p style={{ fontSize: 13, color: '#f0d080', fontWeight: 600, marginBottom: 8 }}>Barber Script</p>
              <p style={{ fontSize: 14, color: '#d4c5a9', lineHeight: 1.7 }}>
                {ai.hair_plan.barber_script || 'Low-mid fade, clean neckline, textured top.'}
              </p>
            </div>
            {ai.hair_plan.products && (
              <div style={s.card}>
                <p style={{ fontSize: 12, color: '#8b7355', marginBottom: 8 }}>Product Stack</p>
                {Object.entries(ai.hair_plan.products).map(([tier, product]) => (
                  <div key={tier} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: tier === 'diy' ? '#4ade80' : tier === 'budget' ? '#facc15' : '#f87171', minWidth: 50 }}>{tier}</span>
                    <span style={{ fontSize: 13, color: '#d4c5a9' }}>{product as string}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skin section */}
        {ai?.skin_plan && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={s.sectionTitle}>🧴 Skin Plan</h2>
            <p style={s.sectionSub}>Routine matched to your visible skin needs</p>
            <div style={s.card}>
              <p style={{ fontSize: 12, color: '#8b7355', marginBottom: 10 }}>Daily Routine</p>
              {ai.skin_plan.routine?.daily?.map((step: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 7 }}>
                  <span style={{ color: '#c8a96e', fontSize: 12, minWidth: 18 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: '#d4c5a9' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Style section */}
        {ai?.style_system && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={s.sectionTitle}>👔 Style System</h2>
            <p style={s.sectionSub}>Capsule wardrobe and outfit formulas</p>
            {ai.style_system.core_items && (
              <div style={s.card}>
                <p style={{ fontSize: 12, color: '#8b7355', marginBottom: 10 }}>Core Items to Own</p>
                {ai.style_system.core_items.map((item: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#c8a96e' }}>✓</span>
                    <span style={{ fontSize: 13, color: '#d4c5a9' }}>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Affiliate Products — dynamic per section */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ ...s.sectionTitle, marginBottom: 4 }}>🛍 Your Shopping Blueprint</h2>
          <p style={{ ...s.sectionSub, marginBottom: 24 }}>Products matched to your archetype and budget</p>

          {SECTIONS.map(section => {
            const products = recs[section.key] || []
            if (products.length === 0) return null
            return (
              <div key={section.key} style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, color: '#f5ece0', fontFamily: "'Georgia', serif", marginBottom: 4 }}>
                  {section.emoji} {section.title}
                </h3>
                <p style={{ fontSize: 12, color: '#8b7355', marginBottom: 12 }}>{section.sub}</p>
                <div style={s.scroll}>
                  {products.map((product: Product) => (
                    <a
                      key={product.id}
                      href={product.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() => fetch('/api/affiliate-click', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId: product.id, brand: product.brand, category: section.key, customerId: customer.id }),
                      })}
                      style={{
                        minWidth: 180, maxWidth: 190,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                        textDecoration: 'none', display: 'block',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <div style={{ height: 130, background: 'linear-gradient(135deg, rgba(200,169,110,0.06), rgba(10,8,4,0.8))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, opacity: 0.3 }}>
                        {section.emoji}
                      </div>
                      <div style={{ padding: '12px 13px' }}>
                        {product.badge && (
                          <span style={{ fontSize: 10, background: 'rgba(200,169,110,0.9)', color: '#1a1208', padding: '2px 7px', borderRadius: 99, fontWeight: 700, letterSpacing: '0.06em' }}>
                            {product.badge}
                          </span>
                        )}
                        <p style={{ fontSize: 11, color: '#8b7355', marginTop: 8, marginBottom: 3, fontFamily: 'monospace', letterSpacing: '0.08em' }}>{product.brand}</p>
                        <p style={{ fontSize: 13, color: '#f5ece0', fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{product.label}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#c8a96e' }}>{product.price_display}</span>
                        </div>
                        <div style={{ marginTop: 10, padding: '8px', background: 'linear-gradient(135deg, #c8a96e, #f0d080)', borderRadius: 7, textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#1a1208', letterSpacing: '0.08em' }}>
                          SHOP NOW →
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* 30-day plan */}
        {ai?.execution_plan && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={s.sectionTitle}>📅 30-Day Execution Plan</h2>
            <p style={s.sectionSub}>Week by week — exactly what to do</p>
            {Object.entries(ai.execution_plan).map(([week, tasks]) => (
              <div key={week} style={{ ...s.card, marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: '#c8a96e', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{week}</p>
                {(tasks as string[]).map((task: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <span style={{ color: '#8b7355' }}>→</span>
                    <span style={{ fontSize: 13, color: '#d4c5a9' }}>{task}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0a0804', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#8b7355' }}>Loading your report…</p>
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
