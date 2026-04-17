'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getProductImageUrl } from '@/data/productImages'
import HeaderV2 from '@/components/HeaderV2'
import FooterV2 from '@/components/FooterV2'

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

const BADGE_STYLE: Record<string, string> = {
  Bestseller: 'bg-rose-deep text-white',
  Pack:       'bg-rose-wine text-white',
  Nouveau:    'bg-rose-medium text-white',
  Promo:      'bg-red-400 text-white',
}

function formatPrice(p: StoreProduct) {
  if (p.priceXOF === 0 && p.price === 0) return 'Prix sur demande'
  if (p.priceXOF > 0) return `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
  return `${p.price.toFixed(2)} €`
}

function getImgUrl(p: StoreProduct) {
  return p.imageUrl || getProductImageUrl(p.slug)
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
              <Link
                key={product.id}
                href={`/v2/boutique/${product.slug}`}
                className="group rose-card-lift bg-white rounded-3xl overflow-hidden shadow-rose-card border border-rose-petal/60"
              >
                {/* Image */}
                <div className="relative h-64 bg-rose-petal overflow-hidden">
                  <Image
                    src={getImgUrl(product)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                    {product.badge && (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${BADGE_STYLE[product.badge] ?? 'bg-rose-medium text-white'}`}>
                        {product.badge}
                      </span>
                    )}
                    {product.wholesale && (
                      <span className="text-xs bg-rose-text/70 text-white px-2.5 py-0.5 rounded-full">
                        Gros
                      </span>
                    )}
                  </div>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-rose-snow/70 flex items-center justify-center">
                      <span className="bg-white text-rose-wine text-xs font-semibold px-4 py-2 rounded-full shadow-rose-sm">
                        Épuisé
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <span className="bg-white text-rose-deep text-xs font-bold px-4 py-2 rounded-full shadow-rose-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      Voir le produit →
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-xs text-rose-medium uppercase tracking-wider mb-1 font-medium">
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </p>
                  <h2 className="font-serif font-semibold text-base text-rose-wine leading-snug mb-1 group-hover:text-rose-deep transition-colors line-clamp-2">
                    {product.name}
                  </h2>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="font-bold text-rose-deep text-base">{formatPrice(product)}</p>
                    {product.price > 0 && product.priceXOF > 0 && (
                      <p className="text-xs text-rose-muted">{product.price.toFixed(2)} €</p>
                    )}
                  </div>
                  {product.priceXOF2 && (
                    <p className="text-xs text-rose-deep font-medium mt-1 flex items-center gap-1">
                      <span>🎁</span> 2 pour {product.priceXOF2.toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <FooterV2 />
    </div>
  )
}
