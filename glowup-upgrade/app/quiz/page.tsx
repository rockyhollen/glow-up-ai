'use client'
// app/quiz/page.tsx
// ─────────────────────────────────────────────────────────────
// GLOW-UP AI — Full Questionnaire Campaign Flow
// Intro → 7 Questions → Loading → Paywall
// Saves customer to Supabase, triggers AI, gates with Stripe
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────
interface Answers {
  goal?: string
  age?: string
  budget?: string
  maintenance?: string
  style?: string
  concerns?: string[]
  name?: string
  email?: string
}

// ── Questions ─────────────────────────────────────────────────
const STEPS = [
  {
    id: 'goal',
    question: "What's your main glow-up goal?",
    sub: "We'll build your blueprint around this.",
    type: 'single',
    options: [
      { value: 'dating', label: 'Dating & attraction', emoji: '🔥' },
      { value: 'professional', label: 'Professional image', emoji: '💼' },
      { value: 'confidence', label: 'General confidence', emoji: '⚡' },
      { value: 'social', label: 'Social presence', emoji: '🎯' },
    ],
  },
  {
    id: 'age',
    question: 'How old are you?',
    sub: 'Recommendations are calibrated by age group.',
    type: 'single',
    options: [
      { value: '18-24', label: '18–24', emoji: '' },
      { value: '25-34', label: '25–34', emoji: '' },
      { value: '35-44', label: '35–44', emoji: '' },
      { value: '45+', label: '45+', emoji: '' },
    ],
  },
  {
    id: 'budget',
    question: "What's your grooming budget?",
    sub: 'We give product picks at every tier.',
    type: 'single',
    options: [
      { value: 'diy', label: 'DIY / Free', emoji: '🌿' },
      { value: 'budget', label: 'Budget ($5–$20/mo)', emoji: '💰' },
      { value: 'mid', label: 'Mid ($20–$60/mo)', emoji: '✨' },
      { value: 'premium', label: 'Premium ($60+/mo)', emoji: '💎' },
    ],
  },
  {
    id: 'maintenance',
    question: 'How much time will you commit daily?',
    sub: 'Honest answers give better plans.',
    type: 'single',
    options: [
      { value: 'minimal', label: 'Under 5 min', emoji: '⏱' },
      { value: 'moderate', label: '5–15 min', emoji: '🕐' },
      { value: 'dedicated', label: '15–30 min', emoji: '🏆' },
    ],
  },
  {
    id: 'style',
    question: 'Which style direction fits you?',
    sub: "Pick the one that feels most 'you' — or who you want to become.",
    type: 'single',
    options: [
      { value: 'clean', label: 'Clean & classic', emoji: '🎩' },
      { value: 'streetwear', label: 'Streetwear / casual', emoji: '👟' },
      { value: 'rugged', label: 'Rugged / outdoorsy', emoji: '🏔' },
      { value: 'sharp', label: 'Sharp / business-casual', emoji: '👔' },
    ],
  },
  {
    id: 'concerns',
    question: 'Any specific concerns?',
    sub: 'Pick all that apply — your blueprint addresses these directly.',
    type: 'multi',
    options: [
      { value: 'hairloss', label: 'Hair thinning / loss', emoji: '' },
      { value: 'skin', label: 'Skin issues (acne, texture)', emoji: '' },
      { value: 'beard', label: 'Patchy or uneven beard', emoji: '' },
      { value: 'weight', label: 'Body composition', emoji: '' },
      { value: 'style_clueless', label: 'No idea how to dress', emoji: '' },
      { value: 'none', label: 'No specific concerns', emoji: '' },
    ],
  },
  {
    id: 'email',
    question: 'Where should we send your blueprint?',
    sub: "Your report is personalized and delivered to your inbox.",
    type: 'email',
    placeholder: 'your@email.com',
  },
]

