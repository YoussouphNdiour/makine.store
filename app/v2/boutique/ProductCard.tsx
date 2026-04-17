'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'
import { getProductImageUrl } from '@/data/productImages'
import type { StoreProduct } from './page'

const BADGE_STYLE: Record<string, string> = {
  Bestseller: 'bg-rose-deep text-white',
  Pack:       'bg-rose-wine text-white',
  Nouveau:    'bg-rose-medium text-white',
  Promo:      'bg-red-400 text-white',
}

const CATEGORY_LABELS: Record<string, string> = {
  gamme: 'Gammes',
  soins: 'Soins',
  huile: 'Huiles',
  savon: 'Savons',
  maquillage: 'Maquillage',
}

function formatPrice(p: StoreProduct) {
  if (p.priceXOF === 0 && p.price === 0) return 'Prix sur demande'
  if (p.priceXOF > 0) return `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
  return `${p.price.toFixed(2)} €`
}

function getImgUrl(p: StoreProduct) {
  return p.imageUrl || getProductImageUrl(p.slug)
}

export default function ProductCard({ product }: { product: StoreProduct }) {
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Link
      href={`/v2/boutique/${product.slug}`}
      className="group rose-card-lift bg-white rounded-3xl overflow-hidden shadow-rose-card border border-rose-petal/60 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-64 bg-rose-petal overflow-hidden flex-shrink-0">
        <Image
          src={getImgUrl(product)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badges */}
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

        {/* Épuisé */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-rose-snow/70 flex items-center justify-center">
            <span className="bg-white text-rose-wine text-xs font-semibold px-4 py-2 rounded-full shadow-rose-sm">
              Épuisé
            </span>
          </div>
        )}

        {/* Hover overlay avec bouton panier */}
        {product.inStock && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-gradient-to-t from-black/20 to-transparent">
            <button
              onClick={handleAdd}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full shadow-rose-sm translate-y-2 group-hover:translate-y-0 transition-all duration-300 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-rose-deep hover:bg-rose-deep hover:text-white'
              }`}
            >
              {added ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Ajouté !
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ajouter au panier
                </>
              )}
            </button>
            <span className="text-white text-xs font-semibold opacity-90">
              Voir le produit →
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-rose-medium uppercase tracking-wider mb-1 font-medium">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </p>
        <h2 className="font-serif font-semibold text-base text-rose-wine leading-snug mb-1 group-hover:text-rose-deep transition-colors line-clamp-2 flex-1">
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
  )
}
