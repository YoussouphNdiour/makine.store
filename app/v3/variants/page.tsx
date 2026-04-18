'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion, AnimatePresence,
  useScroll, useTransform, useSpring,
  useMotionValue, useAnimationFrame, useInView,
} from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────
type P = {
  id: string; slug: string; name: string; category: string
  price: number; priceXOF: number; badge?: string | null
  imageUrl?: string | null; inStock: boolean; wholesale: boolean
}

// ─── V5 · Rotating words ─────────────────────────────────
const ROTATING_WORDS = [
  { text: 'Lumineuse',  color: '#d4a96a' },
  { text: 'Naturelle',  color: '#f0d9a8' },
  { text: 'Sublime',    color: '#e8b4be' },
  { text: 'Éclatante',  color: '#d4a96a' },
  { text: 'Dorée',      color: '#f0c070' },
]

function RotatingWord() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % ROTATING_WORDS.length), 2500)
    return () => clearInterval(id)
  }, [])
  const w = ROTATING_WORDS[idx]
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={idx}
        initial={{ opacity: 0, y: 40, rotateX: -20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -40, rotateX: 20, filter: 'blur(8px)' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
        style={{ color: w.color, display: 'inline-block' }}
      >{w.text}</motion.span>
    </AnimatePresence>
  )
}

// ─── V3 · Scroll-velocity marquee ────────────────────────
function useVelocityMarquee(base = 2.5) {
  const x = useMotionValue(0)
  const scrollVel = useMotionValue(0)
  const smooth = useSpring(scrollVel, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false })
  const dir = useRef(1)
  const { scrollY } = useScroll()
  const prev = useRef(0)

  useEffect(() =>
    scrollY.on('change', cur => {
      scrollVel.set(cur - prev.current)
      prev.current = cur
    }), [scrollY, scrollVel])

  useAnimationFrame((_, delta) => {
    const v = factor.get()
    if (v < 0) dir.current = -1
    if (v > 0) dir.current = 1
    const move = dir.current * base * (delta / 1000) * (1 + Math.abs(v))
    const next = x.get() + move
    // wrap
    if (next < -3000) x.set(0)
    if (next > 0)     x.set(-3000)
    x.set(next)
  })
  return x
}

