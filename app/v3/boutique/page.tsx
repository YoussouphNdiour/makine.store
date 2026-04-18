'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import HeaderV3 from '@/components/HeaderV3'
import { addToCart } from '@/lib/cart'
import { getProductImageUrl } from '@/data/productImages'

type StoreProduct = {
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

const CAT_LABELS: Record<string, string> = {
  gamme: 'Gammes',
  soins: 'Soins',
  huile: 'Huiles',
  savon: 'Savons',
  maquillage: 'Maquillage',
}

function formatPrice(p: StoreProduct) {
  if (p.priceXOF > 0) return `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
  if (p.price > 0) return `${p.price.toFixed(2)} €`
  return 'Prix sur demande'
}

function ProductCardV3({ product }: { product: StoreProduct }) {
  const [added, setAdded] = useState(false)
  const imgUrl = product.imageUrl || getProductImageUrl(product.slug)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Link
      href={`/v3/boutique/${product.slug}`}
      className="group relative rounded-2xl overflow-hidden border border-white/6 hover:border-lux-gold/25 transition-all duration-500 flex flex-col"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}
    >
      {/* Image */}
      <div className="relative h-60 overflow-hidden flex-shrink-0">
        <Image
          src={imgUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lux-void/70 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-lux-gold/20 text-lux-gold border border-lux-gold/30 backdrop-blur-sm">
              {product.badge}
            </span>
          )}
          {product.wholesale && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-lux-text/60 border border-white/10 backdrop-blur-sm">
              Gros
            </span>
          )}
        </div>

        {/* Out of stock */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-lux-void/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-xs font-semibold px-4 py-2 rounded-full border border-white/20 text-lux-muted">
              Épuisé
            </span>
          </div>
        )}

        {/* Add to cart on hover */}
        {product.inStock && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAdd}
              className={`text-xs font-bold px-5 py-2 rounded-full transition-all duration-300 translate-y-2 group-hover:translate-y-0 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-lux-gold text-lux-void hover:bg-lux-gold-lt'
              }`}
            >
              {added ? '✓ Ajouté' : '+ Ajouter au panier'}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-lux-gold/60 uppercase tracking-wider mb-1 font-medium">
          {CAT_LABELS[product.category] ?? product.category}
        </p>
        <h3 className="font-serif font-semibold text-sm text-lux-text leading-snug mb-2 group-hover:text-lux-gold transition-colors line-clamp-2 flex-1">
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between mt-1">
          <p className="font-bold text-lux-gold text-sm">{formatPrice(product)}</p>
          {product.price > 0 && product.priceXOF > 0 && (
            <p className="text-xs text-lux-muted/60">{product.price.toFixed(2)} €</p>
          )}
        </div>
        {product.priceXOF2 && (
          <p className="text-[11px] text-lux-rose mt-1 flex items-center gap-1">
            🎁 2 pour {product.priceXOF2.toLocaleString('fr-FR')} FCFA
          </p>
        )}
      </div>
    </Link>
  )
}

export default function BoutiqueV3() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('all')
  const [wholesale, setWholesale] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Read cat from URL
    const url = new URL(window.location.href)
    const urlCat = url.searchParams.get('cat')
    if (urlCat) setCat(urlCat)
  }, [])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cats = Array.from(new Set(products.map(p => p.category)))
  const CATEGORIES = [
    { key: 'all', label: 'Tout', count: products.length },
    ...cats.map(c => ({
      key: c,
      label: CAT_LABELS[c] ?? c,
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
    <div className="min-h-screen bg-lux-void text-lux-text">
      <HeaderV3 />

      {/* Hero strip */}
      <section className="relative pt-28 pb-16 px-5 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(212,169,106,0.07)_0%,transparent_60%)]" />
        {/* Gold top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lux-gold/20 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-lux-gold/50" />
            <span className="text-lux-gold text-xs font-semibold tracking-[0.2em] uppercase">Collection complète</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-lux-text leading-tight">
            Notre Boutique
          </h1>
          <p className="text-lux-muted mt-3 text-base max-w-xl">
            {loading ? 'Chargement…' : `${products.length} soins naturels pour sublimer votre peau`}
          </p>
        </div>
      </section>

      {/* Sticky filters */}
      <div className="sticky top-0 z-40 border-b border-white/6" style={{ background: 'rgba(6,6,14,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-3 flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  cat === c.key
                    ? 'bg-lux-gold text-lux-void font-semibold'
                    : 'border border-white/10 text-lux-muted hover:border-lux-gold/40 hover:text-lux-gold'
                }`}
              >
                {c.label}
                <span className={`text-[10px] px-1.5 py-px rounded-full font-bold ${
                  cat === c.key ? 'bg-lux-void/20' : 'bg-white/5 text-lux-muted'
                }`}>{c.count}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto items-center">
            <button
              onClick={() => setWholesale(!wholesale)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                wholesale
                  ? 'bg-lux-gold text-lux-void border-lux-gold'
                  : 'border-white/10 text-lux-muted hover:border-lux-gold/40'
              }`}
            >
              💼 Gros
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs text-lux-text placeholder-lux-muted/50 w-36 focus:w-48 focus:outline-none focus:border-lux-gold/40 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-lux-muted text-sm">×</button>
              )}
            </div>
            <span className="text-xs text-lux-muted/50 whitespace-nowrap hidden sm:block">
              {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/6 overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="h-60 bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6 text-4xl">
              🌸
            </div>
            <p className="text-xl font-serif text-lux-text mb-2">Aucun produit trouvé</p>
            <p className="text-lux-muted text-sm mb-6">Essayez de modifier vos filtres.</p>
            <button
              onClick={() => { setCat('all'); setSearch(''); setWholesale(false) }}
              className="text-sm text-lux-gold hover:text-lux-gold-lt transition-colors"
            >
              Réinitialiser les filtres →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filtered.map(product => (
              <ProductCardV3 key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-5 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/v3" className="font-serif text-lux-muted/60 text-sm hover:text-lux-gold transition-colors">
            ← Makiné
          </Link>
          <p className="text-lux-muted/30 text-xs">© {new Date().getFullYear()} Makiné</p>
          <Link href="/checkout" className="text-xs text-lux-muted/60 hover:text-lux-gold transition-colors">
            Panier →
          </Link>
        </div>
      </footer>
    </div>
  )
}
