// lib/product-matching.ts
// ─────────────────────────────────────────────────────────────
// CORE ENGINE: Takes AI report output + customer profile,
// queries Supabase for matching products, returns ranked results
// ─────────────────────────────────────────────────────────────

import { supabaseAdmin, AffiliateProduct, Category, Customer } from './supabase'

// ── Input shape from AI report + customer answers ─────────────
export interface MatchingInput {
  customerId: string
  archetype: string          // "Structured, masculine, composed"
  archetypeSlug: string      // "structured-masculine"
  goal: string               // "dating" | "professional" | etc
  budget: string             // "budget" | "mid" | "premium"
  stylePref: string          // "clean" | "streetwear" | "rugged" | "sharp"
  concerns: string[]         // ["skin", "beard"]
  aiReport?: any             // full GlowReport JSON for deeper extraction
}

// ── Per-section result ────────────────────────────────────────
export interface SectionMatch {
  products: AffiliateProduct[]
  section: Category
  aiContext: string          // the AI text that informed this section
}

// ── Full match output ─────────────────────────────────────────
export interface MatchResult {
  tops: SectionMatch
  pants: SectionMatch
  jackets: SectionMatch
  shoes: SectionMatch
  grooming: SectionMatch
  bundles: BundleMatch[]
}

export interface BundleMatch {
  id: string
  label: string
  emoji: string
  description: string
  products: AffiliateProduct[]
}

// ─────────────────────────────────────────────────────────────
// ARCHETYPE SLUG EXTRACTOR
// Converts AI text like "Structured, masculine, composed"
// into a matchable slug like "structured-masculine"
// ─────────────────────────────────────────────────────────────
export function extractArchetypeSlug(archetypeText: string): string {
  const text = archetypeText.toLowerCase()

  if (text.includes('structured') || text.includes('masculine') || text.includes('composed')) {
    return 'structured-masculine'
  }
  if (text.includes('rugged') || text.includes('outdoors') || text.includes('athletic')) {
    return 'rugged'
  }
  if (text.includes('streetwear') || text.includes('urban') || text.includes('casual')) {
    return 'streetwear'
  }
  if (text.includes('sharp') || text.includes('professional') || text.includes('executive')) {
    return 'sharp'
  }
  if (text.includes('clean') || text.includes('classic') || text.includes('minimal')) {
    return 'clean-classic'
  }
  return 'clean-classic' // default fallback
}

// ─────────────────────────────────────────────────────────────
// BUDGET NORMALIZER
// Maps customer budget answer to allowed tiers
// ─────────────────────────────────────────────────────────────
function getBudgetTiers(budget: string): string[] {
  switch (budget) {
    case 'diy':     return ['budget']
    case 'budget':  return ['budget']
    case 'mid':     return ['budget', 'mid']
    case 'premium': return ['budget', 'mid', 'premium']
    default:        return ['budget', 'mid']
  }
}

