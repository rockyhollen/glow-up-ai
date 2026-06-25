// lib/product-matching.ts
// ─────────────────────────────────────────────────────────────
// CORE ENGINE: Takes AI report output + customer profile,
// queries Supabase for matching products, returns ranked results
// ─────────────────────────────────────────────────────────────

import { supabaseAdmin } from './supabase-admin'
import { AffiliateProduct, Category, Customer } from './supabase'

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
  if (!aiReport || typeof aiReport !== 'object') return ''

  try {
    switch (section) {
      case 'tops':
        // Extract core items from style_system
        return aiReport.style_system?.core_items?.join(', ') || ''
      case 'pants':
        // Extract fit rules from style_system
        return aiReport.style_system?.fit_rules?.join(', ') || ''
      case 'jackets':
        // Extract casual outfit suggestions from style_system
        return aiReport.style_system?.outfits?.casual?.join(', ') || ''
      case 'shoes':
        // Fixed: Extract from style_system.image_queries (not a non-existent field)
        return aiReport.style_system?.image_queries?.join(', ') || ''
      case 'grooming':
        // Extract daily skin routine from skin_plan
        return aiReport.skin_plan?.routine?.daily?.join(', ') || ''
      case 'skincare':
        // Extract skincare products/recommendations
        return aiReport.skin_plan?.assessment || ''
      case 'accessories':
        // Extract from behavioral optimization or presence notes
        return aiReport.behavioral_optimization?.presence?.join(', ') || 
               aiReport.presence_notes || ''
      default:
        return ''
    }
  } catch (error) {
    console.error(`extractAiContext error for section ${section}:`, error)
    return ''
  }
}

// ─────────────────────────────────────────────────────────────
// BUNDLE BUILDER — creates outfit kits from matched products
// ─────────────────────────────────────────────────────────────
async function buildBundles(input: MatchingInput): Promise<BundleMatch[]> {
  const bundles: BundleMatch[] = []

  try {
    // Dating kit
    if (['dating', 'social', 'confidence'].includes(input.goal)) {
      const [top, pant, shoe, jacket] = await Promise.all([
        matchCategory('tops', { ...input, goal: 'dating' }, 1),
        matchCategory('pants', { ...input, goal: 'dating' }, 1),
        matchCategory('shoes', { ...input, goal: 'dating' }, 1),
        matchCategory('jackets', { ...input, goal: 'dating' }, 1),
      ])

      const datingProducts = [...top, ...pant, ...shoe, ...jacket].filter(Boolean)
      if (datingProducts.length > 0) {
        bundles.push({
          id: 'dating-kit',
          label: 'Dating Night Kit',
          emoji: '🔥',
          description: 'Complete outfit system for maximum attraction',
          products: datingProducts,
        })
      }
    }

    // Professional kit
    if (['professional', 'confidence'].includes(input.goal)) {
      const [top, pant, shoe, jacket] = await Promise.all([
        matchCategory('tops', { ...input, goal: 'professional' }, 1),
        matchCategory('pants', { ...input, goal: 'professional' }, 1),
        matchCategory('shoes', { ...input, goal: 'professional' }, 1),
        matchCategory('jackets', { ...input, goal: 'professional' }, 1),
      ])

      const professionalProducts = [...top, ...pant, ...shoe, ...jacket].filter(Boolean)
      if (professionalProducts.length > 0) {
        bundles.push({
          id: 'professional-kit',
          label: 'Professional Upgrade Pack',
          emoji: '💼',
          description: 'Sharp, credible, put-together for any work context',
          products: professionalProducts,
        })
      }
    }

    // Low maintenance daily kit
    const dailyProducts = (await Promise.all([
      matchCategory('tops', { ...input }, 1),
      matchCategory('pants', { ...input }, 1),
      matchCategory('shoes', { ...input }, 1),
    ])).flat().filter(Boolean)

    if (dailyProducts.length > 0) {
      bundles.push({
        id: 'daily-kit',
        label: 'Low Maintenance Daily',
        emoji: '⚡',
        description: 'Grab-and-go basics that always look intentional',
        products: dailyProducts,
      })
    }
  } catch (error) {
    console.error('buildBundles error:', error)
  }

  return bundles
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — call this from your API route
// ─────────────────────────────────────────────────────────────
export async function matchProductsForCustomer(
  input: MatchingInput
): Promise<MatchResult> {

  // Validate input
  if (!input?.customerId) {
    console.error('matchProductsForCustomer: missing customerId')
    return {
      tops: { products: [], section: 'tops', aiContext: '' },
      pants: { products: [], section: 'pants', aiContext: '' },
      jackets: { products: [], section: 'jackets', aiContext: '' },
      shoes: { products: [], section: 'shoes', aiContext: '' },
      grooming: { products: [], section: 'grooming', aiContext: '' },
      bundles: [],
    }
  }

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
  if (!customerId) {
    console.error('saveRecommendations: missing customerId')
    return
  }

  const rows: any[] = []

  const sections = ['tops', 'pants', 'jackets', 'shoes', 'grooming'] as const

  sections.forEach(section => {
    const sectionData = matchResult[section]
    if (!sectionData?.products) return

    sectionData.products.forEach((product, idx) => {
      if (!product?.id) return // Skip invalid products

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

  if (rows.length === 0) {
    console.warn('saveRecommendations: no products to save')
    return
  }

  const { error } = await supabaseAdmin
    .from('recommendations')
    .insert(rows)

  if (error) {
    console.error('saveRecommendations error:', error)
  }
}
