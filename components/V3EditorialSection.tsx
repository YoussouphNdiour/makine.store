'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

type P = { id: string; slug: string; name: string; price: number; priceXOF: number; imageUrl?: string | null }

interface Props {
  products: P[]
  accent?: string          // ex: '#d4607a' (dark) | '#9e3d58' (light)
  accentRgb?: string       // ex: '212,96,122'
  bg?: string              // card bg
  textMuted?: string
  borderColor?: string
  dark?: boolean
}

export default function V3EditorialSection({
  products,
  accent = '#d4607a',
  accentRgb = '212,96,122',
  bg = 'rgba(255,255,255,0.03)',
  textMuted = 'rgba(240,237,232,0.4)',
  borderColor = 'rgba(255,255,255,0.06)',
  dark = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const textColor = dark ? '#f0ede8' : '#1a0a12'

  const fmt = (p: P) =>
    p.priceXOF > 0 ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
    : p.price > 0 ? `${p.price.toFixed(2)} €`
    : 'Sur demande'

  return (
    <section ref={ref} className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-14">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-8 h-px" style={{ background: accent }} />
            <p className="text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: accent }}>Collection</p>
          </div>
          <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.02em', color: textColor }}>
            Notre Philosophie
          </h2>
        </div>
        <Link href="/v3/boutique" className="hidden md:flex items-center gap-2 text-sm transition-colors group" style={{ color: textMuted }}>
          Voir tout <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* 3-col editorial grid */}
      <div className="grid md:grid-cols-3 gap-10 items-center">

        {/* Left — text + values */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-7"
        >
          <p className="text-sm leading-7" style={{ color: textMuted }}>
            Fondée sur les savoirs ancestraux d&apos;Afrique de l&apos;Ouest, Makiné sélectionne les ingrédients
            les plus purs pour des formules efficaces et respectueuses de votre peau.
          </p>
          <div className="flex flex-col gap-5">
            {[
              { n: '01', title: 'Ingrédients sélectionnés', desc: 'Karité, baobab, huiles précieuses — chaque composant choisi pour son efficacité prouvée.' },
              { n: '02', title: 'Formules respectueuses', desc: "Sans parabènes ni sulfates — douces et préservant l'équilibre naturel de votre peau." },
              { n: '03', title: 'Beauté inclusive', desc: "Créés pour toutes les carnations, nos soins s'adaptent à chaque type de peau." },
            ].map((item, i) => (
              <motion.div key={item.n}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="pl-4"
                style={{ borderLeft: `2px solid rgba(${accentRgb},0.25)` }}
              >
                <p className="font-serif text-[10px] uppercase tracking-widest mb-0.5" style={{ color: `rgba(${accentRgb},0.5)` }}>{item.n}</p>
                <p className="text-sm font-semibold mb-0.5" style={{ color: textColor }}>{item.title}</p>
                <p className="text-xs leading-5" style={{ color: textMuted }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <Link href="/v3/boutique"
            className="self-start mt-2 px-6 py-3 rounded-full text-xs font-bold transition-all hover:scale-105"
            style={{ background: accent, color: dark ? '#06060e' : '#fff' }}>
            Explorer la gamme →
          </Link>
        </motion.div>

        {/* Center — floating product image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative flex items-center justify-center"
        >
          {/* Glow circle */}
          <div className="absolute w-full h-full rounded-full"
            style={{ background: `radial-gradient(circle, rgba(${accentRgb},0.08) 0%, transparent 70%)` }} />
          <div className="absolute w-4/5 h-4/5 rounded-full"
            style={{ border: `1px solid rgba(${accentRgb},0.12)` }} />

          {/* Floating image */}
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-4/5 rounded-3xl overflow-hidden"
            style={{ aspectRatio: '3/4', boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(${accentRgb},0.08)` }}
          >
            <Image
              src="/images/shooting/model-brume.jpg"
              alt="Brume Satinée"
              fill className="object-cover"
              style={{ filter: dark ? 'brightness(0.88) saturate(0.9)' : 'brightness(0.92) saturate(0.95)' }}
            />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top,rgba(6,6,14,.5) 0%,transparent 55%)' }} />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold"
              style={{
                background: `rgba(${accentRgb},0.18)`,
                border: `1px solid rgba(${accentRgb},0.35)`,
                backdropFilter: 'blur(12px)',
                color: accent,
              }}>
              Brume Satinée — Best-seller
            </div>
          </motion.div>

          {/* Side stat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="absolute -right-2 top-1/3 text-right"
          >
            <p className="font-serif text-3xl font-bold" style={{ color: accent }}>100%</p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: textMuted }}>Naturel</p>
          </motion.div>
        </motion.div>

        {/* Right — product cards grid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="grid grid-cols-2 gap-3"
        >
          {products.slice(0, 4).map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
            >
              <Link href={`/v3/boutique/${p.slug}`} className="group block">
                <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: '3/4' }}>
                  <Image
                    src={p.imageUrl || '/images/shooting/shooting-solo.jpg'}
                    alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: 'brightness(0.75) saturate(0.85)' }}
                  />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top,rgba(6,6,14,.8) 0%,transparent 55%)' }} />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="font-serif text-xs font-semibold leading-tight mb-0.5" style={{ color: '#f0ede8' }}>{p.name}</p>
                    <p className="text-[10px] font-bold" style={{ color: accent }}>{fmt(p)}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
