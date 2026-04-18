'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const LINKS = [
  { href: '/v3/boutique', label: 'Boutique' },
  { href: '/v3/boutique?cat=soins', label: 'Soins' },
  { href: '/v3/boutique?cat=huile', label: 'Huiles' },
  { href: '/v3/boutique?cat=gamme', label: 'Gammes' },
]

const WORDS = ['Lumineuse', 'Sublimée', 'Naturelle', 'Dorée', 'Éclatante']

function useWordCycle(words: string[], interval = 2800) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [words, interval])
  return words[index]
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
  hidden: {},
}
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

type P = { id: string; slug: string; name: string; price: number; priceXOF: number; imageUrl?: string | null }

export default function Variant1() {
  const word = useWordCycle(WORDS)
  const [products, setProducts] = useState<P[]>([])
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d.slice(0, 4) : []))
      .catch(() => {})
  }, [])

  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Minimal top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'rgba(6,6,14,0.7)', backdropFilter: 'blur(16px)' }}>
        <Link href="/v3" className="font-serif text-base tracking-widest uppercase" style={{ color: '#f0ede8' }}>
          Makiné
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className="text-xs tracking-[0.15em] uppercase transition-opacity hover:opacity-100"
              style={{ color: 'rgba(240,237,232,0.45)', opacity: 0.45 }}
            >{l.label}</Link>
          ))}
        </nav>
        <Link href="/checkout" className="text-xs tracking-[0.15em] uppercase"
          style={{ color: '#d4a96a' }}>Panier</Link>
      </header>

      {/* ── HERO ───────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-8 md:px-16 lg:px-24">
        {/* large soft circle */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[55vw] h-[55vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,169,106,0.09) 0%, transparent 70%)', right: '-10vw' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-24">
          {/* Left — editorial text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.p variants={fadeUp} className="text-xs tracking-[0.3em] uppercase"
              style={{ color: 'rgba(212,169,106,0.7)' }}>
              Beauté Africaine — Saison 2026
            </motion.p>

            <motion.h1 variants={fadeUp}
              style={{ fontSize: 'clamp(3rem,7vw,6rem)', lineHeight: 1.05, letterSpacing: '-0.03em' }}
              className="font-serif font-bold">
              Votre Peau
              <br />
              <AnimatePresence mode="wait">
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                  style={{ color: '#d4a96a' }}
                >{word}</motion.span>
              </AnimatePresence>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-sm leading-7 max-w-sm"
              style={{ color: 'rgba(240,237,232,0.45)' }}>
              Des formules puissantes inspirées des rituels ancestraux d'Afrique de l'Ouest.
              Chaque produit Makiné est une ode à la beauté naturelle.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-4 pt-2">
              <Link href="/v3/boutique"
                className="px-7 py-3.5 rounded-full text-xs font-semibold tracking-[0.12em] uppercase transition-all hover:scale-105"
                style={{ background: '#d4a96a', color: '#06060e' }}>
                Découvrir
              </Link>
              <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
                className="text-xs tracking-[0.12em] uppercase transition-opacity hover:opacity-100"
                style={{ color: 'rgba(240,237,232,0.4)' }}>
                Commander →
              </a>
            </motion.div>

            {/* Social line */}
            <motion.div variants={fadeUp} className="flex items-center gap-6 pt-6 mt-auto"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
              {['Instagram', 'TikTok', 'WhatsApp'].map(s => (
                <span key={s} className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(240,237,232,0.25)' }}>{s}</span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — floating product image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* background circle */}
            <div className="absolute w-[90%] h-[90%] rounded-full"
              style={{ background: 'rgba(212,169,106,0.06)', border: '1px solid rgba(212,169,106,0.12)' }} />
            {/* floating animation wrapper */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-[75%] aspect-[3/4] rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(212,169,106,0.08)' }}
            >
              <Image
                src="/images/shooting/model-brume.jpg"
                alt="Makiné Brume"
                fill className="object-cover"
                style={{ filter: 'brightness(0.9) saturate(0.9)' }}
              />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.5) 0%, transparent 50%)' }} />

              {/* pill label */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(212,169,106,0.18)', border: '1px solid rgba(212,169,106,0.3)', backdropFilter: 'blur(12px)', color: '#d4a96a' }}>
                Brume Satinée — Best-seller
              </div>
            </motion.div>

            {/* side stat */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="absolute right-0 top-1/3 text-right"
            >
              <p className="font-serif text-3xl font-bold" style={{ color: '#d4a96a' }}>100%</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(240,237,232,0.3)' }}>Naturel</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Vertical index */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2">
          <div className="w-px h-16" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <p className="text-[9px] tracking-[0.3em] uppercase vertical-rl"
            style={{ color: 'rgba(240,237,232,0.2)', writingMode: 'vertical-rl' }}>
            Makiné Collection
          </p>
          <div className="w-px h-16" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>
      </section>

      {/* ── EDITORIAL 2-COL ─────────────── */}
      <section ref={ref} className="max-w-7xl mx-auto px-8 md:px-16 py-24 grid md:grid-cols-3 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="md:col-span-1"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(212,169,106,0.6)' }}>Notre Philosophie</p>
          <h2 className="font-serif text-3xl font-bold leading-snug mb-6">
            La nature au service<br />de votre beauté
          </h2>
          <div className="w-8 h-px mb-6" style={{ background: '#d4a96a' }} />
          <p className="text-sm leading-7" style={{ color: 'rgba(240,237,232,0.4)' }}>
            Fondée sur les savoirs ancestraux d'Afrique de l'Ouest, Makiné sélectionne les ingrédients les plus purs
            pour créer des formules à la fois efficaces et respectueuses de votre peau.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="md:col-span-2 grid sm:grid-cols-2 gap-6"
        >
          {products.map((p, i) => (
            <Link key={p.id} href={`/v3/boutique/${p.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <Image
                    src={p.imageUrl || '/images/shooting/shooting-solo.jpg'}
                    alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: 'brightness(0.8) saturate(0.85)' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.8) 0%, transparent 55%)' }} />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-serif text-sm font-semibold mb-0.5" style={{ color: '#f0ede8' }}>{p.name}</p>
                    <p className="text-xs font-bold" style={{ color: '#d4a96a' }}>
                      {p.priceXOF > 0 ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA` : `${p.price.toFixed(2)} €`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ─────────────── */}
      <section className="px-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: 'rgba(212,169,106,0.5)' }}>Rejoignez la communauté</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">
            Prête à révéler<br />votre éclat naturel ?
          </h2>
          <Link href="/v3/boutique"
            className="inline-block px-10 py-4 rounded-full text-sm font-semibold tracking-widest uppercase transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #c49858, #d4a96a, #e8c080)', color: '#06060e' }}>
            Explorer la boutique
          </Link>
        </motion.div>
      </section>

      <footer className="px-8 py-8 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-serif text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>Makiné © 2026</span>
        <div className="flex gap-6">
          {['/v3/variants/2', '/v3/variants/3', '/v3/variants/4', '/v3/variants/5'].map((v, i) => (
            <Link key={v} href={v} className="text-xs transition-colors hover:text-[#d4a96a]"
              style={{ color: 'rgba(240,237,232,0.25)' }}>V{i + 2}</Link>
          ))}
        </div>
        <Link href="/v3" className="text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>← Retour</Link>
      </footer>
    </div>
  )
}
