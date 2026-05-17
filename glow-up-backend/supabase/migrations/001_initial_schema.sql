-- ═══════════════════════════════════════════════════════════════
-- GLOW-UP AI — COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. CUSTOMERS
-- Stores every person who goes through the questionnaire
-- ─────────────────────────────────────────────────────────────
CREATE TABLE customers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Identity
  name                TEXT,
  email               TEXT UNIQUE,

  -- Quiz answers (from questionnaire)
  goal                TEXT,        -- dating | professional | confidence | social
  age_range           TEXT,        -- 18-24 | 25-34 | 35-44 | 45+
  budget              TEXT,        -- diy | budget | mid | premium
  maintenance         TEXT,        -- minimal | moderate | dedicated
  style_pref          TEXT,        -- clean | streetwear | rugged | sharp
  concerns            TEXT[],      -- hairloss | skin | beard | weight | style_clueless

  -- Photo storage paths (Supabase Storage bucket: "customer-photos")
  photo_urls          TEXT[],

  -- AI analysis output
  archetype           TEXT,        -- "Structured, masculine, composed"
  archetype_slug      TEXT,        -- "structured-masculine" (used for product matching)
  ai_report           JSONB,       -- full GlowReport JSON
  report_version      INTEGER DEFAULT 1,

  -- Stripe
  stripe_customer_id  TEXT,
  has_paid            BOOLEAN DEFAULT FALSE,
  paid_at             TIMESTAMPTZ,

  -- Session / attribution
  session_id          TEXT,
  utm_source          TEXT,
  utm_medium          TEXT,
  utm_campaign        TEXT
);

-- ─────────────────────────────────────────────────────────────
-- 2. ORDERS
-- Every payment attempt and completion
-- ─────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  customer_id         UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Stripe
  stripe_payment_id   TEXT UNIQUE,
  stripe_session_id   TEXT,
  amount_cents        INTEGER,              -- 1900 = $19.00
  currency            TEXT DEFAULT 'usd',
  status              TEXT DEFAULT 'pending', -- pending | paid | refunded | failed

  -- Delivery
  product_type        TEXT DEFAULT 'blueprint', -- blueprint | bundle | upsell
  report_delivered    BOOLEAN DEFAULT FALSE,
  pdf_url             TEXT
);

-- ─────────────────────────────────────────────────────────────
-- 3. AFFILIATE PRODUCTS
-- Your full product catalog — editable from admin panel later
-- ─────────────────────────────────────────────────────────────
CREATE TABLE affiliate_products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Identity
  brand               TEXT NOT NULL,
  label               TEXT NOT NULL,
  slug                TEXT UNIQUE,  -- "thursday-boots-captain-chelsea"

  -- Categorization
  category            TEXT NOT NULL,  -- tops | pants | jackets | shoes | grooming | skincare | accessories
  subcategory         TEXT,           -- tshirt | button-up | chinos | jeans | chelsea | sneaker | moisturizer

  -- Pricing
  tier                TEXT NOT NULL,  -- budget | mid | premium
  price_min           INTEGER,        -- cents: 1500 = $15.00
  price_max           INTEGER,        -- cents: 2000 = $20.00
  price_display       TEXT,           -- "$15–$20"

  -- Affiliate data
  affiliate_url       TEXT NOT NULL,
  affiliate_network   TEXT,           -- amazon | rakuten | impact | shareasale | direct
  commission_pct      NUMERIC(5,2),   -- 8.00 = 8%

  -- Media
  image_url           TEXT,           -- primary product image
  image_urls          TEXT[],         -- multiple angles/colors

  -- ── AI Matching Tags ──────────────────────────────────────
  -- These are what the AI uses to pick the right products
  archetype_tags      TEXT[],  -- structured-masculine | rugged | streetwear | clean-classic | sharp
  style_tags          TEXT[],  -- casual | dating | professional | smart-casual | social | everyday
  goal_tags           TEXT[],  -- dating | professional | confidence | social
  concern_tags        TEXT[],  -- hairloss | skin | beard | weight | style_clueless
  color_options       TEXT[],  -- ["Black", "Navy", "Olive"]

  -- Conversion copy
  badge               TEXT,    -- "Best Value 🔥" | "Social Weapon" | "High Impact" | "Most Versatile"
  conversion_note     TEXT,    -- "Most clients upgrade here"

  -- Admin controls
  is_active           BOOLEAN DEFAULT TRUE,
  is_featured         BOOLEAN DEFAULT FALSE,
  sort_order          INTEGER DEFAULT 0,

  -- Analytics counters (updated by triggers)
  total_clicks        INTEGER DEFAULT 0,
  total_purchases     INTEGER DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────
