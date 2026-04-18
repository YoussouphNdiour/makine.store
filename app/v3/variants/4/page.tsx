'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

// Images for columns — alternate product vs model shots
const COL_IMAGES = [
  [
    { src: '/images/shooting/model-brume.jpg', alt: 'Brume Satinée', label: 'Brume Satinée', price: '8 500 FCFA' },
    { src: '/images/shooting/shooting-solo.jpg', alt: 'Soin Visage', label: 'Éclat du Matin', price: '12 000 FCFA' },
    { src: '/images/shooting/model-gommage.jpg', alt: 'Gommage', label: 'Gommage Douceur', price: '7 000 FCFA' },
    { src: '/images/shooting/pajama-solo.jpg', alt: 'Collection', label: 'Pack Détente', price: '22 000 FCFA' },
    { src: '/images/shooting/trio-sourires.jpg', alt: 'Gamme', label: 'Gamme Complète', price: '45 000 FCFA' },
  ],
  [
    { src: '/images/shooting/model-huile.jpg', alt: 'Huile', label: 'Huile Précieuse', price: '9 500 FCFA' },
    { src: '/images/shooting/trio-produits.jpg', alt: 'Trio', label: 'Trio Signature', price: '28 000 FCFA' },
    { src: '/images/shooting/model-gloss.jpg', alt: 'Gloss', label: 'Gloss Naturel', price: '5 500 FCFA' },
    { src: '/images/shooting/shooting-duo.jpg', alt: 'Duo', label: 'Duo Lumineux', price: '18 000 FCFA' },
    { src: '/images/shooting/model-pearl-skin.jpg', alt: 'Pearl', label: 'Pearl Skin', price: '11 000 FCFA' },
  ],
  [
    { src: '/images/shooting/shooting-back.jpg', alt: 'Corps', label: 'Soin Corps', price: '10 000 FCFA' },
    { src: '/images/shooting/hero-ebony.jpg', alt: 'Ebony', label: 'Ebony Ritual', price: '15 500 FCFA' },
    { src: '/images/shooting/model-brume.jpg', alt: 'Brume', label: 'Brume Corps', price: '8 000 FCFA' },
    { src: '/images/shooting/shooting-solo.jpg', alt: 'Solo', label: 'Sérum Éclat', price: '13 000 FCFA' },
    { src: '/images/shooting/trio-produits.jpg', alt: 'Pack', label: 'Pack Soins', price: '32 000 FCFA' },
  ],
]

function ScrollColumn({
  images,
  direction,
  speed = 1,
}: {
  images: { src: string; alt: string; label: string; price: string }[]
  direction: 'up' | 'down'
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const distance = direction === 'up' ? [-80 * speed, 80 * speed] : [80 * speed, -80 * speed]
  const y = useTransform(scrollYProgress, [0, 1], distance.map(d => `${d}px`))

  return (
    <div ref={ref} className="overflow-hidden flex-1">
      <motion.div style={{ y }} className="flex flex-col gap-4">
        {images.map((img, i) => (
          <HoverCard key={i} img={img} />
        ))}
      </motion.div>
    </div>
  )
}

function HoverCard({ img }: { img: { src: string; alt: string; label: string; price: string } }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-2xl cursor-pointer"
      style={{ aspectRatio: '3/4' }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
    >
      <Image
        src={img.src}
        alt={img.alt}
        fill
        className="object-cover transition-all duration-700"
        style={{
          filter: hovered ? 'brightness(0.9) saturate(1.1)' : 'brightness(0.65) saturate(0.8)',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
      />
      <div className="absolute inset-0 transition-all duration-500"
        style={{ background: hovered
          ? 'linear-gradient(to top, rgba(6,6,14,0.7) 0%, transparent 60%)'
          : 'linear-gradient(to top, rgba(6,6,14,0.85) 0%, transparent 55%)' }} />

      <motion.div
        className="absolute bottom-0 left-0 right-0 p-4"
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs font-semibold mb-0.5" style={{ color: '#f0ede8' }}>{img.label}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold" style={{ color: '#d4a96a' }}>{img.price}</p>
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: '#d4a96a', color: '#06060e', fontWeight: 700 }}
          >
            Voir →
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Variant4() {
  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5"
        style={{ background: 'rgba(6,6,14,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <Link href="/v3" className="font-serif text-sm font-bold tracking-wide">Makiné</Link>
        <nav className="hidden md:flex items-center gap-6">
          {['Boutique', 'Soins', 'Huiles', 'Gammes'].map(l => (
            <Link key={l} href={`/v3/boutique${l !== 'Boutique' ? `?cat=${l.toLowerCase()}` : ''}`}
              className="text-xs transition-opacity hover:opacity-100"
              style={{ color: 'rgba(240,237,232,0.4)' }}>
              {l}
            </Link>
          ))}
        </nav>
        <Link href="/checkout" className="text-xs px-3.5 py-1.5 rounded-full"
          style={{ background: 'rgba(212,169,106,0.1)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.2)' }}>
          Panier
        </Link>
      </header>

      {/* Sticky title panel */}
      <div className="sticky top-[72px] z-40 max-w-7xl mx-auto px-6 py-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(212,169,106,0.5)' }}>
            Collection 2026
          </p>
          <h1 className="font-serif font-bold"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Toute la beauté<br />
            <span style={{ color: '#d4a96a' }}>Makiné</span>
          </h1>
        </div>
        <Link href="/v3/boutique"
          className="hidden md:block px-6 py-3 rounded-full text-xs font-bold hover:scale-105 transition-transform"
          style={{ background: '#d4a96a', color: '#06060e' }}>
          Voir tout
        </Link>
      </div>

      {/* ── 3-COLUMN CAROUSEL ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
        <div className="flex gap-4" style={{ minHeight: '200vh' }}>
          <ScrollColumn images={COL_IMAGES[0]} direction="up" speed={1.2} />
          <ScrollColumn images={COL_IMAGES[1]} direction="down" speed={0.9} />
          <ScrollColumn images={COL_IMAGES[2]} direction="up" speed={1.4} />
        </div>
      </section>

      {/* Floating CTA — center */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex items-center gap-3 px-5 py-3 rounded-full"
          style={{ background: 'rgba(6,6,14,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(212,169,106,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
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
      </div>

      <footer className="px-6 py-6 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-serif text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>© 2026 Makiné</span>
        <div className="flex gap-4">
          {[1, 2, 3, 5].map(v => (
            <Link key={v} href={`/v3/variants/${v}`} className="text-xs hover:text-[#d4a96a]"
              style={{ color: 'rgba(240,237,232,0.25)' }}>V{v}</Link>
          ))}
        </div>
        <Link href="/v3" className="text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>← Retour</Link>
      </footer>
    </div>
  )
}
