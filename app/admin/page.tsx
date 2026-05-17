'use client'
// app/admin/page.tsx
// ─────────────────────────────────────────────────────────────
// Affiliate Product Admin Panel
// Reads and writes directly to Supabase affiliate_products table
// Access at: glowupmen.com/admin
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type Tier = 'budget' | 'mid' | 'premium'
type Category = 'tops' | 'pants' | 'jackets' | 'shoes' | 'grooming' | 'skincare' | 'accessories'

interface Product {
  id: string
  brand: string
  label: string
  slug: string
  category: Category
  subcategory: string
  tier: Tier
  price_display: string
  affiliate_url: string
  affiliate_network: string
  commission_pct: number
  image_url: string
  badge: string
  conversion_note: string
  is_active: boolean
  is_featured: boolean
  total_clicks: number
  total_purchases: number
  archetype_tags: string[]
  goal_tags: string[]
  style_tags: string[]
  sort_order: number
}

const TIER_COLORS: Record<string, string> = {
  budget: '#3B6D11',
  mid: '#854F0B',
  premium: '#993C1D',
}

const TIER_BG: Record<string, string> = {
  budget: '#EAF3DE',
  mid: '#FAEEDA',
  premium: '#FAECE7',
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  // ── Fetch all products ──────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('affiliate_products')
      .select('*')
      .order('category')
      .order('sort_order')

    if (error) {
      showToast('Error loading products: ' + error.message, true)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // ── Filter logic ────────────────────────────────────────────
  useEffect(() => {
    let result = products
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.brand?.toLowerCase().includes(q) ||
        p.label?.toLowerCase().includes(q) ||
        p.affiliate_url?.toLowerCase().includes(q)
      )
    }
    if (filterCat) result = result.filter(p => p.category === filterCat)
    if (filterTier) result = result.filter(p => p.tier === filterTier)
    setFiltered(result)
  }, [products, search, filterCat, filterTier])

  // ── Toast helper ────────────────────────────────────────────
  const showToast = (msg: string, isError = false) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // ── Save product ────────────────────────────────────────────
  const saveProduct = async () => {
    if (!editing) return
    setSaving(true)

    const { error } = await supabase
      .from('affiliate_products')
      .update({
        affiliate_url: editing.affiliate_url,
        affiliate_network: editing.affiliate_network,
        commission_pct: editing.commission_pct,
        badge: editing.badge,
        conversion_note: editing.conversion_note,
        image_url: editing.image_url,
        price_display: editing.price_display,
        is_active: editing.is_active,
        is_featured: editing.is_featured,
        sort_order: editing.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editing.id)

    setSaving(false)

    if (error) {
      showToast('Save failed: ' + error.message, true)
    } else {
      showToast('Saved successfully')
      setEditing(null)
      fetchProducts()
    }
  }

  // ── Toggle active ───────────────────────────────────────────
  const toggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('affiliate_products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (!error) {
      fetchProducts()
      showToast(`${product.brand} ${!product.is_active ? 'activated' : 'deactivated'}`)
    }
  }

  // ── Stats ───────────────────────────────────────────────────
  const totalClicks = products.reduce((a, p) => a + (p.total_clicks || 0), 0)
  const activeCount = products.filter(p => p.is_active).length

  const s: Record<string, React.CSSProperties> = {
    page: { background: '#0a0804', minHeight: '100vh', color: '#f5ece0', fontFamily: 'system-ui, sans-serif', padding: '0 0 80px' },
    header: { borderBottom: '1px solid rgba(200,169,110,0.15)', padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, background: 'rgba(10,8,4,0.95)', backdropFilter: 'blur(20px)', zIndex: 40 },
    logo: { fontSize: 14, color: '#c8a96e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
    body: { padding: '24px' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 },
    statCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px' },
    statLabel: { fontSize: 11, color: '#8b7355', letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'monospace', marginBottom: 4 },
    statVal: { fontSize: 24, fontWeight: 700, color: '#f0d080' },
    toolbar: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const, alignItems: 'center' },
    input: { padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5ece0', fontSize: 14, outline: 'none', flex: 1, minWidth: 180 },
    select: { padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5ece0', fontSize: 13, outline: 'none' },
    addBtn: { padding: '10px 18px', background: 'linear-gradient(135deg, #c8a96e, #f0d080)', border: 'none', borderRadius: 8, color: '#1a1208', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' },
    table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
    tableWrap: { border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' },
    th: { background: 'rgba(255,255,255,0.04)', color: '#8b7355', fontSize: 11, fontWeight: 500, textAlign: 'left' as const, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', letterSpacing: '0.08em', textTransform: 'uppercase' as const },
    td: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#d4c5a9', verticalAlign: 'middle' as const },
    editBtn: { padding: '5px 12px', background: 'rgba(200,169,110,0.15)', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 6, color: '#c8a96e', fontSize: 12, cursor: 'pointer', fontWeight: 600 },
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
    modal: { background: '#141008', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' as const },
    modalTitle: { fontSize: 18, fontWeight: 700, color: '#f5ece0', marginBottom: 20, fontFamily: 'Georgia, serif' },
    formRow: { marginBottom: 14 },
    label: { display: 'block', fontSize: 12, color: '#8b7355', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' as const },
    formInput: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#f5ece0', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
    formSelect: { width: '100%', padding: '10px 12px', background: 'rgba(30,24,16,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#f5ece0', fontSize: 14, outline: 'none' },
    saveBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #c8a96e, #f0d080)', border: 'none', borderRadius: 10, color: '#1a1208', fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em' },
    cancelBtn: { padding: '12px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#8b7355', fontSize: 14, cursor: 'pointer' },
    toastStyle: { position: 'fixed' as const, bottom: 24, right: 24, background: 'rgba(200,169,110,0.95)', color: '#1a1208', fontSize: 13, fontWeight: 700, padding: '12px 20px', borderRadius: 10, zIndex: 200, transition: 'opacity 0.3s' },
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.logo}>◈ GlowUpMen — Admin</span>
        <span style={{ fontSize: 12, color: '#5a4a35' }}>
          {activeCount} active · {products.length} total products
        </span>
      </div>

      <div style={s.body}>
        {/* Stats */}
        <div style={s.stats}>
          {[
            { label: 'Total products', val: products.length },
            { label: 'Active', val: activeCount },
            { label: 'Total clicks', val: totalClicks.toLocaleString() },
            { label: 'Categories', val: 5 },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <div style={s.statLabel}>{stat.label}</div>
              <div style={s.statVal}>{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <input
            style={s.input}
            placeholder="Search brand or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select style={s.select} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">All categories</option>
            {['tops','pants','jackets','shoes','grooming'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select style={s.select} value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
            <option value="">All tiers</option>
            {['budget','mid','premium'].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button style={s.addBtn} onClick={() => alert('To add a product, insert a row in Supabase → Table Editor → affiliate_products')}>
            + Add product
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8b7355' }}>Loading products...</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['Brand','Product','Category','Tier','Affiliate URL','Commission','Clicks','Status',''].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} style={{ cursor: 'default' }}>
                    <td style={{ ...s.td, fontWeight: 600, color: '#f5ece0', whiteSpace: 'nowrap' }}>{product.brand}</td>
                    <td style={{ ...s.td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.label}</td>
                    <td style={s.td}>{product.category}</td>
                    <td style={s.td}>
                      <span style={{ background: TIER_BG[product.tier], color: TIER_COLORS[product.tier], fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
                        {product.tier}
                      </span>
                    </td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11, color: '#8b7355', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.affiliate_url ? new URL(product.affiliate_url).hostname.replace('www.','') : '—'}
                    </td>
                    <td style={{ ...s.td, color: product.commission_pct > 0 ? '#c8a96e' : '#555' }}>
                      {product.commission_pct > 0 ? `${product.commission_pct}%` : '—'}
                    </td>
                    <td style={{ ...s.td, color: product.total_clicks > 0 ? '#f0d080' : '#555' }}>
                      {product.total_clicks || 0}
                    </td>
                    <td style={s.td}>
                      <button
                        onClick={() => toggleActive(product)}
                        style={{ background: product.is_active ? 'rgba(61,110,17,0.2)' : 'rgba(80,80,80,0.2)', border: `1px solid ${product.is_active ? 'rgba(61,110,17,0.4)' : 'rgba(80,80,80,0.3)'}`, color: product.is_active ? '#4ade80' : '#888', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, cursor: 'pointer' }}
                      >
                        {product.is_active ? 'Active' : 'Off'}
                      </button>
                    </td>
                    <td style={s.td}>
                      <button style={s.editBtn} onClick={() => setEditing({ ...product })}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div style={s.modal}>
            <div style={s.modalTitle}>{editing.brand} — {editing.label}</div>

            {[
              { label: 'Affiliate URL *', key: 'affiliate_url', type: 'url', placeholder: 'https://go.impact.com/your-tracking-link' },
              { label: 'Image URL', key: 'image_url', type: 'url', placeholder: 'https://...' },
              { label: 'Price display', key: 'price_display', type: 'text', placeholder: '$60–$80' },
              { label: 'Badge copy', key: 'badge', type: 'text', placeholder: 'Best Value, Social Weapon...' },
              { label: 'Conversion note', key: 'conversion_note', type: 'text', placeholder: 'Most clients upgrade here' },
            ].map(field => (
              <div key={field.key} style={s.formRow}>
                <label style={s.label}>{field.label}</label>
                <input
                  style={s.formInput}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(editing as any)[field.key] || ''}
                  onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })}
                />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={s.label}>Network</label>
                <select style={s.formSelect} value={editing.affiliate_network || ''} onChange={(e) => setEditing({ ...editing, affiliate_network: e.target.value })}>
                  {['impact','rakuten','shareasale','amazon','direct'].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Commission %</label>
                <input style={s.formInput} type="number" step="0.1" value={editing.commission_pct || 0} onChange={(e) => setEditing({ ...editing, commission_pct: parseFloat(e.target.value) })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="active" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                <label htmlFor="active" style={{ ...s.label, margin: 0 }}>Active</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="featured" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
                <label htmlFor="featured" style={{ ...s.label, margin: 0 }}>Featured</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={s.cancelBtn} onClick={() => setEditing(null)}>Cancel</button>
              <button style={s.saveBtn} onClick={saveProduct} disabled={saving}>
                {saving ? 'Saving...' : 'Save to database →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={s.toastStyle}>{toast}</div>}
    </div>
  )
}
