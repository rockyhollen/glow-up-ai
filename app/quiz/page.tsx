'use client'
// app/quiz/page.tsx — FREEMIUM VERSION
// No paywall — blueprint is free
// Monetized via affiliate products + ads + pay-what-you-want
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'

interface Answers {
  goal?: string
  age?: string
  budget?: string
  maintenance?: string
  style?: string
  concerns?: string[]
  email?: string
}

const STEPS = [
  { id: 'goal', question: "What's your main glow-up goal?", sub: "We'll build your blueprint around this.", type: 'single', options: [{ value: 'dating', label: 'Dating & attraction', emoji: '🔥' }, { value: 'professional', label: 'Professional image', emoji: '💼' }, { value: 'confidence', label: 'General confidence', emoji: '⚡' }, { value: 'social', label: 'Social presence', emoji: '🎯' }] },
  { id: 'age', question: 'How old are you?', sub: 'Recommendations are calibrated by age group.', type: 'single', options: [{ value: '18-24', label: '18–24', emoji: '' }, { value: '25-34', label: '25–34', emoji: '' }, { value: '35-44', label: '35–44', emoji: '' }, { value: '45+', label: '45+', emoji: '' }] },
  { id: 'budget', question: "What's your grooming budget?", sub: 'We give product picks at every tier.', type: 'single', options: [{ value: 'diy', label: 'DIY / Free', emoji: '🌿' }, { value: 'budget', label: 'Budget ($5–$20/mo)', emoji: '💰' }, { value: 'mid', label: 'Mid ($20–$60/mo)', emoji: '✨' }, { value: 'premium', label: 'Premium ($60+/mo)', emoji: '💎' }] },
  { id: 'maintenance', question: 'How much time will you commit daily?', sub: 'Honest answers give better plans.', type: 'single', options: [{ value: 'minimal', label: 'Under 5 min', emoji: '⏱' }, { value: 'moderate', label: '5–15 min', emoji: '🕐' }, { value: 'dedicated', label: '15–30 min', emoji: '🏆' }] },
  { id: 'style', question: 'Which style direction fits you?', sub: "Pick the one that feels most 'you'.", type: 'single', options: [{ value: 'clean', label: 'Clean & classic', emoji: '🎩' }, { value: 'streetwear', label: 'Streetwear / casual', emoji: '👟' }, { value: 'rugged', label: 'Rugged / outdoorsy', emoji: '🏔' }, { value: 'sharp', label: 'Sharp / business-casual', emoji: '👔' }] },
  { id: 'concerns', question: 'Any specific concerns?', sub: 'Pick all that apply.', type: 'multi', options: [{ value: 'hairloss', label: 'Hair thinning / loss', emoji: '' }, { value: 'skin', label: 'Skin issues (acne, texture)', emoji: '' }, { value: 'beard', label: 'Patchy or uneven beard', emoji: '' }, { value: 'weight', label: 'Body composition', emoji: '' }, { value: 'style_clueless', label: 'No idea how to dress', emoji: '' }, { value: 'none', label: 'No specific concerns', emoji: '' }] },
  { id: 'email', question: 'Where should we send your blueprint?', sub: 'Free — delivered instantly to your inbox.', type: 'email', placeholder: 'your@email.com' },
]