function Marquee({ items, vel, stroke }: { items: string[]; vel: number; stroke?: boolean }) {
  const x = useVelocityMarquee(vel)
  return (
    <div className="overflow-hidden whitespace-nowrap select-none">
      <motion.div style={{ x }} className="inline-flex">
        {[...Array(5)].map((_, r) => (
          <span key={r} className="inline-flex items-center">
            {items.map((t, i) => (
              <span key={i} className="inline-block mr-8 font-serif font-bold"
                style={{
                  fontSize: 'clamp(3.5rem,8vw,7rem)',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  ...(stroke
                    ? { WebkitTextStroke: '1.5px rgba(212,169,106,0.3)', color: 'transparent' }
                    : { color: t === '✦' ? '#d4a96a' : 'rgba(240,237,232,0.85)' }),
                }}
              >{t}</span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── V4 · Scroll column ──────────────────────────────────
type ImgItem = { src: string; alt: string; label: string; price: string; slug?: string }

const COL_A: ImgItem[] = [
  { src: '/images/shooting/model-brume.jpg',   alt: 'Brume',    label: 'Brume Satinée',   price: '8 500 FCFA',  slug: 'brume-satinee' },
  { src: '/images/shooting/shooting-solo.jpg', alt: 'Éclat',    label: 'Éclat du Matin',  price: '12 000 FCFA', slug: 'eclat-matin' },
  { src: '/images/shooting/model-gommage.jpg', alt: 'Gommage',  label: 'Gommage Douceur', price: '7 000 FCFA',  slug: 'gommage' },
  { src: '/images/shooting/pajama-solo.jpg',   alt: 'Détente',  label: 'Pack Détente',    price: '22 000 FCFA', slug: 'pack-detente' },
]
const COL_B: ImgItem[] = [
  { src: '/images/shooting/model-huile.jpg',     alt: 'Huile',  label: 'Huile Précieuse', price: '9 500 FCFA',  slug: 'huile-baobab' },
  { src: '/images/shooting/trio-produits.jpg',   alt: 'Trio',   label: 'Trio Signature',  price: '28 000 FCFA', slug: 'trio' },
  { src: '/images/shooting/model-gloss.jpg',     alt: 'Gloss',  label: 'Gloss Naturel',   price: '5 500 FCFA',  slug: 'gloss' },
  { src: '/images/shooting/shooting-duo.jpg',    alt: 'Duo',    label: 'Duo Lumineux',    price: '18 000 FCFA', slug: 'duo' },
]
const COL_C: ImgItem[] = [
  { src: '/images/shooting/shooting-back.jpg',   alt: 'Corps',  label: 'Soin Corps',      price: '10 000 FCFA', slug: 'soin-corps' },
  { src: '/images/shooting/hero-ebony.jpg',      alt: 'Ebony',  label: 'Ebony Ritual',    price: '15 500 FCFA', slug: 'ebony' },
  { src: '/images/shooting/model-pearl-skin.jpg',alt: 'Pearl',  label: 'Pearl Skin',      price: '11 000 FCFA', slug: 'pearl-skin' },
  { src: '/images/shooting/trio-sourires.jpg',   alt: 'Gamme',  label: 'Gamme Complète',  price: '45 000 FCFA', slug: 'gamme' },
]

function HoverCard({ img }: { img: ImgItem }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl cursor-pointer flex-shrink-0"
      style={{ aspectRatio: '3/4' }}
    >
      <Image src={img.src} alt={img.alt} fill className="object-cover"
        style={{
          filter: hov ? 'brightness(0.9) saturate(1.1)' : 'brightness(0.6) saturate(0.8)',
          transform: hov ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      <div className="absolute inset-0"
        style={{ background: hov
          ? 'linear-gradient(to top,rgba(6,6,14,.65) 0%,transparent 55%)'
          : 'linear-gradient(to top,rgba(6,6,14,.85) 0%,transparent 50%)' }} />
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-xs font-semibold mb-0.5" style={{ color: '#f0ede8' }}>{img.label}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold" style={{ color: '#d4a96a' }}>{img.price}</p>
          <motion.span animate={{ opacity: hov ? 1 : 0, scale: hov ? 1 : 0.8 }} transition={{ duration: 0.2 }}
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: '#d4a96a', color: '#06060e' }}>
            Voir →
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

function ScrollColumn({ imgs, dir, speed = 1 }: { imgs: ImgItem[]; dir: 'up' | 'down'; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const dist = dir === 'up' ? [-90 * speed, 90 * speed] : [90 * speed, -90 * speed]
  const y = useTransform(scrollYProgress, [0, 1], dist.map(d => `${d}px`))
  return (
    <div ref={ref} className="flex-1 overflow-hidden">
      <motion.div style={{ y }} className="flex flex-col gap-4">
        {imgs.map((img, i) => <HoverCard key={i} img={img} />)}
      </motion.div>
    </div>
  )
}

// ─── V2 · Bento grid ─────────────────────────────────────
const BENTO = [
  { id: 'hero',   span: 'col-span-2 row-span-2', img: '/images/shooting/shooting-duo.jpg',    hero: true  },
  { id: 'stat1',  span: 'col-span-1 row-span-1', stat: '100%', statLbl: 'Naturel',            gold: true  },
  { id: 'stat2',  span: 'col-span-1 row-span-1', stat: '5K+',  statLbl: 'Clientes'                        },
  { id: 'img1',   span: 'col-span-1 row-span-2', img: '/images/shooting/model-huile.jpg',     lbl: 'Huile Précieuse' },
  { id: 'feat',   span: 'col-span-2 row-span-1', img: '/images/shooting/trio-produits.jpg',   side: true  },
  { id: 'img2',   span: 'col-span-1 row-span-1', img: '/images/shooting/model-gloss.jpg',     lbl: 'Gloss Naturel' },
  { id: 'wa',     span: 'col-span-1 row-span-1', wa: true                                                  },
  { id: 'quote',  span: 'col-span-2 row-span-1', quote: '"Makiné — la beauté africaine à son plus haut niveau."' },
] as const

type BentoItem = typeof BENTO[number]

function BCard({ item, i }: { item: BentoItem; i: number }) {
  const hasImg = 'img' in item
  const isHero = 'hero' in item && item.hero

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.06 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl ${item.span}`}
      style={{
        background: hasImg ? undefined : ('gold' in item && item.gold ? 'rgba(212,169,106,0.07)' : 'rgba(255,255,255,0.03)'),
        border: `1px solid ${hasImg ? 'transparent' : ('gold' in item && item.gold ? 'rgba(212,169,106,0.2)' : 'rgba(255,255,255,0.07)')}`,
        minHeight: '160px',
      }}
    >
      {hasImg && (
        <>
          <Image src={(item as { img: string }).img} alt="" fill className="object-cover"
            style={{ filter: isHero ? 'brightness(0.55) saturate(0.8)' : 'brightness(0.5) saturate(0.75)' }} />
          <div className="absolute inset-0"
            style={{ background: isHero
              ? 'linear-gradient(135deg,rgba(6,6,14,.9) 0%,rgba(6,6,14,.25) 100%)'
              : 'linear-gradient(to top,rgba(6,6,14,.88) 0%,rgba(6,6,14,.15) 65%)' }} />
        </>
      )}

      {/* FUI corners on hero */}
      {isHero && ['tl','tr','bl','br'].map(c => (
        <div key={c} className={`absolute w-5 h-5 ${c[0]==='t'?'top-4':'bottom-4'} ${c[1]==='l'?'left-4':'right-4'}`}
          style={{
            borderTop: c[0]==='t' ? '1px solid rgba(212,169,106,0.45)' : undefined,
            borderBottom: c[0]==='b' ? '1px solid rgba(212,169,106,0.45)' : undefined,
            borderLeft: c[1]==='l' ? '1px solid rgba(212,169,106,0.45)' : undefined,
            borderRight: c[1]==='r' ? '1px solid rgba(212,169,106,0.45)' : undefined,
          }} />
      ))}

      <div className={`relative z-10 h-full flex flex-col ${isHero ? 'justify-end p-6 md:p-8' : 'justify-center p-4 md:p-5'}`}>
        {isHero && (
          <>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(212,169,106,0.7)' }}>Collection Signature</p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3" style={{ color: '#f0ede8', lineHeight: 1.1 }}>
              L&apos;art de la<br />beauté naturelle
            </h3>
            <p className="text-xs leading-6 mb-5 max-w-xs" style={{ color: 'rgba(240,237,232,0.5)' }}>
              Soins africains formulés avec soin pour sublimer chaque peau.
            </p>
            <div className="flex gap-3">
              <Link href="/v3/boutique" className="px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 transition-transform"
                style={{ background: '#d4a96a', color: '#06060e' }}>Découvrir →</Link>
              <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#f0ede8', border: '1px solid rgba(255,255,255,0.12)' }}>
                Commander
              </a>
            </div>
          </>
        )}

        {'stat' in item && item.stat && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="font-serif text-4xl font-bold mb-1" style={{ color: '#d4a96a' }}>{item.stat}</p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>{item.statLbl}</p>
          </div>
        )}

        {'lbl' in item && item.lbl && (
          <div className="flex flex-col justify-end h-full">
            <p className="text-xs font-semibold" style={{ color: '#d4a96a' }}>{item.lbl}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,237,232,0.3)' }}>Voir →</p>
          </div>
        )}

        {'side' in item && item.side && (
          <div className="flex items-end justify-between w-full">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(212,169,106,0.6)' }}>Gamme Complète</p>
              <p className="font-serif text-lg font-semibold" style={{ color: '#f0ede8' }}>Tous nos soins naturels</p>
            </div>
            <Link href="/v3/boutique" className="text-xs px-4 py-2 rounded-full"
              style={{ background: 'rgba(212,169,106,0.15)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.25)' }}>
              Explorer
            </Link>
          </div>
        )}

        {'wa' in item && item.wa && (
          <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center h-full text-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" style={{ color: '#4ade80' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <p className="text-xs font-semibold" style={{ color: '#4ade80' }}>Commander<br />sur WhatsApp</p>
          </a>
        )}

        {'quote' in item && item.quote && (
          <div className="flex items-center justify-center h-full px-4">
            <p className="font-serif text-sm md:text-base italic text-center leading-7"
              style={{ color: 'rgba(240,237,232,0.5)' }}>{item.quote}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────
export default function VariantsUnified() {
  const [products, setProducts] = useState<P[]>([])
  const [navVisible, setNavVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const editorialRef = useRef<HTMLDivElement>(null)
  const editorialInView = useInView(editorialRef, { once: true, margin: '-80px' })

  const { scrollY } = useScroll()
  const rawY = useTransform(scrollY, [0, 700], [0, 140])
  const heroParallax = useSpring(rawY, { damping: 25, stiffness: 100 })

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => {})
    return scrollY.on('change', v => setNavVisible(v > 80))
  }, [scrollY])

  const fmt = (p: P) => p.priceXOF > 0
    ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
    : p.price > 0 ? `${p.price.toFixed(2)} €` : 'Sur demande'

  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>

      {/* ══ V5 HEADER — floating pill on scroll ══════════════ */}
      <AnimatePresence>
        {navVisible && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(6,6,14,0.88)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            <Link href="/v3" className="font-serif text-xs font-bold pr-3 mr-1"
              style={{ color: '#f0ede8', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
              Makiné
            </Link>
            {[['Boutique', '/v3/boutique'], ['Soins', '/v3/boutique?cat=soins'], ['Huiles', '/v3/boutique?cat=huile'], ['Gammes', '/v3/boutique?cat=gamme']].map(([l, h]) => (
              <Link key={h} href={h}
                className="px-3 py-1.5 rounded-xl text-xs transition-colors hover:text-white"
                style={{ color: 'rgba(240,237,232,0.5)' }}>{l}</Link>
            ))}
            <Link href="/checkout" className="ml-1 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: '#d4a96a', color: '#06060e' }}>Panier</Link>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Initial sparse header */}
      <AnimatePresence>
        {!navVisible && (
          <motion.header initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
            <Link href="/v3" className="font-serif text-sm font-bold tracking-widest uppercase">Makiné</Link>
            <Link href="/v3/boutique" className="text-xs tracking-widest" style={{ color: 'rgba(240,237,232,0.4)' }}>
              Boutique →
            </Link>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ══ V4 FLOATING BOTTOM BUTTON ════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full"
        style={{
          background: 'rgba(6,6,14,0.88)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(212,169,106,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full"
          style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Commander
        </a>
        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <Link href="/v3/boutique" className="text-xs font-medium px-4 py-2 rounded-full"
          style={{ background: 'rgba(212,169,106,0.12)', color: '#d4a96a' }}>
          Boutique
        </Link>
      </motion.div>

      {/* ══ § 1 · V5 CINEMATIC HERO ══════════════════════════ */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 scale-110" style={{ y: heroParallax }}>
          <Image src="/images/shooting/hero-ebony.jpg" alt="" fill priority className="object-cover"
            style={{ filter: 'brightness(0.38) saturate(0.7)' }} />
        </motion.div>
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom,rgba(6,6,14,.55) 0%,rgba(6,6,14,.15) 40%,rgba(6,6,14,.75) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center,transparent 30%,rgba(6,6,14,.5) 100%)' }} />

        <div className="relative z-10 text-center px-6" style={{ perspective: '1000px' }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs tracking-[0.4em] uppercase mb-8"
            style={{ color: 'rgba(212,169,106,0.7)' }}>
            Beauté Africaine · Formules Naturelles
          </motion.p>

          <motion.h1
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="font-serif font-bold mb-6"
            style={{ fontSize: 'clamp(3.5rem,9vw,8rem)', lineHeight: 1.05, letterSpacing: '-0.04em' }}>
            Votre peau<br />
            <span style={{ display: 'inline-block', minWidth: '5ch' }}><RotatingWord /></span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-sm leading-7 max-w-md mx-auto mb-10"
            style={{ color: 'rgba(240,237,232,0.45)' }}>
            Soins naturels inspirés des rituels ancestraux d'Afrique de l'Ouest.
            Révélez l'éclat qui vous est propre.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="flex items-center justify-center gap-4">
            <Link href="/v3/boutique"
              className="px-8 py-4 rounded-full text-sm font-bold hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#c49858,#d4a96a)', color: '#06060e' }}>
              Découvrir la collection
            </Link>
            <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#f0ede8', backdropFilter: 'blur(8px)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#4ade80' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Commander
            </a>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom,transparent,rgba(212,169,106,0.5))' }} />
          <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: 'rgba(212,169,106,0.5)' }}>Scroll</p>
        </motion.div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-8 py-16">
        <div className="grid grid-cols-3 gap-8 text-center">
          {[{ v: '100%', l: 'Naturel' }, { v: '5K+', l: 'Clientes satisfaites' }, { v: '15+', l: 'Références actives' }].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }} viewport={{ once: true }}>
              <p className="font-serif text-3xl md:text-4xl font-bold mb-1" style={{ color: '#d4a96a' }}>{s.v}</p>
              <p className="text-xs tracking-wider uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8">
        <div className="h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(212,169,106,0.3),transparent)' }} />
      </div>

      {/* ══ § 2 · V2 BENTO GRID ══════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
          className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(212,169,106,0.5)' }}>Interface Beauté</p>
            <h2 className="font-serif text-2xl font-bold">Notre univers en un regard</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px]" style={{ color: 'rgba(240,237,232,0.25)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#d4a96a' }} />
            Collection active
          </div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
          {BENTO.map((item, i) => <BCard key={item.id} item={item} i={i} />)}
        </div>
      </section>

      {/* ══ § 3 · PRODUCTS HORIZONTAL SCROLL ════════════════ */}
      <section className="py-16 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-8 max-w-7xl mx-auto px-6 md:px-12">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(212,169,106,0.5)' }}>Nos produits</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Sélection du moment</h2>
          </div>
          <Link href="/v3/boutique" className="hidden md:block text-sm" style={{ color: '#d4a96a' }}>Tout voir →</Link>
        </motion.div>
        <div className="px-6 md:px-12 overflow-x-auto pb-4" style={{ scrollSnapType: 'x mandatory' }}>
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {products.slice(0, 10).map((p, i) => {
              const [hov, setHov] = useState(false)
              return (
                <motion.div key={p.id}
                  initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }} viewport={{ once: true }}
                  onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                  className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer"
                  style={{ width: '200px', aspectRatio: '3/4', scrollSnapAlign: 'start',
                    boxShadow: hov ? '0 30px 80px rgba(212,169,106,0.15)' : '0 12px 40px rgba(0,0,0,0.4)' }}
                >
                  <Link href={`/v3/boutique/${p.slug}`}>
                    <Image src={p.imageUrl || '/images/shooting/shooting-solo.jpg'} alt={p.name} fill
                      className="object-cover"
                      style={{
                        filter: hov ? 'brightness(0.9)' : 'brightness(0.65) saturate(0.8)',
                        transform: hov ? 'scale(1.06)' : 'scale(1)',
                        transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)',
                      }} />
                    <div className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top,rgba(6,6,14,.85) 0%,transparent 55%)' }} />
                    {p.badge && (
                      <div className="absolute top-3 left-3">
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(212,169,106,0.18)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.3)', backdropFilter: 'blur(8px)' }}>
                          {p.badge}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="font-serif text-sm font-semibold mb-0.5" style={{ color: '#f0ede8' }}>{p.name}</p>
                      <p className="text-xs font-bold" style={{ color: '#d4a96a' }}>{fmt(p)}</p>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ § 4 · V3 MARQUEE ═════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        className="py-6 overflow-hidden">
        <Marquee items={['Beauté Naturelle','✦','Soins Africains','✦','Rituels Ancestraux','✦','Peau Lumineuse','✦','Makiné','✦']} vel={2} />
      </div>

      {/* ══ § 5 · V1 MINIMALIST EDITORIAL ═══════════════════ */}
      <section ref={editorialRef} className="max-w-7xl mx-auto px-6 md:px-16 py-28 grid md:grid-cols-3 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={editorialInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }} className="md:col-span-1">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'rgba(212,169,106,0.6)' }}>Notre Philosophie</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-snug mb-5">
            La nature au service<br />de votre beauté
          </h2>
          <div className="w-8 h-px mb-5" style={{ background: '#d4a96a' }} />
          <p className="text-sm leading-7 mb-8" style={{ color: 'rgba(240,237,232,0.4)' }}>
            Fondée sur les savoirs ancestraux d'Afrique de l'Ouest, Makiné sélectionne les ingrédients
            les plus purs pour des formules efficaces et respectueuses de votre peau.
          </p>
          <Link href="/v3/boutique"
            className="inline-block px-6 py-3 rounded-full text-xs font-bold hover:scale-105 transition-transform"
            style={{ background: '#d4a96a', color: '#06060e' }}>
            Explorer la gamme →
          </Link>
        </motion.div>

        {/* floating image */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={editorialInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="md:col-span-1 relative flex items-center justify-center">
          <div className="absolute w-4/5 h-4/5 rounded-full"
            style={{ background: 'rgba(212,169,106,0.06)', border: '1px solid rgba(212,169,106,0.1)' }} />
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-4/5 rounded-3xl overflow-hidden"
            style={{ aspectRatio: '3/4', boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(212,169,106,0.07)' }}>
            <Image src="/images/shooting/model-brume.jpg" alt="Brume" fill className="object-cover"
              style={{ filter: 'brightness(0.88) saturate(0.9)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top,rgba(6,6,14,.5) 0%,transparent 50%)' }} />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(212,169,106,0.18)', border: '1px solid rgba(212,169,106,0.3)', backdropFilter: 'blur(12px)', color: '#d4a96a' }}>
              Brume Satinée — Best-seller
            </div>
          </motion.div>
        </motion.div>

        {/* right text col */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={editorialInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }} className="md:col-span-1 flex flex-col gap-8">
          {[
            { n: '01', title: 'Ingrédients sélectionnés', desc: 'Karité, baobab, huiles précieuses — chaque composant est choisi pour son efficacité prouvée.' },
            { n: '02', title: 'Formules respectueuses', desc: "Sans parabènes, sans sulfates. Des formules douces qui préservent l'équilibre naturel de votre peau." },
            { n: '03', title: 'Beauté inclusive', desc: "Créés pour toutes les carnations, nos soins s'adaptent à chaque type de peau." },
          ].map((item, i) => (
            <motion.div key={item.n} initial={{ opacity: 0, y: 16 }}
              animate={editorialInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}>
              <p className="font-serif text-xs mb-1" style={{ color: 'rgba(212,169,106,0.4)' }}>{item.n}</p>
              <p className="text-sm font-semibold mb-1" style={{ color: '#f0ede8' }}>{item.title}</p>
              <p className="text-xs leading-6" style={{ color: 'rgba(240,237,232,0.35)' }}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ § 6 · SECOND MARQUEE (stroke) ═══════════════════ */}
      <div className="py-6 overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <Marquee items={['Brume Satinée','·','Huile de Baobab','·','Beurre de Karité','·','Gommage Corps','·','Gloss Naturel','·','Eau Micellaire','·']} vel={-1.8} stroke />
      </div>

      {/* ══ § 7 · V4 3-COLUMN REVERSE SCROLL ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-10 px-2">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(212,169,106,0.5)' }}>Galerie immersive</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Toute la beauté Makiné</h2>
          </div>
          <Link href="/v3/boutique" className="hidden md:block text-sm" style={{ color: '#d4a96a' }}>Voir tout →</Link>
        </motion.div>
        <div className="flex gap-4" style={{ minHeight: '180vh' }}>
          <ScrollColumn imgs={COL_A} dir="up"   speed={1.2} />
          <ScrollColumn imgs={COL_B} dir="down" speed={0.9} />
          <ScrollColumn imgs={COL_C} dir="up"   speed={1.4} />
        </div>
      </section>

      {/* ══ § 8 · CINEMATIC QUOTE ════════════════════════════ */}
      <section className="relative py-36 px-8 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/shooting/trio-sourires.jpg" alt="" fill className="object-cover"
            style={{ filter: 'brightness(0.28) saturate(0.6)' }} />
          <div className="absolute inset-0" style={{ background: 'rgba(6,6,14,0.72)' }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }} viewport={{ once: true }}
          className="relative z-10 text-center max-w-2xl mx-auto">
          <p className="font-serif italic text-xl md:text-2xl mb-10 leading-9"
            style={{ color: 'rgba(240,237,232,0.75)' }}>
            "Chaque produit Makiné est conçu pour révéler la beauté unique qui est en vous.
            Nos formules unissent tradition africaine et excellence moderne."
          </p>
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-px" style={{ background: 'rgba(212,169,106,0.4)' }} />
            <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(212,169,106,0.5)' }}>Makiné, 2026</p>
            <div className="w-12 h-px" style={{ background: 'rgba(212,169,106,0.4)' }} />
          </div>
          <Link href="/v3/boutique"
            className="inline-block px-10 py-4 rounded-full text-sm font-bold hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg,#c49858,#d4a96a,#e8c080)', color: '#06060e' }}>
            Découvrir la gamme
          </Link>
        </motion.div>
      </section>

      {/* ══ § 9 · BIG CTA (V3 style) ═════════════════════════ */}
      <section className="relative overflow-hidden py-32 px-8">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center,rgba(212,169,106,0.07) 0%,transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }} viewport={{ once: true }}
          className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="font-serif font-bold mb-10"
            style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            La beauté naturelle<br />
            <span style={{ WebkitTextStroke: '1px rgba(212,169,106,0.5)', color: 'transparent' }}>
              sans compromis
            </span>
          </h2>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/v3/boutique"
              className="px-10 py-4 rounded-full text-sm font-bold hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#c49858,#d4a96a)', color: '#06060e' }}>
              Commander maintenant
            </Link>
            <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-4 rounded-full text-sm font-medium"
              style={{ border: '1px solid rgba(212,169,106,0.3)', color: '#d4a96a' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#4ade80' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-10 pb-28 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/v3" className="font-serif text-sm font-bold tracking-wider" style={{ color: 'rgba(240,237,232,0.3)' }}>
          ← Makiné
        </Link>
        <p className="text-xs" style={{ color: 'rgba(240,237,232,0.15)' }}>© {new Date().getFullYear()} Makiné</p>
        <Link href="/v3/boutique" className="text-xs" style={{ color: 'rgba(240,237,232,0.3)' }}>Boutique →</Link>
      </footer>
    </div>
  )
}
