'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const VARIANTS = [
  {
    n: 1,
    title: 'Minimalist Hero',
    desc: 'Framer-motion stagger · produit flottant · colonnes éditoriales · mots animés',
    img: '/images/shooting/model-brume.jpg',
    tag: 'Editorial',
  },
  {
    n: 2,
    title: 'FUI Bento Grid',
    desc: 'Grille bento sombre · cartes glassmorphism · hover framer-motion · FUI corners',
    img: '/images/shooting/shooting-duo.jpg',
    tag: 'Interface',
  },
  {
    n: 3,
    title: 'Velocity Marquee',
    desc: 'Texte stroke géant · marquee à vélocité de scroll · typo éditoriale 8vw',
    img: '/images/shooting/trio-produits.jpg',
    tag: 'Typographique',
  },
  {
    n: 4,
    title: '3-Column Reverse Scroll',
    desc: '3 colonnes scroll en alternance · hover image swap · carrousel immersif',
    img: '/images/shooting/shooting-back.jpg',
    tag: 'Immersif',
  },
  {
    n: 5,
    title: 'Cinematic Hero',
    desc: 'Hero parallax · mots rotatifs spring · nav pill flottante · scroll horizontal produits',
    img: '/images/shooting/hero-ebony.jpg',
    tag: 'Cinématique',
  },
]

export default function VariantsIndex() {
  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>
      <header className="px-8 py-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/v3" className="font-serif text-sm font-bold tracking-wider">← Makiné</Link>
        <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(212,169,106,0.5)' }}>
          5 Variantes Design
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <p className="text-[10px] tracking-[0.35em] uppercase mb-3" style={{ color: 'rgba(212,169,106,0.5)' }}>
            21st.dev · Inspiration
          </p>
          <h1 className="font-serif font-bold mb-3"
            style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.03em' }}>
            Choisissez votre design
          </h1>
          <p className="text-sm" style={{ color: 'rgba(240,237,232,0.35)' }}>
            5 directions créatives entièrement différentes pour Makiné V3.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {VARIANTS.map((v, i) => (
            <motion.div
              key={v.n}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.09 }}
              whileHover={{ y: -6 }}
            >
              <Link href={`/v3/variants/${v.n}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl mb-4"
                  style={{ aspectRatio: '16/10', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Image src={v.img} alt={v.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: 'brightness(0.55) saturate(0.8)' }} />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.8) 0%, transparent 60%)' }} />

                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(212,169,106,0.15)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.25)', backdropFilter: 'blur(8px)' }}>
                      {v.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <p className="font-serif text-2xl font-bold" style={{ color: '#d4a96a', lineHeight: 1 }}>V{v.n}</p>
                  </div>
                </div>

                <div>
                  <h2 className="font-serif text-base font-semibold mb-1.5 group-hover:text-[#d4a96a] transition-colors">
                    {v.title}
                  </h2>
                  <p className="text-xs leading-5" style={{ color: 'rgba(240,237,232,0.35)' }}>{v.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