// ── Teaser data by goal ───────────────────────────────────────
const TEASERS: Record<string, { archetype: string; top_win: string; locked: string[] }> = {
  dating: {
    archetype: 'High-contrast, masculine presence',
    top_win: 'Sharper fade + defined neckline beard = immediate visual upgrade',
    locked: ['Celebrity style match', 'Exact barber script', 'Dating outfit formula'],
  },
  professional: {
    archetype: 'Structured, composed authority',
    top_win: 'Clean skin routine + structured haircut = instant credibility boost',
    locked: ['Executive wardrobe capsule', 'Interview outfit formula', 'Skin product stack'],
  },
  confidence: {
    archetype: 'Grounded, self-assured energy',
    top_win: 'Consistent grooming routine + fitted basics = compounding confidence',
    locked: ['Daily 7-minute routine', 'Core wardrobe pieces', 'Presence & posture cues'],
  },
  social: {
    archetype: 'Effortless, approachable style',
    top_win: 'Versatile style system that works across every social context',
    locked: ['Casual-to-dressed-up transitions', 'Color palette guide', 'Social presence cues'],
  },
}

// ── Utility ───────────────────────────────────────────────────
function getSession() {
  if (typeof window === 'undefined') return 'anon'
  let s = sessionStorage.getItem('glowup_session')
  if (!s) {
    s = Math.random().toString(36).slice(2)
    sessionStorage.setItem('glowup_session', s)
  }
  return s
}

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
          Step {current} of {total}
        </span>
        <span style={{ fontSize: 11, color: '#c8a96e', fontFamily: 'monospace' }}>{pct}%</span>
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 99 }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #c8a96e, #f0d080)',
          borderRadius: 99,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 0 10px rgba(200,169,110,0.4)',
        }} />
      </div>
    </div>
  )
}

function OptionCard({ option, selected, onClick, multi }: {
  option: { value: string; label: string; emoji?: string }
  selected: boolean
  onClick: () => void
  multi: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '15px 18px',
        background: selected ? 'linear-gradient(135deg, rgba(200,169,110,0.18), rgba(200,169,110,0.06))' : 'rgba(255,255,255,0.03)',
        border: selected ? '1px solid rgba(200,169,110,0.6)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 11,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.2s',
        textAlign: 'left',
        transform: selected ? 'scale(1.01)' : 'scale(1)',
        boxShadow: selected ? '0 0 0 1px rgba(200,169,110,0.25), 0 4px 16px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {option.emoji && <span style={{ fontSize: 20, minWidth: 26 }}>{option.emoji}</span>}
      {multi && (
        <div style={{
          width: 17, height: 17, borderRadius: 4, flexShrink: 0,
          border: selected ? '2px solid #c8a96e' : '2px solid rgba(255,255,255,0.2)',
          background: selected ? '#c8a96e' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {selected && <span style={{ color: '#1a1208', fontSize: 10, fontWeight: 800 }}>✓</span>}
        </div>
      )}
      <span style={{
        fontSize: 15,
        fontWeight: selected ? 600 : 400,
        color: selected ? '#f0d080' : '#d4c5a9',
        fontFamily: "'Georgia', serif",
        letterSpacing: '0.01em',
      }}>
        {option.label}
      </span>
    </button>
  )
}

// ══════════════════════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════════════════════

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ animation: 'fadeUp 0.5s ease' }}>
      <div style={{
        width: 52, height: 52,
        background: 'linear-gradient(135deg, rgba(200,169,110,0.2), rgba(200,169,110,0.06))',
        border: '1px solid rgba(200,169,110,0.4)',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, marginBottom: 22,
      }}>✦</div>

      <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 10 }}>
        Glow-Up Blueprint
      </p>

      <h1 style={{
        fontSize: 'clamp(24px, 5vw, 34px)',
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 800, color: '#f5ece0',
        lineHeight: 1.15, marginBottom: 14,
      }}>
        Stop guessing what makes you look better.
      </h1>

      <p style={{ color: '#a89070', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
        Answer 7 quick questions. Get a personalized blueprint with exact haircut instructions, beard plan, skin routine, wardrobe, and a PDF you can follow for 30 days.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {['Takes 90 seconds', 'Personalized to your face & goals', 'Blueprint ready instantly'].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#c8a96e', fontSize: 14 }}>✓</span>
            <span style={{ color: '#d4c5a9', fontSize: 14 }}>{item}</span>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        width: '100%', padding: '17px 24px',
        background: 'linear-gradient(135deg, #c8a96e, #f0d080)',
        border: 'none', borderRadius: 12,
        color: '#1a1208', fontSize: 16, fontWeight: 800,
        cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
        boxShadow: '0 8px 32px rgba(200,169,110,0.3)',
        transition: 'all 0.2s',
      }}>
        Build My Blueprint →
      </button>

      <p style={{ textAlign: 'center', color: '#4a3a28', fontSize: 12, marginTop: 12 }}>
        Free preview · Full report unlocks at end
      </p>
    </div>
  )
}

