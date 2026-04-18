'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimationFrame } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

// Scroll-velocity marquee hook (from 21st.dev inspiration)
function useVelocityMarquee(baseVelocity = 3) {
  const x = useMotionValue(0)
  const scrollVelocity = useMotionValue(0)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false })

  const directionFactor = useRef(1)
  const prevT = useRef(0)

  const { scrollY } = useScroll()
  useEffect(() => {
    return scrollY.on('change', (cur) => {
      const prev = prevT.current
      scrollVelocity.set(cur - prev)
      prevT.current = cur
    })
  }, [scrollY, scrollVelocity])

  useAnimationFrame((t, delta) => {
    const moveBy = directionFactor.current * baseVelocity * (delta / 1000)
    const v = velocityFactor.get()
    if (v < 0) directionFactor.current = -1
    if (v > 0) directionFactor.current = 1
    x.set(x.get() + moveBy + directionFactor.current * moveBy * Math.abs(v))
    // wrap: reset when moved past threshold
    const cur = x.get()
    if (directionFactor.current === 1 && cur < -2000) x.set(0)
    if (directionFactor.current === -1 && cur > 0) x.set(-2000)
  })

  return x
}

const MARQUEE_ITEMS = [
  'Beauté Naturelle',
  '✦',
  'Soins Africains',
  '✦',
  'Rituels Ancestraux',
  '✦',
  'Peau Lumineuse',
  '✦',
  'Makiné',
  '✦',
]

function MarqueeLine({ items, velocity, stroke }: { items: string[]; velocity: number; stroke?: boolean }) {
  const x = useVelocityMarquee(velocity)

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div style={{ x }} className="inline-flex">
        {[...Array(4)].map((_, rep) => (
          <span key={rep} className="inline-flex items-center">
            {items.map((item, i) => (
              <span
                key={i}
                className={`inline-block font-serif font-bold mr-6 select-none`}
                style={{
                  fontSize: 'clamp(4rem, 10vw, 8rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                  ...(stroke
                    ? { WebkitTextStroke: '1.5px rgba(212,169,106,0.35)', color: 'transparent' }
                    : { color: item === '✦' ? '#d4a96a' : '#f0ede8' }),
                }}
              >{item}</span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

type P = { id: string; slug: string; name: string; priceXOF: number; price: number; imageUrl?: string | null }

export default function Variant3() {
  const [products, setProducts] = useState<P[]>([])
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d.slice(0, 3) : [])).catch(() => {})
  }, [])

  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>
      {/* Fixed sparse nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5">
        <Link href="/v3" className="font-serif text-sm font-bold" style={{ color: '#f0ede8' }}>Makiné</Link>
        <Link href="/v3/boutique"
          className="text-xs px-4 py-2 rounded-full transition-all hover:scale-105"
          style={{ background: 'rgba(212,169,106,0.12)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.25)' }}>
          Boutique
        </Link>
      </header>

      {/* ── HERO — big image with overlaid marquees ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Parallax bg image */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <Image src="/images/shooting/shooting-back.jpg" alt="" fill className="object-cover"
            style={{ filter: 'brightness(0.35) saturate(0.7)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,6,14,0.3) 0%, rgba(6,6,14,0.7) 100%)' }} />
        </motion.div>

        <motion.div className="relative z-10 py-32" style={{ opacity: heroOpacity }}>
          {/* Filled marquee */}
          <MarqueeLine items={MARQUEE_ITEMS} velocity={2} />

          {/* Center card — editorial */}
          <div className="max-w-3xl mx-auto px-8 my-10 flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-1"
            >
              <p className="text-xs tracking-[0.25em] uppercase mb-4" style={{ color: 'rgba(212,169,106,0.7)' }}>
                Beauté — Authenticité — Sénégal
              </p>
              <p className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-6">
                Des soins naturels<br />pour une peau<br />
                <span style={{ color: '#d4a96a' }}>exceptionnelle</span>
              </p>
              <div className="flex gap-4">
                <Link href="/v3/boutique"
                  className="px-6 py-3 rounded-full text-xs font-bold hover:scale-105 transition-transform"
                  style={{ background: '#d4a96a', color: '#06060e' }}>
                  Découvrir
                </Link>
                <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full text-xs font-medium"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#f0ede8' }}>
                  WhatsApp
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="w-48 h-64 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}
            >
              <Image src="/images/shooting/pajama-solo.jpg" alt="Makiné" fill={false}
                width={200} height={280}
                className="object-cover w-full h-full"
                style={{ filter: 'brightness(0.9)' }}
              />
            </motion.div>
          </div>

          {/* Stroke marquee — opposite direction */}
          <MarqueeLine items={[...MARQUEE_ITEMS].reverse()} velocity={-2} stroke />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ opacity: 0.4 }}
        >
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,169,106,0.6))' }} />
          <p className="text-[9px] tracking-[0.3em] uppercase" style={{ color: '#d4a96a' }}>Défiler</p>
        </motion.div>
      </section>

      {/* ── PRODUCTS — floating cards ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="w-8 h-px" style={{ background: '#d4a96a' }} />
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(212,169,106,0.6)' }}>Sélection</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <Link href={`/v3/boutique/${p.slug}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl mb-4"
                  style={{ aspectRatio: '3/4', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                  <Image
                    src={p.imageUrl || '/images/shooting/shooting-solo.jpg'}
                    alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: 'brightness(0.8)' }}
                  />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.7) 0%, transparent 60%)' }} />
                  <div className="absolute bottom-4 left-4">
                    <p className="font-serif text-sm font-semibold" style={{ color: '#f0ede8' }}>{p.name}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: '#d4a96a' }}>
                      {p.priceXOF > 0 ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA` : `${p.price.toFixed(2)} €`}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/v3/boutique"
            className="inline-block px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ border: '1px solid rgba(212,169,106,0.3)', color: '#d4a96a' }}>
            Voir toute la collection →
          </Link>
        </motion.div>
      </section>

      {/* ── MARQUEE 2 — product names ── */}
      <div className="py-8 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <MarqueeLine
          items={['Brume Satinée', '·', 'Huile de Baobab', '·', 'Beurre de Karité', '·', 'Gommage Corps', '·', 'Gloss Naturel', '·', 'Eau Micellaire', '·']}
          velocity={1.5}
        />
      </div>

      {/* ── FULL-WIDTH CTA ── */}
      <section className="relative overflow-hidden py-32 px-8">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,169,106,0.07) 0%, transparent 70%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 text-center max-w-2xl mx-auto"
        >
          <h2 className="font-serif font-bold mb-8"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            La beauté naturelle<br />
            <span style={{ WebkitTextStroke: '1px rgba(212,169,106,0.5)', color: 'transparent' }}>sans compromis</span>
          </h2>
          <Link href="/v3/boutique"
            className="inline-block px-10 py-4 rounded-full text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #c49858, #d4a96a, #e8c080)', color: '#06060e' }}>
            Commander maintenant
          </Link>
        </motion.div>
      </section>

      <footer className="px-6 py-6 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-serif text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>© 2026 Makiné</span>
        <div className="flex gap-4">
          {[1, 2, 4, 5].map(v => (
            <Link key={v} href={`/v3/variants/${v}`} className="text-xs hover:text-[#d4a96a]"
              style={{ color: 'rgba(240,237,232,0.25)' }}>V{v}</Link>
          ))}
        </div>
        <Link href="/v3" className="text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>← Retour</Link>
      </footer>
    </div>
  )
}
