'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

type P = { id: string; slug: string; name: string; price: number; priceXOF: number; category: string; badge?: string | null; imageUrl?: string | null; inStock: boolean }

const GRID_ITEMS = [
  {
    id: 'hero',
    col: 'col-span-2 row-span-2',
    label: 'Collection Signature',
    img: '/images/shooting/shooting-duo.jpg',
    title: 'L\'art de la beauté naturelle',
    desc: 'Formulées avec des ingrédients d\'Afrique de l\'Ouest, nos soins révèlent l\'éclat de votre peau.',
    cta: true,
    textSize: 'text-3xl md:text-4xl',
  },
  {
    id: 'stat1',
    col: 'col-span-1 row-span-1',
    stat: '100%',
    statLabel: 'Ingrédients\nNaturels',
    bg: 'rgba(212,169,106,0.07)',
    border: 'rgba(212,169,106,0.2)',
  },
  {
    id: 'stat2',
    col: 'col-span-1 row-span-1',
    stat: '5⭐',
    statLabel: 'Avis clients\nvérifiés',
    bg: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.08)',
  },
  {
    id: 'product1',
    col: 'col-span-1 row-span-2',
    img: '/images/shooting/model-huile.jpg',
    productLabel: 'Huile Précieuse',
    productSlug: 'huile-baobab',
  },
  {
    id: 'feature',
    col: 'col-span-2 row-span-1',
    img: '/images/shooting/trio-produits.jpg',
    label: 'Gamme Complète',
    side: true,
  },
  {
    id: 'product2',
    col: 'col-span-1 row-span-1',
    img: '/images/shooting/model-gloss.jpg',
    productLabel: 'Gloss Naturel',
    productSlug: 'gloss',
  },
  {
    id: 'wa',
    col: 'col-span-1 row-span-1',
    wa: true,
    bg: 'rgba(74,222,128,0.06)',
    border: 'rgba(74,222,128,0.2)',
  },
  {
    id: 'quote',
    col: 'col-span-2 row-span-1',
    quote: '"Makiné, c\'est la promesse d\'une peau sublime au naturel."',
    bg: 'rgba(212,169,106,0.04)',
    border: 'rgba(212,169,106,0.12)',
  },
]

