'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'

export default function AddToCartButtonV3({ productId, inStock }: { productId: string; inStock: boolean }) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart(productId)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full py-4 rounded-2xl text-sm font-semibold cursor-not-allowed border border-white/10 text-lux-muted/50"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        Épuisé temporairement
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAdd}
        className={`flex items-center justify-center gap-3 font-semibold px-6 py-4 rounded-2xl text-sm transition-all duration-300 ${
          added
            ? 'bg-green-500 text-white scale-[0.99]'
            : 'border border-lux-gold/40 text-lux-gold hover:bg-lux-gold hover:text-lux-void hover:border-lux-gold'
        }`}
        style={!added ? { background: 'rgba(212,169,106,0.08)' } : undefined}
      >
        {added ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Ajouté au panier !
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Ajouter au panier
          </>
        )}
      </button>

      <Link
        href={`/checkout?product=${productId}`}
        className="flex items-center justify-center gap-3 font-bold px-6 py-4 rounded-2xl text-sm transition-all duration-300 group hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, #d4a96a, #9a7040)', color: '#fff' }}
      >
        Commander maintenant
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>

      {added && (
        <Link href="/checkout" className="text-center text-sm text-lux-gold hover:underline font-medium">
          Voir mon panier →
        </Link>
      )}
    </div>
  )
}
