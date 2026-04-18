'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const ROTATING_WORDS = [
  { text: 'Lumineuse', color: '#d4a96a' },
  { text: 'Naturelle', color: '#f0d9a8' },
  { text: 'Sublime', color: '#e8b4be' },
  { text: 'Éclatante', color: '#d4a96a' },
  { text: 'Dorée', color: '#f0c070' },
]

function RotatingWord() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % ROTATING_WORDS.length), 2500)
    return () => clearInterval(id)
  }, [])

  const word = ROTATING_WORDS[index]

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 40, rotateX: -20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -40, rotateX: 20, filter: 'blur(8px)' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ color: word.color, display: 'inline-block', perspective: '800px' }}
      >
        {word.text}
      </motion.span>
    </AnimatePresence>
  )
}

type P = { id: string; slug: string; name: string; priceXOF: number; price: number; badge?: string | null; imageUrl?: string | null; inStock: boolean }

function ProductRow({ products }: { products: P[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
      style={{ scrollSnapType: 'x mandatory' }}>
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          viewport={{ once: true }}
          onMouseEnter={() => setHovered(p.id)}
          onMouseLeave={() => setHovered(null)}
          className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer"
          style={{
            width: '220px',
            aspectRatio: '3/4',
            scrollSnapAlign: 'start',
            boxShadow: hovered === p.id ? '0 30px 80px rgba(212,169,106,0.15)' : '0 15px 50px rgba(0,0,0,0.4)',
          }}
        >
          <Image
            src={p.imageUrl || '/images/shooting/shooting-solo.jpg'}
            alt={p.name} fill className="object-cover"
            style={{
              filter: hovered === p.id ? 'brightness(0.9) saturate(1.05)' : 'brightness(0.65) saturate(0.8)',
              transform: hovered === p.id ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.85) 0%, transparent 55%)' }} />

          {p.badge && (
            <div className="absolute top-3 left-3">
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(212,169,106,0.2)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.3)', backdropFilter: 'blur(8px)' }}>
                {p.badge}
              </span>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <p className="font-serif text-sm font-semibold mb-1" style={{ color: '#f0ede8' }}>{p.name}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold" style={{ color: '#d4a96a' }}>
                {p.priceXOF > 0 ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA` : `${p.price.toFixed(2)} €`}
              </p>
              <motion.div
                animate={{ opacity: hovered === p.id ? 1 : 0, scale: hovered === p.id ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/v3/boutique/${p.slug}`}
                  className="text-[10px] px-2 py-1 rounded-full"
                  style={{ background: '#d4a96a', color: '#06060e', fontWeight: 700 }}>
                  Voir
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function Variant5() {
  const [products, setProducts] = useState<P[]>([])
  const [navVisible, setNavVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  // spring-driven parallax
  const rawY = useTransform(scrollY, [0, 600], [0, 120])
  const heroY = useSpring(rawY, { damping: 25, stiffness: 100 })

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {})
    const unsub = scrollY.on('change', v => setNavVisible(v > 80))
    return unsub
  }, [scrollY])

  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>
      {/* Floating pill nav — appears after scroll */}
      <AnimatePresence>
        {navVisible && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(6,6,14,0.85)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            <Link href="/v3" className="font-serif text-xs font-bold mr-3 pr-3"
              style={{ color: '#f0ede8', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              Makiné
            </Link>
            {['Boutique', 'Soins', 'Huiles'].map(l => (
              <Link key={l} href={`/v3/boutique${l !== 'Boutique' ? `?cat=${l.toLowerCase()}` : ''}`}
                className="px-3 py-1.5 rounded-xl text-xs transition-colors"
                style={{ color: 'rgba(240,237,232,0.5)' }}>
                {l}
              </Link>
            ))}
            <Link href="/checkout"
              className="ml-2 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: '#d4a96a', color: '#06060e' }}>
              Panier
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Initial minimal header */}
      <AnimatePresence>
        {!navVisible && (
          <motion.header
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6"
          >
            <Link href="/v3" className="font-serif text-sm font-bold tracking-widest uppercase">Makiné</Link>
            <Link href="/v3/boutique" className="text-xs tracking-widest" style={{ color: 'rgba(240,237,232,0.4)' }}>
              Boutique →
            </Link>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── HERO — image bg with cinematic overlay ── */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Parallax image */}
        <motion.div className="absolute inset-0 scale-110" style={{ y: heroY }}>
          <Image
            src="/images/shooting/hero-ebony.jpg"
            alt="Makiné Hero"
            fill
            className="object-cover"
            priority
            style={{ filter: 'brightness(0.4) saturate(0.75)' }}
          />
        </motion.div>

        {/* Multi-layer overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(6,6,14,0.5) 0%, rgba(6,6,14,0.2) 40%, rgba(6,6,14,0.7) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(6,6,14,0.5) 100%)' }} />

        {/* Content */}
        <div className="relative z-10 text-center px-6" style={{ perspective: '1000px' }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs tracking-[0.4em] uppercase mb-8"
            style={{ color: 'rgba(212,169,106,0.7)' }}
          >
            Beauté Africaine · Formules Naturelles
          </motion.p>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif font-bold mb-4"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', lineHeight: 1.05, letterSpacing: '-0.04em' }}
          >
            Votre peau
            <br />
            <span style={{ display: 'inline-block', minWidth: '6ch' }}>
              <RotatingWord />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-sm leading-7 max-w-md mx-auto mb-10"
            style={{ color: 'rgba(240,237,232,0.5)' }}
          >
            Soins naturels inspirés des rituels ancestraux d'Afrique de l'Ouest.
            Révélez l'éclat qui vous est propre.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="flex items-center justify-center gap-4"
          >
            <Link href="/v3/boutique"
              className="px-8 py-4 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #c49858, #d4a96a)', color: '#06060e' }}>
              Découvrir la collection
            </Link>
            <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#f0ede8', backdropFilter: 'blur(8px)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#4ade80' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Commander
            </a>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-px h-14 mx-auto mb-2"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,169,106,0.5))' }} />
          <p className="text-[9px] tracking-[0.4em] uppercase text-center" style={{ color: 'rgba(212,169,106,0.5)' }}>Scroll</p>
        </motion.div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="max-w-4xl mx-auto px-8 py-16">
        <div className="grid grid-cols-3 gap-8 text-center">
          {[
            { value: '100%', label: 'Naturel' },
            { value: '5K+', label: 'Clientes satisfaites' },
            { value: '15+', label: 'Références actives' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
            >
              <p className="font-serif text-3xl md:text-4xl font-bold mb-1" style={{ color: '#d4a96a' }}>{s.value}</p>
              <p className="text-xs tracking-wider uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Thin divider */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(212,169,106,0.3), transparent)' }} />
      </div>

      {/* ── PRODUCTS HORIZONTAL SCROLL ── */}
      <section className="py-20 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8 max-w-7xl mx-auto"
        >
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(212,169,106,0.5)' }}>Nos produits</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Sélection du moment</h2>
          </div>
          <Link href="/v3/boutique" className="hidden md:block text-sm" style={{ color: '#d4a96a' }}>
            Tout voir →
          </Link>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <ProductRow products={products.slice(0, 8)} />
        </div>
      </section>

      {/* ── FULL EDITORIAL SECTION ── */}
      <section className="relative py-32 px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/shooting/trio-sourires.jpg" alt="" fill className="object-cover"
            style={{ filter: 'brightness(0.3) saturate(0.6)' }} />
          <div className="absolute inset-0" style={{ background: 'rgba(6,6,14,0.7)' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 text-center max-w-2xl mx-auto"
        >
          <p className="font-serif italic text-lg md:text-xl mb-8 leading-8"
            style={{ color: 'rgba(240,237,232,0.7)' }}>
            "Chaque produit Makiné est conçu pour révéler la beauté unique qui est en vous.
            Nos formules unissent tradition et modernité."
          </p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-px" style={{ background: 'rgba(212,169,106,0.4)' }} />
            <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(212,169,106,0.5)' }}>Makiné, 2026</p>
            <div className="w-12 h-px" style={{ background: 'rgba(212,169,106,0.4)' }} />
          </div>
          <Link href="/v3/boutique"
            className="inline-block px-8 py-4 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{ background: '#d4a96a', color: '#06060e' }}>
            Découvrir la gamme
          </Link>
        </motion.div>
      </section>

      <footer className="px-6 py-8 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-serif text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>Makiné © 2026</span>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(v => (
            <Link key={v} href={`/v3/variants/${v}`} className="text-xs hover:text-[#d4a96a]"
              style={{ color: 'rgba(240,237,232,0.25)' }}>V{v}</Link>
          ))}
        </div>
        <Link href="/v3" className="text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>← Retour</Link>
      </footer>
    </div>
  )
}