function BentoCard({ item, index }: { item: typeof GRID_ITEMS[0]; index: number }) {
  const hasImg = !!item.img
  const isHero = item.id === 'hero'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl ${item.col}`}
      style={{
        background: hasImg ? undefined : (item.bg ?? 'rgba(255,255,255,0.03)'),
        border: `1px solid ${item.border ?? (hasImg ? 'transparent' : 'rgba(255,255,255,0.07)')}`,
        minHeight: '160px',
      }}
    >
      {/* Background image */}
      {hasImg && (
        <>
          <Image src={item.img!} alt="" fill className="object-cover"
            style={{ filter: isHero ? 'brightness(0.6) saturate(0.8)' : 'brightness(0.55) saturate(0.8)' }} />
          <div className="absolute inset-0"
            style={{ background: isHero
              ? 'linear-gradient(135deg, rgba(6,6,14,0.9) 0%, rgba(6,6,14,0.3) 100%)'
              : 'linear-gradient(to top, rgba(6,6,14,0.85) 0%, rgba(6,6,14,0.2) 70%)' }} />
        </>
      )}

      {/* FUI corner lines (hero only) */}
      {isHero && (
        <>
          <div className="absolute top-4 left-4 w-5 h-5" style={{ borderTop: '1px solid rgba(212,169,106,0.5)', borderLeft: '1px solid rgba(212,169,106,0.5)' }} />
          <div className="absolute top-4 right-4 w-5 h-5" style={{ borderTop: '1px solid rgba(212,169,106,0.5)', borderRight: '1px solid rgba(212,169,106,0.5)' }} />
          <div className="absolute bottom-4 left-4 w-5 h-5" style={{ borderBottom: '1px solid rgba(212,169,106,0.5)', borderLeft: '1px solid rgba(212,169,106,0.5)' }} />
          <div className="absolute bottom-4 right-4 w-5 h-5" style={{ borderBottom: '1px solid rgba(212,169,106,0.5)', borderRight: '1px solid rgba(212,169,106,0.5)' }} />
        </>
      )}

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col ${isHero ? 'justify-end p-6 md:p-8' : 'justify-end p-4 md:p-5'}`}>
        {/* Hero card */}
        {isHero && (
          <>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(212,169,106,0.7)' }}>{item.label}</p>
            <h2 className={`font-serif font-bold mb-3 ${item.textSize}`} style={{ color: '#f0ede8', lineHeight: 1.1 }}>
              {item.title}
            </h2>
            <p className="text-xs leading-6 mb-5 max-w-sm" style={{ color: 'rgba(240,237,232,0.5)' }}>{item.desc}</p>
            <div className="flex gap-3">
              <Link href="/v3/boutique"
                className="px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                style={{ background: '#d4a96a', color: '#06060e' }}>
                Découvrir →
              </Link>
              <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full text-xs font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#f0ede8', border: '1px solid rgba(255,255,255,0.12)' }}>
                Commander
              </a>
            </div>
          </>
        )}

        {/* Stat card */}
        {item.stat && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="font-serif text-4xl font-bold mb-1" style={{ color: '#d4a96a' }}>{item.stat}</p>
            <p className="text-[10px] tracking-widest uppercase whitespace-pre-line text-center leading-4"
              style={{ color: 'rgba(240,237,232,0.35)' }}>{item.statLabel}</p>
          </div>
        )}

        {/* Product card */}
        {item.productLabel && (
          <Link href={`/v3/boutique`}>
            <p className="text-xs font-semibold" style={{ color: '#d4a96a' }}>{item.productLabel}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,237,232,0.3)' }}>Voir →</p>
          </Link>
        )}

        {/* Side feature card */}
        {item.side && (
          <div className="flex items-end justify-between w-full">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(212,169,106,0.6)' }}>{item.label}</p>
              <p className="font-serif text-lg font-semibold" style={{ color: '#f0ede8' }}>Tous nos soins naturels</p>
            </div>
            <Link href="/v3/boutique" className="text-xs px-4 py-2 rounded-full"
              style={{ background: 'rgba(212,169,106,0.15)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.25)' }}>
              Explorer
            </Link>
          </div>
        )}

        {/* WA card */}
        {item.wa && (
          <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center justify-center h-full text-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" style={{ color: '#4ade80' }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <p className="text-xs font-semibold" style={{ color: '#4ade80' }}>Commander<br />sur WhatsApp</p>
          </a>
        )}

        {/* Quote card */}
        {item.quote && (
          <div className="flex items-center justify-center h-full px-4">
            <p className="font-serif text-sm md:text-base italic text-center leading-7"
              style={{ color: 'rgba(240,237,232,0.5)' }}>{item.quote}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Variant2() {
  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(6,6,14,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/v3" className="font-serif text-sm font-bold tracking-wider" style={{ color: '#f0ede8' }}>
          Makiné
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {['/v3/boutique', '/v3/boutique?cat=soins', '/v3/boutique?cat=huile'].map((href, i) => (
            <Link key={href} href={href} className="px-3 py-1.5 rounded-lg text-xs transition-colors hover:text-white"
              style={{ color: 'rgba(240,237,232,0.4)' }}>
              {['Boutique', 'Soins', 'Huiles'][i]}
            </Link>
          ))}
        </div>
        <Link href="/checkout" className="text-xs px-3.5 py-1.5 rounded-full"
          style={{ background: 'rgba(212,169,106,0.12)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.2)' }}>
          Panier
        </Link>
      </header>

      {/* Bento Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
        {/* Title strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(212,169,106,0.6)' }}>Interface Beauté</p>
            <h1 className="font-serif text-2xl font-bold">Makiné — Saison 2026</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px]" style={{ color: 'rgba(240,237,232,0.25)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#d4a96a' }} />
            Système actif
          </div>
        </motion.div>

        {/* The bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[220px]">
          {GRID_ITEMS.map((item, i) => (
            <BentoCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </main>

      {/* Variant nav */}
      <footer className="px-6 py-6 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-serif text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>© 2026 Makiné</span>
        <div className="flex gap-4">
          {[1, 3, 4, 5].map(v => (
            <Link key={v} href={`/v3/variants/${v}`} className="text-xs transition-colors hover:text-[#d4a96a]"
              style={{ color: 'rgba(240,237,232,0.25)' }}>V{v}</Link>
          ))}
        </div>
        <Link href="/v3" className="text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>← Retour</Link>
      </footer>
    </div>
  )
}
