'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const COL_A = [
  { src: '/images/shooting/model-brume.jpg',    label: 'Brume Satinée',   price: '8 500 FCFA',  slug: 'brume-satinee' },
  { src: '/images/shooting/shooting-solo.jpg',  label: 'Éclat du Matin',  price: '12 000 FCFA', slug: 'eclat-matin' },
  { src: '/images/shooting/model-gommage.jpg',  label: 'Gommage Douceur', price: '7 000 FCFA',  slug: 'gommage' },
  { src: '/images/shooting/pajama-solo.jpg',    label: 'Pack Détente',    price: '22 000 FCFA', slug: 'pack-detente' },
]
const COL_B = [
  { src: '/images/shooting/model-huile.jpg',    label: 'Huile Précieuse', price: '9 500 FCFA',  slug: 'huile-baobab' },
  { src: '/images/shooting/trio-produits.jpg',  label: 'Trio Signature',  price: '28 000 FCFA', slug: 'trio' },
  { src: '/images/shooting/model-gloss.jpg',    label: 'Gloss Naturel',   price: '5 500 FCFA',  slug: 'gloss' },
  { src: '/images/shooting/shooting-duo.jpg',   label: 'Duo Lumineux',    price: '18 000 FCFA', slug: 'duo' },
]
const COL_C = [
  { src: '/images/shooting/shooting-back.jpg',      label: 'Soin Corps',   price: '10 000 FCFA', slug: 'soin-corps' },
  { src: '/images/shooting/hero-ebony.jpg',         label: 'Ebony Ritual', price: '15 500 FCFA', slug: 'ebony' },
  { src: '/images/shooting/model-pearl-skin.jpg',   label: 'Pearl Skin',   price: '11 000 FCFA', slug: 'pearl-skin' },
  { src: '/images/shooting/trio-sourires.jpg',      label: 'La Gamme',     price: '45 000 FCFA', slug: 'gamme' },
]

type ImgItem = { src: string; label: string; price: string; slug: string }

interface Props {
  accent?: string
  accentRgb?: string
  dark?: boolean
}

function HoverCard({ img, accent, accentRgb, dark }: { img: ImgItem; accent: string; accentRgb: string; dark: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl cursor-pointer"
      style={{ aspectRatio: '3/4' }}
    >
      <Image src={img.src} alt={img.label} fill className="object-cover"
        style={{
          filter: hov ? 'brightness(0.9) saturate(1.05)' : 'brightness(0.6) saturate(0.8)',
          transform: hov ? 'scale(1.07)' : 'scale(1)',
          transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      <div className="absolute inset-0"
        style={{ background: hov
          ? 'linear-gradient(to top,rgba(6,6,14,.65) 0%,transparent 55%)'
          : 'linear-gradient(to top,rgba(6,6,14,.85) 0%,transparent 50%)' }} />
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-xs font-semibold mb-0.5" style={{ color: '#f0ede8' }}>{img.label}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold" style={{ color: accent }}>{img.price}</p>
          <motion.span animate={{ opacity: hov ? 1 : 0, scale: hov ? 1 : 0.8 }} transition={{ duration: 0.2 }}
            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: accent, color: dark ? '#06060e' : '#fff' }}>
            Voir →
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

function ScrollCol({ imgs, dir, speed = 1, accent, accentRgb, dark }: {
  imgs: ImgItem[]; dir: 'up' | 'down'; speed?: number
  accent: string; accentRgb: string; dark: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const dist = dir === 'up' ? [-80 * speed, 80 * speed] : [80 * speed, -80 * speed]
  const y = useTransform(scrollYProgress, [0, 1], dist.map(d => `${d}px`))
  return (
    <div ref={ref} className="flex-1 overflow-hidden">
      <motion.div style={{ y }} className="flex flex-col gap-4">
        {imgs.map((img, i) => <HoverCard key={i} img={img} accent={accent} accentRgb={accentRgb} dark={dark} />)}
      </motion.div>
    </div>
  )
}

export default function V3GallerySection({ accent = '#d4607a', accentRgb = '212,96,122', dark = true }: Props) {
  const textColor = dark ? '#f0ede8' : '#1a0a12'
  const textMuted = dark ? 'rgba(240,237,232,0.3)' : 'rgba(26,10,18,0.4)'

  return (
    <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block w-8 h-px" style={{ background: accent }} />
            <p className="text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: accent }}>Shooting</p>
          </div>
          <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: textColor, letterSpacing: '-0.02em' }}>
            La beauté<br />en images
          </h2>
        </div>
        <a href="https://www.tiktok.com/@makineparis" target="_blank" rel="noopener noreferrer"
          className="text-xs transition-colors hidden md:block" style={{ color: textMuted }}>
          @makineparis →
        </a>
      </div>

      {/* 3-col alternating scroll */}
      <div className="flex gap-4" style={{ minHeight: '160vh' }}>
        <ScrollCol imgs={COL_A} dir="up"   speed={1.2} accent={accent} accentRgb={accentRgb} dark={dark} />
        <ScrollCol imgs={COL_B} dir="down" speed={0.9} accent={accent} accentRgb={accentRgb} dark={dark} />
        <ScrollCol imgs={COL_C} dir="up"   speed={1.4} accent={accent} accentRgb={accentRgb} dark={dark} />
      </div>

      {/* CTA centered */}
      <div className="text-center mt-12">
        <Link href="/v3/boutique"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: accent, color: dark ? '#06060e' : '#fff' }}>
          Voir toute la collection →
        </Link>
      </div>
    </section>
  )
}