function QuestionScreen({ step, value, onChange, onNext, onBack, stepIndex, totalSteps }: {
  step: typeof STEPS[0]
  value: string | string[] | undefined
  onChange: (v: string | string[]) => void
  onNext: () => void
  onBack: () => void
  stepIndex: number
  totalSteps: number
}) {
  const [localText, setLocalText] = useState((value as string) || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if ((step.type === 'email') && inputRef.current) inputRef.current.focus()
  }, [step])

  const isAnswered = step.type === 'email'
    ? localText.includes('@') && localText.includes('.')
    : step.type === 'multi'
    ? ((value as string[]) || []).length > 0
    : !!value

  const handleSingle = (val: string) => {
    onChange(val)
    setTimeout(onNext, 280)
  }

  const handleMulti = (val: string) => {
    const current = (value as string[]) || []
    if (val === 'none') { onChange(['none']); return }
    const without = current.filter(v => v !== 'none')
    if (without.includes(val)) onChange(without.filter(v => v !== val))
    else onChange([...without, val])
  }

  return (
    <div style={{ animation: 'fadeUp 0.35s ease' }}>
      <ProgressBar current={stepIndex + 1} total={totalSteps} />

      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'monospace' }}>
          Glow-Up Blueprint
        </p>
        <h2 style={{
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 700, color: '#f5ece0',
          fontFamily: "'Playfair Display', Georgia, serif",
          lineHeight: 1.2, marginBottom: 8,
        }}>
          {step.question}
        </h2>
        <p style={{ color: '#8b7355', fontSize: 13 }}>{step.sub}</p>
      </div>

      {step.type === 'email' ? (
        <div style={{ marginBottom: 24 }}>
          <input
            ref={inputRef}
            type="email"
            value={localText}
            onChange={e => { setLocalText(e.target.value); onChange(e.target.value) }}
            placeholder={step.placeholder}
            onKeyDown={e => e.key === 'Enter' && isAnswered && onNext()}
            style={{
              width: '100%', padding: '16px 18px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(200,169,110,0.35)',
              borderRadius: 11, color: '#f5ece0',
              fontSize: 16, outline: 'none', boxSizing: 'border-box',
              fontFamily: 'system-ui',
            }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
          {step.options?.map(opt => (
            <OptionCard
              key={opt.value}
              option={opt}
              selected={step.type === 'multi'
                ? ((value as string[]) || []).includes(opt.value)
                : value === opt.value}
              onClick={() => step.type === 'multi' ? handleMulti(opt.value) : handleSingle(opt.value)}
              multi={step.type === 'multi'}
            />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        {stepIndex > 0 && (
          <button onClick={onBack} style={{
            padding: '13px 20px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            color: '#8b7355', cursor: 'pointer', fontSize: 14,
          }}>
            ← Back
          </button>
        )}
        {(step.type === 'multi' || step.type === 'email') && (
          <button onClick={onNext} disabled={!isAnswered} style={{
            flex: 1, padding: '15px 24px',
            background: isAnswered ? 'linear-gradient(135deg, #c8a96e, #f0d080)' : 'rgba(255,255,255,0.05)',
            border: 'none', borderRadius: 10,
            color: isAnswered ? '#1a1208' : '#444',
            cursor: isAnswered ? 'pointer' : 'not-allowed',
            fontSize: 15, fontWeight: 700,
            transition: 'all 0.2s', letterSpacing: '0.05em',
          }}>
            {step.id === 'email' ? 'Build My Blueprint →' : 'Continue →'}
          </button>
        )}
      </div>
    </div>
  )
}

function LoadingScreen({ name }: { name?: string }) {
  const [phase, setPhase] = useState(0)
  const phases = [
    'Analyzing your profile…',
    'Building your archetype…',
    'Generating hair & beard plan…',
    'Calibrating style system…',
    'Matching affiliate products…',
    'Preparing your blueprint…',
  ]

  useEffect(() => {
    const t = setInterval(() => setPhase(p => Math.min(p + 1, phases.length - 1)), 900)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '32px 0', animation: 'fadeUp 0.4s ease' }}>
      <div style={{
        width: 72, height: 72, margin: '0 auto 22px',
        border: '2px solid rgba(200,169,110,0.25)',
        borderTop: '2px solid #c8a96e',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <h2 style={{ fontSize: 22, fontFamily: "'Playfair Display', Georgia, serif", color: '#f5ece0', marginBottom: 8 }}>
        Building{name ? ` ${name}'s` : ' your'} blueprint
      </h2>
      <p style={{ color: '#c8a96e', fontSize: 14, marginBottom: 28 }}>{phases[phase]}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxWidth: 280, margin: '0 auto' }}>
        {phases.slice(0, phase + 1).map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeUp 0.3s ease' }}>
            <span style={{ color: i < phase ? '#c8a96e' : '#f0d080', fontSize: 12 }}>{i < phase ? '✓' : '◈'}</span>
            <span style={{ fontSize: 12, color: i < phase ? '#8b7355' : '#d4c5a9' }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaywallScreen({ answers, customerId }: { answers: Answers; customerId: string }) {
  const [loading, setLoading] = useState(false)
  const goal = answers.goal || 'confidence'
  const teaser = TEASERS[goal] || TEASERS.confidence
  const name = answers.email?.split('@')[0] || 'You'

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, email: answers.email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div style={{ animation: 'fadeUp 0.5s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-block', padding: '3px 12px',
          background: 'rgba(200,169,110,0.12)',
          border: '1px solid rgba(200,169,110,0.3)',
          borderRadius: 99, fontSize: 11, color: '#c8a96e',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          fontFamily: 'monospace', marginBottom: 12,
        }}>
          Your Blueprint Is Ready
        </div>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontFamily: "'Playfair Display', Georgia, serif", color: '#f5ece0', marginBottom: 6 }}>
          {name}'s Glow-Up Blueprint
        </h2>
        <p style={{ color: '#8b7355', fontSize: 13 }}>We analyzed your answers. Here's a preview.</p>
      </div>

      {/* Archetype reveal */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(200,169,110,0.1), rgba(200,169,110,0.03))',
        border: '1px solid rgba(200,169,110,0.28)',
        borderRadius: 13, padding: '18px 20px', marginBottom: 14,
      }}>
        <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 5 }}>Your Archetype</p>
        <h3 style={{ fontSize: 19, color: '#f0d080', fontFamily: "'Playfair Display', serif", marginBottom: 10 }}>{teaser.archetype}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: '#c8a96e', fontSize: 16 }}>⚡</span>
          <p style={{ color: '#d4c5a9', fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: '#f5ece0' }}>Top win:</strong> {teaser.top_win}
          </p>
        </div>
      </div>

      {/* Locked sections */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 9 }}>
          Locked in your full report
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            'Face shape diagnostic + feature analysis',
            'Exact barber script (hand to your barber)',
            'Hair product stack: DIY → budget → premium',
            'Beard length, shape & neckline guide',
            'Skin routine matched to your skin type',
            ...teaser.locked,
            'Capsule wardrobe + outfit formulas',
            'Personalized affiliate product picks',
            '30-day execution plan + downloadable PDF',
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 13px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 7,
            }}>
              <span style={{ fontSize: 13 }}>🔒</span>
              <span style={{ color: '#8b7355', fontSize: 13 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price + CTA */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(200,169,110,0.1), rgba(240,208,128,0.05))',
        border: '1px solid rgba(200,169,110,0.35)',
        borderRadius: 15, padding: '22px 20px', marginBottom: 12, textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: '#f0d080', fontFamily: "'Playfair Display', serif" }}>$19</span>
          <span style={{ fontSize: 14, color: '#8b7355', textDecoration: 'line-through' }}>$49</span>
        </div>
        <p style={{ color: '#8b7355', fontSize: 12, marginBottom: 18 }}>Launch price · One-time · Instant access</p>
        <button onClick={handleCheckout} disabled={loading} style={{
          width: '100%', padding: '17px 24px',
          background: loading ? 'rgba(200,169,110,0.3)' : 'linear-gradient(135deg, #c8a96e, #f0d080)',
          border: 'none', borderRadius: 11,
          color: loading ? '#c8a96e' : '#1a1208',
          fontSize: 15, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          transition: 'all 0.3s',
          boxShadow: loading ? 'none' : '0 8px 28px rgba(200,169,110,0.28)',
        }}>
          {loading ? 'Preparing checkout…' : 'Unlock My Full Blueprint →'}
        </button>
        <p style={{ fontSize: 11, color: '#8b7355', marginTop: 10 }}>🔒 Secure checkout via Stripe · 7-day guarantee</p>
      </div>

      {/* Testimonials */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { text: 'Handed the barber script on day 1. Best haircut of my life.', name: 'Marcus, 27' },
          { text: 'Finally understood what actually fits my face shape.', name: 'Devon, 31' },
          { text: 'The skin routine alone was worth $19.', name: 'Jordan, 24' },
        ].map((t, i) => (
          <div key={i} style={{
            padding: '13px 15px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 9,
          }}>
            <p style={{ color: '#d4c5a9', fontSize: 12, lineHeight: 1.6, marginBottom: 5 }}>"{t.text}"</p>
            <p style={{ color: '#8b7355', fontSize: 11 }}>— {t.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function QuizPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<'intro' | 'quiz' | 'loading' | 'paywall'>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [customerId, setCustomerId] = useState<string>('')

  const currentStep = STEPS[stepIndex]

  const handleAnswer = (val: string | string[]) => {
    setAnswers(prev => ({ ...prev, [currentStep.id]: val }))
  }

  const handleNext = async () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1)
    } else {
      // Last step — save customer and show loading
      setScreen('loading')
      await saveCustomer()
      setTimeout(() => setScreen('paywall'), 5500)
    }
  }

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(i => i - 1)
    else setScreen('intro')
  }

  const saveCustomer = async () => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: answers.email,
          goal: answers.goal,
          ageRange: answers.age,
          budget: answers.budget,
          maintenance: answers.maintenance,
          stylePref: answers.style,
          concerns: answers.concerns || [],
          sessionId: getSession(),
          utmSource: new URLSearchParams(window.location.search).get('utm_source'),
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        }),
      })
      const data = await res.json()
      if (data.customer?.id) setCustomerId(data.customer.id)
    } catch (err) {
      console.error('saveCustomer error:', err)
    }
  }

  const getValue = () => {
    const id = currentStep.id as keyof Answers
    return answers[id]
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 0%, rgba(200,169,110,0.07) 0%, transparent 55%), #0f0d09',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '24px 16px 80px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(200,169,110,0.3); }
        input:focus { border-color: rgba(200,169,110,0.6) !important; box-shadow: 0 0 0 3px rgba(200,169,110,0.08) !important; }
        button:hover:not(:disabled) { filter: brightness(1.07); }
      `}</style>

      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 8 }}>
          <a href="/" style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5a44', fontFamily: 'monospace', textDecoration: 'none' }}>
            ◈ GlowUpMen.com
          </a>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: 'clamp(22px, 5vw, 38px)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03) inset',
        }}>
          {screen === 'intro' && <IntroScreen onStart={() => setScreen('quiz')} />}
          {screen === 'quiz' && (
            <QuestionScreen
              step={currentStep}
              value={getValue()}
              onChange={handleAnswer}
              onNext={handleNext}
              onBack={handleBack}
              stepIndex={stepIndex}
              totalSteps={STEPS.length}
            />
          )}
          {screen === 'loading' && <LoadingScreen name={answers.email?.split('@')[0]} />}
          {screen === 'paywall' && <PaywallScreen answers={answers} customerId={customerId} />}
        </div>

        {screen !== 'paywall' && (
          <p style={{ textAlign: 'center', color: '#2d2218', fontSize: 11, marginTop: 18, letterSpacing: '0.08em' }}>
            🔒 Your answers are private and never sold
          </p>
        )}
      </div>
    </div>
  )
}