// ─────────────────────────────────────────────────────────────
// CORE MATCHER — queries DB for a single category
// ─────────────────────────────────────────────────────────────
async function matchCategory(
  category: Category,
  input: MatchingInput,
  limit = 4
): Promise<AffiliateProduct[]> {
  const allowedTiers = getBudgetTiers(input.budget)

  // Build the query — uses GIN indexes for tag matching
  let query = supabaseAdmin
    .from('affiliate_products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .in('tier', allowedTiers)
    .order('sort_order', { ascending: true })
    .order('total_clicks', { ascending: false })

  const { data, error } = await query.limit(20) // get more than needed, then score

  if (error || !data) {
    console.error(`matchCategory error for ${category}:`, error)
    return []
  }

  // ── Score each product based on tag overlap ───────────────
  const scored = data.map((product: AffiliateProduct) => {
    let score = 0

    // Archetype match (highest weight — 40 points max)
    if (product.archetype_tags?.includes(input.archetypeSlug)) score += 40

    // Goal match (30 points)
    if (product.goal_tags?.includes(input.goal)) score += 30

    // Style pref match (20 points)
    if (product.style_tags?.some(t => t.includes(input.stylePref))) score += 20

    // Concern match (10 points per concern)
    input.concerns.forEach(concern => {
      if (product.concern_tags?.includes(concern)) score += 10
    })

    // Featured boost (+15)
    if (product.is_featured) score += 15

    // Prefer exact budget tier match (+10 vs allowed but not exact)
    const exactTier = input.budget === 'diy' ? 'budget' : input.budget
    if (product.tier === exactTier) score += 10

    return { product, score }
  })

  // Sort by score, return top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.product)
}

// ─────────────────────────────────────────────────────────────
// EXTRACT AI CONTEXT from the report JSON
// Pulls relevant AI text for each section
// ─────────────────────────────────────────────────────────────
function extractAiContext(section: Category, aiReport: any): string {
  if (!aiReport) return ''

  try {
    switch (section) {
      case 'tops':
        return aiReport.style_system?.core_items?.join(', ') || ''
      case 'pants':
        return aiReport.style_system?.fit_rules?.join(', ') || ''
      case 'jackets':
        return aiReport.style_system?.outfits?.casual?.join(', ') || ''
      case 'shoes':
        return aiReport.style_system?.image_queries?.join(', ') || ''
      case 'grooming':
        return aiReport.skin_plan?.routine?.daily?.join(', ') || ''
      default:
        return ''
    }
  } catch {
    return ''
  }
}

// ─────────────────────────────────────────────────────────────
// BUNDLE BUILDER — creates outfit kits from matched products
// ─────────────────────────────────────────────────────────────
async function buildBundles(input: MatchingInput): Promise<BundleMatch[]> {
  const bundles: BundleMatch[] = []

  // Dating kit
  if (['dating', 'social', 'confidence'].includes(input.goal)) {
    const [top, pant, shoe, jacket] = await Promise.all([
      matchCategory('tops', { ...input, goal: 'dating' }, 1),
      matchCategory('pants', { ...input, goal: 'dating' }, 1),
      matchCategory('shoes', { ...input, goal: 'dating' }, 1),
      matchCategory('jackets', { ...input, goal: 'dating' }, 1),
    ])

    bundles.push({
      id: 'dating-kit',
      label: 'Dating Night Kit',
      emoji: '🔥',
      description: 'Complete outfit system for maximum attraction',
      products: [...top, ...pant, ...shoe, ...jacket].filter(Boolean),
    })
  }

  // Professional kit
  if (['professional', 'confidence'].includes(input.goal)) {
    const [top, pant, shoe, jacket] = await Promise.all([
      matchCategory('tops', { ...input, goal: 'professional' }, 1),
      matchCategory('pants', { ...input, goal: 'professional' }, 1),
      matchCategory('shoes', { ...input, goal: 'professional' }, 1),
      matchCategory('jackets', { ...input, goal: 'professional' }, 1),
    ])

    bundles.push({
      id: 'professional-kit',
      label: 'Professional Upgrade Pack',
      emoji: '💼',
      description: 'Sharp, credible, put-together for any work context',
      products: [...top, ...pant, ...shoe, ...jacket].filter(Boolean),
    })
  }

  // Low maintenance daily kit
  bundles.push({
    id: 'daily-kit',
    label: 'Low Maintenance Daily',
    emoji: '⚡',
    description: 'Grab-and-go basics that always look intentional',
    products: (await Promise.all([
      matchCategory('tops', { ...input }, 1),
      matchCategory('pants', { ...input }, 1),
      matchCategory('shoes', { ...input }, 1),
    ])).flat().filter(Boolean),
  })

  return bundles
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — call this from your API route
// ─────────────────────────────────────────────────────────────
export async function matchProductsForCustomer(
  input: MatchingInput
): Promise<MatchResult> {

  // Run all category queries in parallel
  const [tops, pants, jackets, shoes, grooming, bundles] = await Promise.all([
    matchCategory('tops', input, 4),
    matchCategory('pants', input, 4),
    matchCategory('jackets', input, 3),
    matchCategory('shoes', input, 4),
    matchCategory('grooming', input, 3),
    buildBundles(input),
  ])

  return {
    tops: {
      products: tops,
      section: 'tops',
      aiContext: extractAiContext('tops', input.aiReport),
    },
    pants: {
      products: pants,
      section: 'pants',
      aiContext: extractAiContext('pants', input.aiReport),
    },
    jackets: {
      products: jackets,
      section: 'jackets',
      aiContext: extractAiContext('jackets', input.aiReport),
    },
    shoes: {
      products: shoes,
      section: 'shoes',
      aiContext: extractAiContext('shoes', input.aiReport),
    },
    grooming: {
      products: grooming,
      section: 'grooming',
      aiContext: extractAiContext('grooming', input.aiReport),
    },
    bundles,
  }
}

// ─────────────────────────────────────────────────────────────
// SAVE RECOMMENDATIONS to DB
// Stores which products were shown — for analytics + A/B testing
// ─────────────────────────────────────────────────────────────
export async function saveRecommendations(
  customerId: string,
  matchResult: MatchResult
): Promise<void> {
  const rows: any[] = []

  const sections = ['tops', 'pants', 'jackets', 'shoes', 'grooming'] as const

  sections.forEach(section => {
    const sectionData = matchResult[section]
    sectionData.products.forEach((product, idx) => {
      rows.push({
        customer_id: customerId,
        product_id: product.id,
        match_reason: 'ai_tag_match',
        match_score: null,
        ai_context: sectionData.aiContext?.slice(0, 500) || null,
        section,
        position: idx + 1,
      })
    })
  })

  if (rows.length > 0) {
    const { error } = await supabaseAdmin
      .from('recommendations')
      .insert(rows)

    if (error) console.error('saveRecommendations error:', error)
  }
}
