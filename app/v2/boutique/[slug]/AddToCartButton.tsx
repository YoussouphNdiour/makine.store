'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'

type Props = {
  productId: string
  inStock: boolean
}

export default function AddToCartButton({ productId, inStock }: Props) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart(productId)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  if (!inStock) {
    return (
      <div className="flex flex-col gap-3">
        <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-semibold text-sm cursor-not-allowed">
          Épuisé temporairement
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAdd}
        className={`flex items-center justify-center gap-3 font-semibold px-6 py-4 rounded-2xl text-sm transition-all duration-300 ${
          added
            ? 'bg-green-500 text-white shadow-lg scale-[0.99]'
            : 'bg-white border-2 border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white hover:shadow-rose-md'
        }`}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Ajouter au panier
          </>
        )}
      </button>

      <Link
        href={`/checkout?product=${productId}`}
        className="flex items-center justify-center gap-3 bg-rose-deep hover:bg-rose-wine text-white font-semibold px-6 py-4 rounded-2xl text-sm transition-all hover:shadow-rose-md group"
      >
        Commander maintenant
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </Link>

      {added && (
        <Link
          href="/checkout"
          className="text-center text-sm text-rose-deep hover:underline font-medium"
        >
          Voir mon panier →
        </Link>
      )}
    </div>
  )
}
