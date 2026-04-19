'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'

export default function AddToCartV3({ productId, inStock }: { productId: string; inStock: boolean }) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart(productId); setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  if (!inStock) {
    return (
      <button disabled className="w-full py-4 rounded-xl text-sm font-semibold cursor-not-allowed" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,237,232,0.3)' }}>
        Épuisé temporairement
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAdd}
        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-sm font-semibold transition-all duration-300"
        style={added
          ? { background: '#22c55e', color: '#fff' }
          : { background: 'rgba(212,96,122,0.12)', border: '1px solid rgba(212,96,122,0.35)', color: '#d4607a' }}
      >
        {added ? (
          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Ajouté !</>
        ) : (
          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> Ajouter au panier</>
        )}
      </button>

      <Link
        href={`/checkout?product=${productId}`}
        className="group flex items-center justify-center gap-3 w-full py-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02]"
        style={{ background: '#d4607a', color: '#fff' }}
      >
        Commander maintenant
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>

      {added && (
        <Link href="/checkout" className="text-center text-xs transition-colors" style={{ color: '#d4607a' }}>
          Voir mon panier →
        </Link>
      )}
    </div>
  )
}
