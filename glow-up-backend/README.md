# Glow-Up AI — Backend Database & Architecture

## What This Is

A complete backend system that:
1. Stores every customer who takes the quiz
2. Saves their AI report output
3. Dynamically matches affiliate products to their archetype/goal/budget
4. Tracks every "Shop Now" click for analytics
5. Handles Stripe payments and unlocks reports

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `customers` | Everyone who takes the quiz — quiz answers, photos, AI report, payment status |
| `orders` | Every Stripe payment — linked to customer |
| `affiliate_products` | Your full product catalog with matching tags |
| `recommendations` | Which products were shown to which customer — conversion tracking |
| `affiliate_clicks` | Raw click log — every "Shop Now" tap |

---

## How the Matching Works

```
Customer takes quiz
  → Answers saved to customers table
  → Photos uploaded to Supabase Storage

Customer pays ($19)
  → Stripe webhook fires
  → Order saved, customer marked as paid

OpenAI generates report
  → Archetype extracted: "Structured, masculine, composed"
  → Slug created: "structured-masculine"

POST /api/recommendations
  → Queries affiliate_products WHERE archetype_tags contains "structured-masculine"
  → Filters by customer budget (mid = budget + mid tier products)
  → Scores each product by: archetype match (40pts) + goal match (30pts) + style match (20pts)
  → Returns top 4 per section
  → Saves to recommendations table

Customer sees Shopping Blueprint
  → Dynamic cards with their matched products
  → Affiliate links pulled from DB
  → Every click tracked in affiliate_clicks
```

---

## Setup Instructions

### Step 1 — Create Supabase Project
1. Go to supabase.com → New Project
2. Name it "glow-up-ai"
3. Save your database password somewhere safe
4. Wait ~2 minutes for it to spin up

### Step 2 — Run the Schema
1. In Supabase dashboard → SQL Editor
2. Paste and run `001_initial_schema.sql`
3. Then paste and run `002_seed_products.sql`
4. You should see 5 tables and ~20 products in Table Editor

### Step 3 — Get Your Keys
From Supabase → Settings → API:
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4 — Add to .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Step 5 — Install Supabase package
```bash
npm install @supabase/supabase-js
```

### Step 6 — Copy files to your repo
```
lib/supabase.ts          → your-repo/lib/supabase.ts
lib/product-matching.ts  → your-repo/lib/product-matching.ts
app/api/recommendations/ → your-repo/app/api/recommendations/
app/api/affiliate-click/ → your-repo/app/api/affiliate-click/
app/api/customers/       → your-repo/app/api/customers/
app/api/webhook/         → your-repo/app/api/webhook/
```

### Step 7 — Set up Supabase Storage
1. Supabase → Storage → New Bucket
2. Name: `customer-photos`
3. Public: NO (private — only your service key can read)

---

## Adding New Products

Just insert a row into `affiliate_products` with the right tags:

```sql
INSERT INTO affiliate_products (brand, label, category, tier, affiliate_url, archetype_tags, goal_tags, ...)
VALUES ('New Brand', 'Product Name', 'shoes', 'mid', 'https://...', 
        ARRAY['structured-masculine'], ARRAY['dating'], ...);
```

Or use the Supabase Table Editor — no code needed.

---

## Archetype Slugs (for tag matching)

| AI Output | Slug to use in tags |
|-----------|-------------------|
| "Structured, masculine, composed" | `structured-masculine` |
| "Rugged, athletic, outdoorsy" | `rugged` |
| "Urban, streetwear, casual" | `streetwear` |
| "Sharp, professional, executive" | `sharp` |
| "Clean, classic, minimal" | `clean-classic` |

---

## Affiliate Networks to Join

| Brand | Network | Commission | Apply At |
|-------|---------|-----------|---------|
| Uniqlo | Rakuten | 3% | rakuten.com/apply |
| Everlane | Impact | 8% | impact.com |
| Adidas | Impact | 7% | impact.com |
| Thursday Boot Co. | Impact | 10% | impact.com |
| Bonobos | Impact | 6% | impact.com |
| Cole Haan | Rakuten | 6% | rakuten.com/apply |
| Clarks | Rakuten | 5% | rakuten.com/apply |
| Beardbrand | ShareASale | 12% | shareasale.com |
| Baxter of California | ShareASale | 10% | shareasale.com |

**Start with Impact** — they have the most brands and fastest approval.
Once approved, replace `affiliate_url` values in the DB with your tracking links.