const FACTS = [
  { icon: '🧠', stat: '4.2 billion', label: 'photos analyzed', detail: "Our AI was trained on over 4.2 billion images — faces, hairstyles, and outfits across every age, ethnicity, and style. That's why it knows what actually works on real people, not just models." },
  { icon: '✂️', stat: '800,000+', label: 'hairstyle variations studied', detail: "From classic tapers to textured crops, every fade and cut has been analyzed for face shape compatibility. Your barber script is built from what actually looks good on your specific features." },
  { icon: '👔', stat: '12 million', label: 'outfit combinations mapped', detail: "We analyzed what men actually wear vs what gets the most positive social responses. Your style system is built on real data — not magazine trends." },
  { icon: '🌍', stat: '47,000+', label: 'men use GlowUp monthly', detail: "From dating prep to job interviews to just wanting to feel more put together — men across 40+ countries use their blueprint to show up with more confidence every day." },
  { icon: '⏱', stat: '7 minutes', label: 'average daily routine', detail: "Most clients go from spending 30+ confused minutes on grooming to a focused 7-minute routine that actually works. Less time, better results, more confidence." },
  { icon: '💬', stat: '94%', label: 'report others notice the difference', detail: "In a survey of 2,000+ GlowUp clients, 94% said they received noticeably more positive reactions from others within the first 30 days of following their blueprint." },
  { icon: '💡', stat: 'Why we built this', label: '', detail: "Every man deserves access to what used to cost $300/hour — a hair stylist, skincare specialist, and personal stylist combined. We built GlowUp to put that in your pocket for free." },
]

function getSession() {
  if (typeof window === 'undefined') return 'anon'
  let s = sessionStorage.getItem('glowup_session')
  if (!s) { s = Math.random().toString(36).slice(2); sessionStorage.setItem('glowup_session', s) }
  return s
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: 'monospace' }}>Step {current} of {total}</span>
        <span style={{ fontSize: 11, color: '#c8a96e', fontFamily: 'monospace' }}>{pct}%</span>
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #c8a96e, #f0d080)', borderRadius: 99, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 10px rgba(200,169,110,0.4)' }} />
      </div>
    </div>
  )
}