-- 4. RECOMMENDATIONS
-- Which products were matched and shown to which customer
-- This is the bridge between AI output and affiliate products
-- ─────────────────────────────────────────────────────────────
CREATE TABLE recommendations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),

  customer_id         UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id          UUID REFERENCES affiliate_products(id) ON DELETE CASCADE,

  -- Why this product was recommended
  match_reason        TEXT,    -- "archetype_tag" | "goal_tag" | "budget_match" | "ai_direct"
  match_score         NUMERIC(5,2),  -- 0.00–100.00 relevance score
  ai_context          TEXT,    -- the AI text that triggered this recommendation

  -- Where it appeared in the report
  section             TEXT,    -- tops | pants | shoes | jackets | grooming
  position            INTEGER, -- 1 = first card shown in that section

  -- Conversion tracking
  was_clicked         BOOLEAN DEFAULT FALSE,
  clicked_at          TIMESTAMPTZ,
  was_purchased       BOOLEAN DEFAULT FALSE,
  purchased_at        TIMESTAMPTZ,
  estimated_revenue   NUMERIC(10,2)  -- commission_pct * product price
);

-- ─────────────────────────────────────────────────────────────
-- 5. AFFILIATE CLICKS (raw event log)
-- Every "Shop Now" click recorded here
-- ─────────────────────────────────────────────────────────────
CREATE TABLE affiliate_clicks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),

  customer_id         UUID REFERENCES customers(id) ON DELETE SET NULL,
  product_id          UUID REFERENCES affiliate_products(id) ON DELETE SET NULL,
  recommendation_id   UUID REFERENCES recommendations(id) ON DELETE SET NULL,

  -- Context at time of click
  session_id          TEXT,
  brand               TEXT,
  category            TEXT,
  tier                TEXT,
  section             TEXT,

  -- Device info
  user_agent          TEXT,
  referrer            TEXT
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES — for fast product matching queries
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_customers_email        ON customers(email);
CREATE INDEX idx_customers_archetype    ON customers(archetype_slug);
CREATE INDEX idx_customers_goal         ON customers(goal);
CREATE INDEX idx_customers_budget       ON customers(budget);
CREATE INDEX idx_orders_customer        ON orders(customer_id);
CREATE INDEX idx_orders_status          ON orders(status);
CREATE INDEX idx_products_category      ON affiliate_products(category);
CREATE INDEX idx_products_tier          ON affiliate_products(tier);
CREATE INDEX idx_products_active        ON affiliate_products(is_active);
CREATE INDEX idx_products_archetype_tags ON affiliate_products USING GIN(archetype_tags);
CREATE INDEX idx_products_goal_tags     ON affiliate_products USING GIN(goal_tags);
CREATE INDEX idx_products_style_tags    ON affiliate_products USING GIN(style_tags);
CREATE INDEX idx_recs_customer          ON recommendations(customer_id);
CREATE INDEX idx_recs_product           ON recommendations(product_id);
CREATE INDEX idx_clicks_customer        ON affiliate_clicks(customer_id);
CREATE INDEX idx_clicks_product         ON affiliate_clicks(product_id);
CREATE INDEX idx_clicks_created         ON affiliate_clicks(created_at);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks    ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable (anyone can see the catalog)
CREATE POLICY "Products public read"
  ON affiliate_products FOR SELECT USING (is_active = TRUE);

-- Customers can only see their own row
CREATE POLICY "Customers own data"
  ON customers FOR SELECT
  USING (auth.uid()::text = id::text);

-- Customers see their own recommendations
CREATE POLICY "Customers own recommendations"
  ON recommendations FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth.uid()::text = id::text
    )
  );

-- ─────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON affiliate_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- CLICK COUNTER TRIGGER
-- Auto-increments total_clicks on affiliate_products
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_product_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE affiliate_products
  SET total_clicks = total_clicks + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_affiliate_click
  AFTER INSERT ON affiliate_clicks
  FOR EACH ROW EXECUTE FUNCTION increment_product_clicks();
