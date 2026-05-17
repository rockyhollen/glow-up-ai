// lib/supabase.ts
// ─────────────────────────────────────────────────────────────
// Supabase client — use supabaseAdmin for server-side API routes
// Use supabase (anon) for client-side reads only
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side (public, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side (bypasses RLS — use ONLY in API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─────────────────────────────────────────────────────────────
// DATABASE TYPES
// ─────────────────────────────────────────────────────────────

export type Tier = 'budget' | 'mid' | 'premium'
export type Category = 'tops' | 'pants' | 'jackets' | 'shoes' | 'grooming' | 'skincare' | 'accessories'
export type Goal = 'dating' | 'professional' | 'confidence' | 'social'
export type Budget = 'diy' | 'budget' | 'mid' | 'premium'

export interface AffiliateProduct {
  id: string
  created_at: string
  updated_at: string
  brand: string
  label: string
  slug: string
  category: Category
  subcategory: string
  tier: Tier
  price_min: number
  price_max: number
  price_display: string
  affiliate_url: string
  affiliate_network: string
  commission_pct: number
  image_url: string
  image_urls: string[]
  archetype_tags: string[]
  style_tags: string[]
  goal_tags: string[]
  concern_tags: string[]
  color_options: string[]
  badge: string
  conversion_note: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  total_clicks: number
  total_purchases: number
}

export interface Customer {
  id: string
  created_at: string
  name: string
  email: string
  goal: Goal
  age_range: string
  budget: Budget
  maintenance: string
  style_pref: string
  concerns: string[]
  photo_urls: string[]
  archetype: string
  archetype_slug: string
  ai_report: any
  stripe_customer_id: string
  has_paid: boolean
  paid_at: string
  session_id: string
}

export interface Order {
  id: string
  created_at: string
  customer_id: string
  stripe_payment_id: string
  amount_cents: number
  status: 'pending' | 'paid' | 'refunded' | 'failed'
  product_type: string
  report_delivered: boolean
  pdf_url: string
}

export interface Recommendation {
  id: string
  created_at: string
  customer_id: string
  product_id: string
  match_reason: string
  match_score: number
  ai_context: string
  section: string
  position: number
  was_clicked: boolean
  was_purchased: boolean
  product?: AffiliateProduct
}

// Grouped recommendations by section — used in the UI
export interface RecommendationsBySection {
  tops: AffiliateProduct[]
  pants: AffiliateProduct[]
  jackets: AffiliateProduct[]
  shoes: AffiliateProduct[]
  grooming: AffiliateProduct[]
}
