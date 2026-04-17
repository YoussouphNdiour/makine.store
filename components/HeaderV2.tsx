'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCartCount } from '@/lib/cart'

const NAV = [
  { href: '/v2/boutique', label: 'Boutique' },
  { href: '/v2/boutique?cat=soins', label: 'Soins' },
  { href: '/v2/boutique?cat=huile', label: 'Huiles' },
  { href: '/v2/boutique?cat=gamme', label: 'Gammes' },
]

export default function HeaderV2({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCartCount(getCartCount())
    const update = () => setCartCount(getCartCount())
    window.addEventListener('cart-updated', update)
    return () => window.removeEventListener('cart-updated', update)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const isGlass = scrolled || !transparent

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isGlass ? 'petal-glass shadow-rose-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Nav left */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV.slice(0, 2).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-rose-text/70 hover:text-rose-deep transition-colors relative group"
                >
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-rose-deep transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Logo centered */}
            <Link href="/v2" className="absolute left-1/2 -translate-x-1/2">
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image
                  src="/images/logo/logo.png"
                  alt="Makiné"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Nav right */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV.slice(2).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium text-rose-text/70 hover:text-rose-deep transition-colors relative group"
                >
                  {label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-rose-deep transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
              <Link
                href="/checkout"
                className="relative flex items-center gap-1.5 bg-rose-deep text-white text-xs font-semibold px-5 py-2 rounded-full hover:bg-rose-wine transition-colors shadow-rose-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Panier
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-wine text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 ml-auto"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-rose-text transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-5 h-0.5 bg-rose-text transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-rose-text transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div ref={menuRef} className="md:hidden petal-glass border-t border-rose-blush/30 px-5 py-6 flex flex-col gap-4 animate-fade-up">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-rose-text/80 hover:text-rose-deep transition-colors"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/v2/boutique"
              onClick={() => setMenuOpen(false)}
              className="bg-rose-deep text-white text-sm font-semibold px-6 py-3 rounded-full text-center hover:bg-rose-wine transition-colors mt-2"
            >
              Commander maintenant
            </Link>
          </div>
        )}
      </header>
      {/* Spacer when not transparent */}
      {!transparent && <div className="h-16 md:h-20" />}
    </>
  )
}
