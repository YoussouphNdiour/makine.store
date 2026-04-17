'use client'

import { useState, useEffect } from 'react'
import HeaderV2 from '@/components/HeaderV2'
import FooterV2 from '@/components/FooterV2'
import ProductCard from './ProductCard'

export type StoreProduct = {
  id: string
  slug: string
  name: string
  category: string
  price: number
  priceXOF: number
  priceXOF2?: number | null
  badge?: string | null
  description: string
  inStock: boolean
  wholesale: boolean
  imageUrl?: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  gamme: 'Gammes',
  soins: 'Soins',
  huile: 'Huiles',
  savon: 'Savons',
  maquillage: 'Maquillage',
}


export default function BoutiqueV2Page() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('all')
  const [wholesale, setWholesale] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Catégories dynamiques selon les produits chargés
  const cats = Array.from(new Set(products.map(p => p.category)))
  const CATEGORIES = [
    { key: 'all', label: 'Tout', count: products.length },
    ...cats.map(c => ({
      key: c,
      label: CATEGORY_LABELS[c] ?? c,
      count: products.filter(p => p.category === c).length,
    })),
  ]

  const filtered = products.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false
    if (wholesale && !p.wholesale) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-rose-snow text-rose-text">
      <HeaderV2 />

      {/* Hero strip */}
      <section className="bg-petal-gradient pt-4 pb-16 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-3">
            Collection complète
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-rose-wine leading-tight">
            Notre Boutique
          </h1>
          <p className="text-rose-muted mt-3 text-base max-w-xl">
            {loading ? 'Chargement…' : `${products.length} soins naturels pour sublimer votre peau`}
          </p>
        </div>
      </section>

      <div className="rose-line mx-5 lg:mx-8 opacity-40" />

      {/* Sticky filters */}
      <div className="sticky top-0 z-40 bg-rose-snow/95 backdrop-blur-md border-b border-rose-blush/30">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  cat === c.key
                    ? 'bg-rose-deep text-white shadow-rose-sm'
                    : 'bg-white text-rose-muted hover:bg-rose-petal border border-rose-blush/40'
                }`}
              >
                {c.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  cat === c.key ? 'bg-white/20' : 'bg-rose-petal text-rose-muted'
                }`}>{c.count}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto items-center">
            <button
              onClick={() => setWholesale(!wholesale)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                wholesale
                  ? 'bg-rose-wine text-white border-rose-wine'
                  : 'bg-white text-rose-muted border-rose-blush hover:border-rose-deep'
              }`}
            >
              💼 Vente en gros
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white border border-rose-blush rounded-full px-4 py-2 text-sm w-36 focus:w-48 transition-all focus:outline-none focus:border-rose-deep focus:ring-1 focus:ring-rose-deep/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-muted hover:text-rose-deep text-sm"
                >×</button>
              )}
            </div>
            <span className="text-xs text-rose-muted whitespace-nowrap">
              {filtered.length} produit{filtered.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-rose-card border border-rose-petal/60 animate-pulse">
                <div className="h-64 bg-rose-petal/40" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-rose-petal rounded w-1/3" />
                  <div className="h-4 bg-rose-petal rounded w-3/4" />
                  <div className="h-4 bg-rose-petal rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-rose-muted">
            <div className="w-20 h-20 rounded-full bg-rose-petal flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🌸</span>
            </div>
            <p className="text-xl font-serif text-rose-wine mb-2">Aucun produit trouvé</p>
            <button
              onClick={() => { setCat('all'); setSearch(''); setWholesale(false) }}
              className="mt-4 text-sm text-rose-deep hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <FooterV2 />
    </div>
  )
}
