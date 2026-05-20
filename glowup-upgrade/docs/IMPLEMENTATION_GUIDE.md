# GLOW-UP AI — Complete Upgrade Package
## Implementation Guide

---

## WHAT THIS PACKAGE INCLUDES

| File | Purpose |
|------|---------|
| `app/quiz/page.tsx` | Full 7-step questionnaire campaign flow |
| `app/report/page.tsx` | Post-payment report with dynamic affiliate products |
| `app/api/checkout/route.ts` | Updated Stripe checkout with customerId |
| `app/api/generate/route.ts` | OpenAI report generation tied to Supabase |

---

## THE FULL FLOW (how everything connects)

```
User lands on glowupmen.com
  ↓ clicks "Get My Blueprint" or "Try Demo"
  ↓
glowupmen.com/quiz
  ↓ 7 questions (goal → age → budget → maintenance → style → concerns → email)
  ↓ Loading screen (5 seconds)
  ↓ Paywall preview (archetype teaser + locked sections)
  ↓ clicks "Unlock My Full Blueprint →"
  ↓
Stripe Checkout ($19)
  ↓ payment success
  ↓
glowupmen.com/report?customer_id=xxx&session_id=xxx
  ↓ webhook marks customer as paid
  ↓ OpenAI generates full report
  ↓ Product matching queries Supabase for affiliate picks
  ↓ Full report + Shopping Blueprint displayed
```

---

## STEP-BY-STEP INSTALLATION

### Step 1 — Navigate to your project
```bash
cd "/Users/rockyhollenbaugh/Library/Mobile Documents/com~apple~CloudDocs/glow-up-ai-4"
```

### Step 2 — Create the new folders
```bash
mkdir -p app/quiz app/report
```

### Step 3 — Copy the files
Download all 4 files from Claude, then:
```bash
cp ~/Downloads/quiz-page.tsx app/quiz/page.tsx
cp ~/Downloads/report-page.tsx app/report/page.tsx
cp ~/Downloads/checkout-route.ts app/api/checkout/route.ts
cp ~/Downloads/generate-route.ts app/api/generate/route.ts
```

### Step 4 — Update your landing page CTA buttons
In your `app/page.tsx`, find the "Get My Blueprint" button and update:
```tsx
// BEFORE
<a href="/api/checkout">Get My Blueprint</a>

// AFTER  
<a href="/quiz">Get My Blueprint</a>
```

Also update "Try demo" / "Test without payment":
```tsx
// BEFORE
<a href="/upload">Test without payment</a>

// AFTER
<a href="/quiz">Try free preview</a>
```

### Step 5 — Add env var for app URL
Open `.env.local` and verify this line exists:
```
NEXT_PUBLIC_APP_URL=https://glowupmen.com
```

Also add to Vercel → Environment Variables.

### Step 6 — Test locally
```bash
npm run dev
```
Visit localhost:3000/quiz — walk through all 7 steps.
Check that the paywall shows at the end.
Check that clicking "Unlock" triggers checkout.

### Step 7 — Push to GitHub → Vercel
```bash
git add .
git commit -m "add quiz flow, report page, updated checkout and generate"
git push origin main
```

Vercel auto-deploys. Visit glowupmen.com/quiz when green.

---

## SUPABASE — DATABASE UPDATES NEEDED

Run this in Supabase SQL Editor to add the `name` column if missing:

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS name TEXT;
```

Verify your customers table has these columns:
- id, email, goal, age_range, budget, maintenance, style_pref
- concerns (TEXT[]), photo_urls (TEXT[])
- archetype, archetype_slug, ai_report (JSONB)
- has_paid, paid_at, stripe_customer_id
- session_id, utm_source, utm_campaign

---

## LANDING PAGE — CTA UPDATE

Find the "Get My Blueprint" button on your homepage and change the href to `/quiz`.
This routes all paid traffic through the questionnaire first — higher conversion.

---

## ADDITIONAL TOOLS RECOMMENDED

### Resend (free email — resend.com)
Send the report PDF by email after purchase.
```bash
npm install resend
```
Add to `.env.local`:
```
RESEND_API_KEY=re_...
```

### Vercel Analytics (free)
Already in your Vercel dashboard — just enable it.
Tracks which pages convert, where people drop off.

### PostHog (free tier — posthog.com)
Funnel analytics — see exactly where in the quiz people drop off.
```bash
npm install posthog-js
```

### Stripe Customer Portal
Lets customers re-download their report.
Enable at dashboard.stripe.com → Settings → Customer Portal.

---

## MARKETING — WHAT TO DO THIS WEEK

### Day 1-2: TikTok content
Film a 60-second video showing:
1. "I paid $19 for an AI appearance report — here's what I got"
2. Show the barber script on screen
3. Show the product recommendations
4. Show the archetype reveal

This format goes viral in the men's grooming space.

### Day 3-4: Reddit
Post in these subreddits (helpful content, not ads):
- r/malefashionadvice
- r/malegrooming  
- r/Tinder
- r/dating_advice
- r/looksmaxing

Share a sample report. Include your link in comments when asked.

### Day 5-7: Instagram
DM 20 men's barbers with 5k-50k followers.
Offer them a free report for their clients in exchange for a story post.
One barber post = 30-100 new visitors.

---

## REVENUE PROJECTIONS

At current $19 price point:
- 10 customers/month = $190/month
- 50 customers/month = $950/month  
- 100 customers/month = $1,900/month
- 500 customers/month = $9,500/month

Plus affiliate revenue:
- Every "Shop Now" click that converts = 5-12% commission
- Average order value ~$80-150
- 100 customers clicking = estimated $40-180 affiliate/month

---

## TROUBLESHOOTING

**Quiz page blank:** Check browser console for errors. Usually a missing font import.

**Checkout not working:** Verify STRIPE_SECRET_KEY is set in both .env.local and Vercel.

**Report page empty:** Check that /api/generate is returning data. Check OPENAI_API_KEY.

**Products not showing:** Verify Supabase keys are set and affiliate_products table has rows.

**Build fails:** Run `npm run build` locally first to see exact errors before pushing.