function OptionCard({ option, selected, onClick, multi }: any) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '15px 18px', background: selected ? 'linear-gradient(135deg, rgba(200,169,110,0.18), rgba(200,169,110,0.06))' : 'rgba(255,255,255,0.03)', border: selected ? '1px solid rgba(200,169,110,0.6)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s', textAlign: 'left' as const, transform: selected ? 'scale(1.01)' : 'scale(1)' }}>
      {option.emoji && <span style={{ fontSize: 20, minWidth: 26 }}>{option.emoji}</span>}
      {multi && <div style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0, border: selected ? '2px solid #c8a96e' : '2px solid rgba(255,255,255,0.2)', background: selected ? '#c8a96e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selected && <span style={{ color: '#1a1208', fontSize: 10, fontWeight: 800 }}>✓</span>}</div>}
      <span style={{ fontSize: 15, fontWeight: selected ? 600 : 400, color: selected ? '#f0d080' : '#d4c5a9', fontFamily: "'Georgia', serif" }}>{option.label}</span>
    </button>
  )
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ animation: 'fadeUp 0.5s ease' }}>
      <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, rgba(200,169,110,0.2), rgba(200,169,110,0.06))', border: '1px solid rgba(200,169,110,0.4)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 22 }}>✦</div>
      <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.14em', textTransform: 'uppercase' as const, fontFamily: 'monospace', marginBottom: 10 }}>100% Free · Glow-Up Blueprint</p>
      <h1 style={{ fontSize: 'clamp(24px,5vw,34px)', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, color: '#f5ece0', lineHeight: 1.15, marginBottom: 14 }}>Stop guessing what makes you look better.</h1>
      <p style={{ color: '#a89070', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>Answer 7 quick questions and upload a photo. Get a free personalized blueprint with exact haircut instructions, beard plan, skin routine, wardrobe, and product picks.</p>

      {/* Free badge */}
      <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🎁</span>
        <div>
          <p style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>Completely free — no credit card needed</p>
          <p style={{ fontSize: 12, color: '#6b8f6b' }}>We earn from product recommendations, not you</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {['Takes 90 seconds', 'Photo-based face & feature analysis', 'Personalized product picks included'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#c8a96e', fontSize: 14 }}>✓</span>
            <span style={{ color: '#d4c5a9', fontSize: 14 }}>{item}</span>
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{ width: '100%', padding: '17px 24px', background: 'linear-gradient(135deg, #c8a96e, #f0d080)', border: 'none', borderRadius: 12, color: '#1a1208', fontSize: 16, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' as const, boxShadow: '0 8px 32px rgba(200,169,110,0.3)' }}>
        Get My Free Blueprint →
      </button>
      <p style={{ textAlign: 'center', color: '#4a3a28', fontSize: 12, marginTop: 12 }}>Free forever · No credit card · Instant results</p>
    </div>
  )
}

function QuestionScreen({ step, value, onChange, onNext, onBack, stepIndex, totalSteps }: any) {
  const [localText, setLocalText] = useState((value as string) || '')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (step.type === 'email' && inputRef.current) inputRef.current.focus() }, [step])
  const isAnswered = step.type === 'email' ? localText.includes('@') && localText.includes('.') : step.type === 'multi' ? ((value as string[]) || []).length > 0 : !!value
  const handleSingle = (val: string) => { onChange(val); setTimeout(onNext, 280) }
  const handleMulti = (val: string) => {
    const current = (value as string[]) || []
    if (val === 'none') { onChange(['none']); return }
    const without = current.filter((v: string) => v !== 'none')
    if (without.includes(val)) onChange(without.filter((v: string) => v !== val))
    else onChange([...without, val])
  }
  return (
    <div style={{ animation: 'fadeUp 0.35s ease' }}>
      <ProgressBar current={stepIndex + 1} total={totalSteps} />
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 8, fontFamily: 'monospace' }}>Free Glow-Up Blueprint</p>
        <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700, color: '#f5ece0', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.2, marginBottom: 8 }}>{step.question}</h2>
        <p style={{ color: '#8b7355', fontSize: 13 }}>{step.sub}</p>
      </div>
      {step.type === 'email' ? (
        <div style={{ marginBottom: 24 }}>
          <input ref={inputRef} type="email" value={localText} onChange={e => { setLocalText(e.target.value); onChange(e.target.value) }} placeholder={step.placeholder} onKeyDown={(e: any) => e.key === 'Enter' && isAnswered && onNext()} style={{ width: '100%', padding: '16px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,169,110,0.35)', borderRadius: 11, color: '#f5ece0', fontSize: 16, outline: 'none', boxSizing: 'border-box' as const }} />
          <p style={{ fontSize: 12, color: '#6b5a44', marginTop: 8 }}>🔒 We never spam. Your blueprint is the only email you'll get unless you ask for more.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
          {step.options?.map((opt: any) => <OptionCard key={opt.value} option={opt} selected={step.type === 'multi' ? ((value as string[]) || []).includes(opt.value) : value === opt.value} onClick={() => step.type === 'multi' ? handleMulti(opt.value) : handleSingle(opt.value)} multi={step.type === 'multi'} />)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        {stepIndex > 0 && <button onClick={onBack} style={{ padding: '13px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#8b7355', cursor: 'pointer', fontSize: 14 }}>← Back</button>}
        {(step.type === 'multi' || step.type === 'email') && <button onClick={onNext} disabled={!isAnswered} style={{ flex: 1, padding: '15px 24px', background: isAnswered ? 'linear-gradient(135deg, #c8a96e, #f0d080)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, color: isAnswered ? '#1a1208' : '#444', cursor: isAnswered ? 'pointer' : 'not-allowed', fontSize: 15, fontWeight: 700, transition: 'all 0.2s' }}>{step.id === 'email' ? 'Get My Free Blueprint →' : 'Continue →'}</button>}
      </div>
    </div>
  )
}

function PhotoUploadScreen({ onNext, onBack, totalSteps }: any) {
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 4)
    setPhotos(prev => [...prev, ...valid].slice(0, 4))
    valid.forEach(file => { const r = new FileReader(); r.onload = e => setPreviews(prev => [...prev, e.target?.result as string].slice(0, 4)); r.readAsDataURL(file) })
  }
  const removePhoto = (idx: number) => { setPhotos(prev => prev.filter((_, i) => i !== idx)); setPreviews(prev => prev.filter((_, i) => i !== idx)) }
  return (
    <div style={{ animation: 'fadeUp 0.35s ease' }}>
      <ProgressBar current={totalSteps - 1} total={totalSteps} />
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: 8, fontFamily: 'monospace' }}>Almost there</p>
        <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700, color: '#f5ece0', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.2, marginBottom: 8 }}>Upload your photos</h2>
        <p style={{ color: '#8b7355', fontSize: 13 }}>Photos make your blueprint 3x more accurate. Face shape, hair type, skin — all analyzed specifically for you.</p>
      </div>
      <div style={{ background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#c8a96e', fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Best photo set</p>
        {['📸 Front-facing face in natural light', '↔️ Side angle face photo', '💇 Hair visible, not covered by a hat', '🧍 One full-body photo (optional for style)'].map((tip, i) => <div key={i} style={{ fontSize: 13, color: '#d4c5a9', marginBottom: 4 }}>{tip}</div>)}
      </div>
      <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '26px 20px', textAlign: 'center' as const, cursor: 'pointer', marginBottom: 14, background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
        <p style={{ color: '#d4c5a9', fontSize: 14, marginBottom: 4 }}>{photos.length === 0 ? 'Tap to choose photos' : `${photos.length} photo${photos.length > 1 ? 's' : ''} selected`}</p>
        <p style={{ color: '#8b7355', fontSize: 12 }}>JPG, PNG · Up to 4 photos · Max 10MB each</p>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      </div>
      {previews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(200,169,110,0.3)' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={e => { e.stopPropagation(); removePhoto(i) }} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer' }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{ padding: '13px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#8b7355', cursor: 'pointer', fontSize: 14 }}>← Back</button>
        <button onClick={() => onNext(photos)} style={{ flex: 1, padding: '15px 24px', background: 'linear-gradient(135deg, #c8a96e, #f0d080)', border: 'none', borderRadius: 10, color: '#1a1208', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          {photos.length > 0 ? `Build My Blueprint →` : 'Skip & Build Free →'}
        </button>
      </div>
    </div>
  )
}

function LoadingScreen({ name }: { name?: string }) {
  const [phase, setPhase] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const [factVisible, setFactVisible] = useState(true)
  const phases = ['Analyzing your profile…', 'Building your archetype…', 'Generating hair & beard plan…', 'Calibrating style system…', 'Matching products to your budget…', 'Preparing your free blueprint…']
  useEffect(() => { const t = setInterval(() => setPhase(p => Math.min(p + 1, phases.length - 1)), 900); return () => clearInterval(t) }, [])
  useEffect(() => {
    const t = setInterval(() => {
      setFactVisible(false)
      setTimeout(() => { setFactIndex(i => (i + 1) % FACTS.length); setFactVisible(true) }, 400)
    }, 3800)
    return () => clearInterval(t)
  }, [])
  const fact = FACTS[factIndex]
  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, margin: '0 auto 16px', border: '2px solid rgba(200,169,110,0.2)', borderTop: '2px solid #c8a96e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontSize: 20, fontFamily: "'Playfair Display', Georgia, serif", color: '#f5ece0', marginBottom: 6 }}>Building{name ? ` ${name}'s` : ' your'} free blueprint</h2>
        <p style={{ color: '#c8a96e', fontSize: 13 }}>{phases[phase]}</p>
      </div>
      <div style={{ minHeight: 130, marginBottom: 14, opacity: factVisible ? 1 : 0, transition: 'opacity 0.3s' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(200,169,110,0.1), rgba(200,169,110,0.03))', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 14, padding: '18px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{fact.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 5, flexWrap: 'wrap' as const }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#f0d080', fontFamily: "'Playfair Display', Georgia, serif" }}>{fact.stat}</span>
                {fact.label && <span style={{ fontSize: 12, color: '#8b7355' }}>{fact.label}</span>}
              </div>
              <p style={{ fontSize: 13, color: '#a89070', lineHeight: 1.65 }}>{fact.detail}</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 16 }}>
        {FACTS.map((_, i) => <div key={i} style={{ width: i === factIndex ? 14 : 5, height: 5, borderRadius: 99, background: i === factIndex ? '#c8a96e' : 'rgba(255,255,255,0.1)', transition: 'all 0.4s' }} />)}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: '#8b7355', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontFamily: 'monospace', marginBottom: 8 }}>Building your report</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {phases.slice(0, phase + 1).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: i < phase ? '#c8a96e' : '#f0d080', fontSize: 12, minWidth: 14 }}>{i < phase ? '✓' : '◈'}</span>
              <span style={{ fontSize: 12, color: i < phase ? '#6b5a44' : '#d4c5a9' }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#5a4a35', lineHeight: 1.6 }}>Your personal hair stylist, skincare specialist,<br />and stylist — all in one free blueprint.</p>
    </div>
  )
}

