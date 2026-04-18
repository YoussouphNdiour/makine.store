'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function NavV3() {
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function sync() {
      try {
        const c = JSON.parse(localStorage.getItem('makine-cart') ?? '[]') as { quantity?: number }[]
        setCartCount(c.reduce((s, i) => s + (i.quantity ?? 1), 0))
      } catch { setCartCount(0) }
    }
    sync()
    window.addEventListener('cart-updated', sync)
    return () => window.removeEventListener('cart-updated', sync)
  }, [])

  return (
    <>
      {/* ── FLOATING NAV ─────────────────────────────── */}
      <nav
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500"
        style={{
          width: scrolled ? '92%' : '80%',
          maxWidth: '900px',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-500"
          style={{
            background: scrolled
              ? 'rgba(6,6,14,0.88)'
              : 'rgba(6,6,14,0.45)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {/* Logo */}
          <Link href="/v3" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-7 h-7 rounded-full overflow-hidden" style={{ boxShadow: '0 0 0 1px rgba(212,169,106,0.4)' }}>
              <Image src="/images/lolo/logo.png" alt="Makiné" fill className="object-cover" />
            </div>
            <span className="font-serif text-sm font-bold tracking-wide" style={{ color: '#f0ede8' }}>
              Makiné
            </span>
          </Link>

          {/* Center links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/v3/boutique', label: 'Boutique' },
              { href: '/v3/boutique?cat=gamme', label: 'Gammes' },
              { href: '/v3/boutique?cat=soins', label: 'Soins' },
              { href: '/v3/boutique?cat=huile', label: 'Huiles' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-colors"
                style={{ color: 'rgba(240,237,232,0.55)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0ede8')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.55)')}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/221710581711"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl transition-all"
              style={{ color: '#4ade80', background: 'rgba(74,222,128,0.07)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="hidden lg:inline">Commander</span>
            </a>

            {/* Cart */}
            <Link
              href="/checkout"
              className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(240,237,232,0.6)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: '#d4a96a', color: '#06060e' }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(240,237,232,0.6)' }}
              onClick={() => setOpen(!open)}
            >
              {open
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="mt-2 rounded-2xl px-4 py-3 flex flex-col gap-1"
            style={{ background: 'rgba(12,11,24,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {[
              { href: '/v3/boutique', label: 'Boutique' },
              { href: '/v3/boutique?cat=gamme', label: 'Gammes Corporelles' },
              { href: '/v3/boutique?cat=soins', label: 'Soins Visage' },
              { href: '/v3/boutique?cat=huile', label: 'Huiles Précieuses' },
              { href: '/v3/boutique?cat=savon', label: 'Savons Artisanaux' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm border-b last:border-0 transition-colors"
                style={{ color: 'rgba(240,237,232,0.6)', borderColor: 'rgba(255,255,255,0.05)' }}
              >
                {label}
              </Link>
            ))}
            <a
              href="https://wa.me/221710581711"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 py-2.5 text-sm"
              style={{ color: '#4ade80' }}
            >
              💬 Commander via WhatsApp
            </a>
          </div>
        )}
      </nav>
    </>
  )
}
