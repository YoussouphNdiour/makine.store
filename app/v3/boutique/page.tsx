'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import NavV3 from '@/components/NavV3'
import { addToCart } from '@/lib/cart'
import { getProductImageUrl } from '@/data/productImages'

// ── Colors ────────────────────────────────────────────────────
const ACCENT     = '#d4607a'
const ACCENT_RGB = '212,96,122'

type P = {
  id: string; slug: string; name: string; category: string
  price: number; priceXOF: number; priceXOF2?: number | null
  badge?: string | null; description: string; inStock: boolean
  wholesale: boolean; imageUrl?: string | null
}

const CAT_LABELS: Record<string, string> = {
  gamme: 'Gammes', soins: 'Soins', huile: 'Huiles', savon: 'Savons', maquillage: 'Maquillage',
}

function fmtPrice(p: P) {
  if (p.priceXOF > 0) return `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
  if (p.price > 0) return `${p.price.toFixed(2)} €`
  return 'Sur demande'
}

// ── Card ──────────────────────────────────────────────────────
function Card({ p, index }: { p: P; index: number }) {
  const [added, setAdded] = useState(false)
  const [hov, setHov] = useState(false)
  const img = p.imageUrl || getProductImageUrl(p.slug)

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    addToCart(p.id); setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }, [p.id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        href={`/v3/boutique/${p.slug}`}
        className="group block rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {/* Image */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '3/4' }}>
          <Image
            src={img} alt={p.name} fill
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
            className="object-cover"
            style={{
              filter: hov ? 'brightness(0.85) saturate(0.95)' : 'brightness(0.65) saturate(0.8)',
              transform: hov ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          {/* Gradient */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.88) 0%, transparent 55%)' }} />

          {/* Rose glow on hover */}
          <div className="absolute inset-0 transition-opacity duration-500"
            style={{ background: `radial-gradient(ellipse at 50% 100%, rgba(${ACCENT_RGB},0.12) 0%, transparent 60%)`, opacity: hov ? 1 : 0 }} />

          {/* Badge */}
          {p.badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: `rgba(${ACCENT_RGB},0.18)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.3)`, backdropFilter: 'blur(8px)' }}>
                {p.badge}
              </span>
            </div>
          )}

          {/* Out of stock */}
          {!p.inStock && (
            <div className="absolute inset-0 flex items-center justify-center z-10"
              style={{ background: 'rgba(6,6,14,0.7)', backdropFilter: 'blur(2px)' }}>
              <span className="text-xs font-semibold px-4 py-2 rounded-full"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(240,237,232,0.5)' }}>
                Épuisé
              </span>
            </div>
          )}

          {/* Hover add to cart */}
          {p.inStock && (
            <motion.div
              animate={{ opacity: hov ? 1 : 0, y: hov ? 0 : 8 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-3 left-3 right-3 z-10"
            >
              <button onClick={handleAdd}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                style={added
                  ? { background: '#22c55e', color: '#fff' }
                  : { background: ACCENT, color: '#fff' }}>
                {added ? '✓ Ajouté !' : '+ Ajouter au panier'}
              </button>
            </motion.div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p className="text-[10px] uppercase tracking-wider font-medium mb-1"
            style={{ color: `rgba(${ACCENT_RGB},0.6)` }}>
            {CAT_LABELS[p.category] ?? p.category}
          </p>
          <h3 className="font-serif font-semibold text-sm leading-snug line-clamp-2 mb-2 transition-colors duration-300"
            style={{ color: hov ? ACCENT : '#f0ede8' }}>
            {p.name}
          </h3>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-bold" style={{ color: ACCENT }}>{fmtPrice(p)}</p>
            {p.price > 0 && p.priceXOF > 0 && (
              <p className="text-[10px]" style={{ color: 'rgba(240,237,232,0.2)' }}>{p.price.toFixed(2)} €</p>
            )}
          </div>
          {p.priceXOF2 && (
            <p className="text-[10px] mt-1" style={{ color: '#e8b4be' }}>
              🎁 2 pour {p.priceXOF2.toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function BoutiqueV3() {
  const [products, setProducts] = useState<P[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')
  const [wholesale, setWholesale] = useState(false)
  const [sort, setSort] = useState<'default' | 'asc' | 'desc'>('default')

  useEffect(() => {
    const urlCat = new URLSearchParams(window.location.search).get('cat')
    if (urlCat) setCat(urlCat)
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cats = Array.from(new Set(products.map(p => p.category)))

  let filtered = products.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false
    if (wholesale && !p.wholesale) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (sort === 'asc')  filtered = [...filtered].sort((a, b) => (a.priceXOF || a.price * 650) - (b.priceXOF || b.price * 650))
  if (sort === 'desc') filtered = [...filtered].sort((a, b) => (b.priceXOF || b.price * 650) - (a.priceXOF || a.price * 650))

  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>
      <NavV3 />

      {/* ── HERO STRIP ──────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ paddingTop: '110px', paddingBottom: '56px' }}>
        {/* bg glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 15% 50%, rgba(${ACCENT_RGB},0.07) 0%, transparent 60%)` }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex items-end gap-3 mb-4">
            <span className="w-8 h-px block" style={{ background: ACCENT }} />
            <p className="text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: ACCENT }}>Collection</p>
          </div>
          <h1 className="font-serif font-bold mb-3"
            style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Notre Boutique
          </h1>
          <p className="text-sm" style={{ color: 'rgba(240,237,232,0.4)' }}>
            {loading ? 'Chargement…' : `${products.length} soins naturels pour sublimer votre peau`}
          </p>
        </div>
      </section>

      {/* ── FILTERS ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 transition-all"
        style={{ background: 'rgba(6,6,14,0.92)', backdropFilter: 'blur(24px)', borderBottom: `1px solid rgba(${ACCENT_RGB},0.1)` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex flex-wrap items-center gap-2">

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {[
              { key: 'all', label: 'Tout', count: products.length },
              ...cats.map(c => ({ key: c, label: CAT_LABELS[c] ?? c, count: products.filter(p => p.category === c).length })),
            ].map(c => (
              <button key={c.key} onClick={() => setCat(c.key)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={cat === c.key
                  ? { background: ACCENT, color: '#fff' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(240,237,232,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {c.label}
                <span className="text-[10px] font-bold px-1.5 py-px rounded-full"
                  style={{ background: cat === c.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)' }}>
                  {c.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Wholesale */}
            <button onClick={() => setWholesale(!wholesale)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
              style={wholesale
                ? { background: ACCENT, color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(240,237,232,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              💼 Gros
            </button>

            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as 'default' | 'asc' | 'desc')}
              className="text-xs px-3 py-1.5 rounded-full outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,237,232,0.5)' }}>
              <option value="default">Tri</option>
              <option value="asc">Prix ↑</option>
              <option value="desc">Prix ↓</option>
            </select>

            {/* Search */}
            <div className="relative">
              <input type="text" placeholder="Rechercher…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-xs pl-3 pr-7 py-1.5 rounded-full outline-none transition-all"
                style={{
                  width: search ? '160px' : '120px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${search ? `rgba(${ACCENT_RGB},0.4)` : 'rgba(255,255,255,0.08)'}`,
                  color: '#f0ede8',
                }} />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'rgba(240,237,232,0.4)' }}>×</button>
              )}
            </div>

            <span className="text-xs hidden sm:block" style={{ color: 'rgba(240,237,232,0.2)' }}>
              {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── GRID ────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ aspectRatio: '3/4', background: 'rgba(255,255,255,0.04)' }} />
                <div className="p-3.5 space-y-2">
                  <div className="h-2 rounded w-1/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  <div className="h-3 rounded w-3/4" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  <div className="h-3 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-serif text-5xl mb-4" style={{ color: `rgba(${ACCENT_RGB},0.15)` }}>∅</p>
            <p className="font-serif text-xl mb-2" style={{ color: 'rgba(240,237,232,0.4)' }}>Aucun produit trouvé</p>
            <button onClick={() => { setCat('all'); setSearch(''); setWholesale(false); setSort('default') }}
              className="text-sm mt-4 transition-colors" style={{ color: ACCENT }}>
              Réinitialiser les filtres →
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={cat + search + wholesale + sort}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filtered.map((p, i) => <Card key={p.id} p={p} index={i} />)}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 flex items-center justify-between"
        style={{ borderTop: `1px solid rgba(${ACCENT_RGB},0.1)` }}>
        <Link href="/v3" className="text-sm transition-colors hover:text-[#d4607a]"
          style={{ color: 'rgba(240,237,232,0.3)' }}>← Makiné</Link>
        <p className="text-xs" style={{ color: 'rgba(240,237,232,0.15)' }}>© {new Date().getFullYear()} Makiné</p>
        <Link href="/checkout" className="text-sm transition-colors hover:text-[#d4607a]"
          style={{ color: 'rgba(240,237,232,0.3)' }}>Panier →</Link>
      </footer>
    </div>
  )
}