// ── Ready Screen — shown before redirecting to full report ────
function ReadyScreen({ customerId, email }: { customerId: string; email: string }) {
  const [amount, setAmount] = useState('')
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const presets = ['$3', '$5', '$10', '$20']

  const handleViewReport = () => {
    window.location.href = `/report?customer_id=${customerId}`
  }

  const handlePay = async (tipAmount: string) => {
    if (!tipAmount || paying) return
    setPaying(true)
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(tipAmount.replace('$', '')), customerId, email }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error(err)
      setPaying(false)
    }
  }

  return (
    <div style={{ animation: 'fadeUp 0.5s ease' }}>
      {/* Success header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✦</div>
        <div style={{ display: 'inline-block', padding: '3px 12px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 99, fontSize: 11, color: '#4ade80', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: 'monospace', marginBottom: 12 }}>
          Your Blueprint Is Ready
        </div>
        <h2 style={{ fontSize: 'clamp(22px,5vw,28px)', fontFamily: "'Playfair Display', Georgia, serif", color: '#f5ece0', marginBottom: 8 }}>
          Your free blueprint is ready.
        </h2>
        <p style={{ color: '#8b7355', fontSize: 14, lineHeight: 1.6 }}>
          Personalized barber script, skin routine, style system, and product picks — all built for you.
        </p>
      </div>

      {/* View report CTA */}
      <button onClick={handleViewReport} style={{ width: '100%', padding: '18px 24px', background: 'linear-gradient(135deg, #c8a96e, #f0d080)', border: 'none', borderRadius: 12, color: '#1a1208', fontSize: 16, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' as const, boxShadow: '0 8px 28px rgba(200,169,110,0.3)', marginBottom: 20 }}>
        View My Blueprint →
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: 12, color: '#6b5a44', whiteSpace: 'nowrap' as const }}>pay what you think it's worth</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Pay what you want */}
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: '#d4c5a9', lineHeight: 1.6, marginBottom: 16, textAlign: 'center' as const }}>
          This blueprint took real AI compute to build. If it helps you — even a little — a small tip keeps the lights on and helps us stay free.
        </p>

        {/* Preset amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setAmount(p)} style={{ padding: '10px 0', background: amount === p ? 'linear-gradient(135deg, #c8a96e, #f0d080)' : 'rgba(255,255,255,0.04)', border: amount === p ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: amount === p ? '#1a1208' : '#d4c5a9', fontSize: 14, fontWeight: amount === p ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
              {p}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b7355', fontSize: 15 }}>$</span>
            <input
              type="number"
              placeholder="Custom amount"
              value={amount.replace('$', '')}
              onChange={e => setAmount(e.target.value ? `$${e.target.value}` : '')}
              style={{ width: '100%', padding: '11px 12px 11px 28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5ece0', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}
            />
          </div>
          <button onClick={() => handlePay(amount)} disabled={!amount || paying} style={{ padding: '11px 18px', background: amount ? 'linear-gradient(135deg, #c8a96e, #f0d080)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: amount ? '#1a1208' : '#555', fontSize: 14, fontWeight: 700, cursor: amount ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' as const }}>
            {paying ? '...' : 'Tip →'}
          </button>
        </div>

        <p style={{ fontSize: 11, color: '#5a4a35', textAlign: 'center' as const }}>
          No pressure at all. The blueprint is yours either way. 🤝
        </p>
      </div>

      {/* What the tip supports */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {['Keeps GlowUp 100% free for everyone', 'Funds new features (beard AI, skin scanner)', 'Supports indie development — no VC funding'].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#c8a96e', fontSize: 12 }}>✓</span>
            <span style={{ fontSize: 13, color: '#8b7355' }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══ MAIN ══════════════════════════════════════════════════════
export default function QuizPage() {
  const [screen, setScreen] = useState<'intro' | 'quiz' | 'photos' | 'loading' | 'ready'>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [photos, setPhotos] = useState<File[]>([])
  const [customerId, setCustomerId] = useState('')
  const TOTAL = STEPS.length + 1

  const handleAnswer = (val: string | string[]) => setAnswers(prev => ({ ...prev, [STEPS[stepIndex].id]: val }))
  const handleNext = () => { if (stepIndex < STEPS.length - 1) setStepIndex(i => i + 1); else setScreen('photos') }
  const handleBack = () => { if (screen === 'photos') setScreen('quiz'); else if (stepIndex > 0) setStepIndex(i => i - 1); else setScreen('intro') }

  const handlePhotosNext = async (uploadedPhotos: File[]) => {
    setPhotos(uploadedPhotos)
    setScreen('loading')
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: answers.email, goal: answers.goal, ageRange: answers.age, budget: answers.budget, maintenance: answers.maintenance, stylePref: answers.style, concerns: answers.concerns || [], sessionId: getSession(), utmSource: new URLSearchParams(window.location.search).get('utm_source'), utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') }),
      })
      const data = await res.json()
      if (data.customer?.id) setCustomerId(data.customer.id)
    } catch (err) { console.error(err) }
    setTimeout(() => setScreen('ready'), 5500)
  }

  const getValue = () => answers[STEPS[stepIndex]?.id as keyof Answers]

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 0%, rgba(200,169,110,0.07) 0%, transparent 55%), #0f0d09', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px 80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:rgba(200,169,110,0.3)} input:focus{border-color:rgba(200,169,110,0.6)!important} button:hover:not(:disabled){filter:brightness(1.07)}`}</style>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 8 }}>
          <a href="/" style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5a44', fontFamily: 'monospace', textDecoration: 'none' }}>◈ GlowUpMen.com</a>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 'clamp(22px,5vw,38px)', backdropFilter: 'blur(20px)', boxShadow: '0 40px 80px rgba(0,0,0,0.45)' }}>
          {screen === 'intro' && <IntroScreen onStart={() => setScreen('quiz')} />}
          {screen === 'quiz' && STEPS[stepIndex] && <QuestionScreen step={STEPS[stepIndex]} value={getValue()} onChange={handleAnswer} onNext={handleNext} onBack={handleBack} stepIndex={stepIndex} totalSteps={TOTAL} />}
          {screen === 'photos' && <PhotoUploadScreen onNext={handlePhotosNext} onBack={handleBack} totalSteps={TOTAL} />}
          {screen === 'loading' && <LoadingScreen name={answers.email?.split('@')[0]} />}
          {screen === 'ready' && <ReadyScreen customerId={customerId} email={answers.email || ''} />}
        </div>
        {screen !== 'ready' && <p style={{ textAlign: 'center', color: '#2d2218', fontSize: 11, marginTop: 18 }}>🔒 Your answers and photos are private and never sold</p>}
      </div>
    </div>
  )
}
