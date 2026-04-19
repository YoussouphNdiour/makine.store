import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import NavV3Light from '@/components/NavV3Light'
import V3EditorialSection from '@/components/V3EditorialSection'
import V3GallerySection from '@/components/V3GallerySection'

export const dynamic = 'force-dynamic'

// Rose foncé du logo
const ACCENT = '#9e3d58'
const ACCENT_RGB = '158,61,88'

function px(p: { price: number; priceXOF: number }) {
  if (p.priceXOF > 0) return `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
  if (p.price > 0) return `${p.price.toFixed(2)} €`
  return 'Sur demande'
}

const TICKER_ITEMS = ['NATUREL', 'SÉNÉGAL', 'PARIS', 'LUXE', 'ARTISANAL', 'NATUREL', 'SÉNÉGAL', 'PARIS', 'LUXE', 'ARTISANAL']

export default async function V3LightHome() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  return (
    <div style={{ background: '#fdfaf7', color: '#1a0a12', fontFamily: 'var(--font-inter), Inter, sans-serif' }}
      className="min-h-screen overflow-x-hidden">
      <NavV3Light />

      {/* ════ HERO ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/shooting/hero-ebony.jpg" alt="" fill priority sizes="100vw"
            className="object-cover object-center"
            style={{ filter: 'brightness(0.55) saturate(0.8)' }} />
        </div>
        {/* Light-to-cream gradient from bottom */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(253,250,247,0.15) 0%, rgba(253,250,247,0.05) 35%, rgba(253,250,247,0.9) 80%, #fdfaf7 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(253,250,247,0.6) 0%, transparent 65%)' }} />

        {/* Rose glow */}
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(${ACCENT_RGB},0.07) 0%, transparent 70%)` }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20 pt-32 w-full">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-block w-10 h-px" style={{ background: ACCENT }} />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: ACCENT }}>
              Cosmétiques Naturels
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif font-bold leading-[0.92] mb-10"
            style={{ fontSize: 'clamp(3.5rem,10vw,8rem)', letterSpacing: '-0.03em' }}>
            <span className="block" style={{ color: '#1a0a12' }}>La beauté</span>
            <span className="block" style={{
              background: `linear-gradient(90deg, #7a2840 0%, #f0a8b8 40%, ${ACCENT} 60%, #f0a8b8 80%, #7a2840 100%)`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>authentique</span>
            <span className="block" style={{ color: 'rgba(26,10,18,0.45)' }}>commence ici.</span>
          </h1>

          {/* Bottom row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="max-w-md text-base leading-relaxed" style={{ color: 'rgba(26,10,18,0.55)' }}>
              Gammes corporelles, huiles précieuses et soins artisanaux formulés pour tous les teints.
              <span style={{ color: ACCENT }}> Sénégal & France.</span>
            </p>
            <div className="flex items-center gap-3">
              <Link href="/v3/boutique"
                className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: ACCENT, color: '#fff' }}>
                Découvrir
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium"
                style={{ background: `rgba(${ACCENT_RGB},0.08)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.2)` }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#4ade80' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex gap-0 mt-14 border-t" style={{ borderColor: `rgba(${ACCENT_RGB},0.1)` }}>
            {[{ n: '100%', l: 'Naturel' }, { n: '16+', l: 'Produits' }, { n: '2', l: 'Pays livrés' }, { n: '∞', l: 'Résultats' }]
              .map(({ n, l }, i) => (
                <div key={l} className="flex-1 pt-6 pr-4" style={{ borderRight: i < 3 ? `1px solid rgba(${ACCENT_RGB},0.1)` : 'none' }}>
                  <p className="font-serif font-bold text-3xl" style={{ color: ACCENT }}>{n}</p>
                  <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: 'rgba(26,10,18,0.35)' }}>{l}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ════ TICKER ══════════════════════════════════════════ */}
      <div className="relative py-5 overflow-hidden border-y"
        style={{ borderColor: `rgba(${ACCENT_RGB},0.12)`, background: `rgba(${ACCENT_RGB},0.03)` }}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 mx-6">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: `rgba(${ACCENT_RGB},0.6)` }}>{item}</span>
              <span style={{ color: `rgba(${ACCENT_RGB},0.2)`, fontSize: '6px' }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════ EDITORIAL — V1 (section claire) ═══════════════ */}
      <V3EditorialSection
        products={products.map(p => ({
          id: p.id, slug: p.slug, name: p.name, price: p.price, priceXOF: p.priceXOF,
          imageUrl: (p as { imageUrl?: string | null }).imageUrl,
        }))}
        accent={ACCENT}
        accentRgb={ACCENT_RGB}
        bg={`rgba(${ACCENT_RGB},0.04)`}
        textMuted="rgba(26,10,18,0.45)"
        borderColor={`rgba(${ACCENT_RGB},0.08)`}
        dark={false}
      />

      {/* ════ CATEGORIES ══════════════════════════════════════ */}
      <section className="py-6 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { slug: 'gamme', label: 'Gammes',  sub: 'Corps',      img: 'trio-sourires.jpg',  n: '01' },
            { slug: 'soins', label: 'Soins',   sub: 'Visage',     img: 'model-gommage.jpg',  n: '02' },
            { slug: 'huile', label: 'Huiles',  sub: 'Précieuses', img: 'model-huile.jpg',    n: '03' },
            { slug: 'savon', label: 'Savons',  sub: 'Artisanaux', img: 'model-brume.jpg',    n: '04' },
          ].map(({ slug, label, sub, img, n }) => (
            <Link key={slug} href={`/v3/boutique?cat=${slug}`}
              className="group relative rounded-2xl overflow-hidden lux-card-hover"
              style={{ aspectRatio: '1/1', border: `1px solid rgba(${ACCENT_RGB},0.1)` }}>
              <Image src={`/images/shooting/${img}`} alt={label} fill sizes="25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ filter: 'brightness(0.55) saturate(0.8)' }} />
              <div className="absolute inset-0 transition-all duration-500"
                style={{ background: 'linear-gradient(to top,rgba(26,10,18,0.88) 0%,rgba(26,10,18,0.3) 60%,transparent 100%)' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, rgba(${ACCENT_RGB},0.1) 0%, transparent 60%)` }} />
              <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-5">
                <span className="text-xs font-semibold" style={{ color: `rgba(${ACCENT_RGB},0.5)` }}>{n}</span>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(253,250,247,0.5)' }}>{sub}</p>
                  <h3 className="font-serif font-bold text-lg" style={{ color: '#fdfaf7' }}>{label}</h3>
                  <div className="flex items-center gap-2 mt-2 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="h-px flex-1" style={{ background: `rgba(${ACCENT_RGB},0.5)` }} />
                    <span className="text-xs" style={{ color: ACCENT }}>→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════ EDITORIAL QUOTE ═════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(${ACCENT_RGB},0.05) 0%, transparent 70%)` }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
          style={{ background: `linear-gradient(to right, transparent, rgba(${ACCENT_RGB},0.3), transparent)` }} />

        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-10" style={{ color: `rgba(${ACCENT_RGB},0.5)` }}>Makiné</p>
        <blockquote className="font-serif font-bold leading-[1.1] max-w-4xl mx-auto"
          style={{ fontSize: 'clamp(2rem,6vw,5rem)', letterSpacing: '-0.02em' }}>
          <span style={{ color: `rgba(26,10,18,0.2)` }}>&ldquo;</span>
          <span style={{ color: '#1a0a12' }}>Née à </span>
          <em className="not-italic" style={{ color: ACCENT }}>Thiès</em>
          <span style={{ color: '#1a0a12' }}>, portée</span>
          <br />
          <span style={{ color: '#1a0a12' }}>jusqu&apos;à </span>
          <em className="not-italic" style={{ color: ACCENT }}>Paris</em>
          <span style={{ color: `rgba(26,10,18,0.2)` }}>&rdquo;</span>
        </blockquote>
        <p className="mt-10 max-w-xl mx-auto text-base leading-relaxed" style={{ color: 'rgba(26,10,18,0.45)' }}>
          Des formules naturelles, douces et efficaces qui subliment la beauté africaine — pour chaque teint, à chaque latitude.
        </p>
      </section>

      {/* ════ GALLERY — V4 (3-col scroll) ════════════════════ */}
      <V3GallerySection accent={ACCENT} accentRgb={ACCENT_RGB} dark={false} />

      {/* ════ VALUES ══════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🌿', title: '100% Naturel',     desc: 'Sans parabènes ni colorants artificiels' },
            { icon: '✨', title: 'Visible',           desc: 'Peau lumineuse dès les premières applications' },
            { icon: '🌍', title: 'SN & FR',           desc: 'Livraison Sénégal et France' },
            { icon: '💛', title: 'Tous les teints',   desc: 'Formulé pour sublimer chaque carnation' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl p-5 transition-all duration-300"
              style={{ background: `rgba(${ACCENT_RGB},0.04)`, border: `1px solid rgba(${ACCENT_RGB},0.1)` }}>
              <span className="text-2xl block mb-4">{icon}</span>
              <p className="font-serif font-semibold text-sm mb-1.5" style={{ color: '#1a0a12' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(26,10,18,0.45)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════ CTA FINAL ═══════════════════════════════════════ */}
      <section className="relative py-40 px-6 lg:px-12 text-center overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, #f5eaee 0%, #fdfaf7 50%, #f7eff2 100%)` }} />
        <div className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 60%, rgba(${ACCENT_RGB},0.08) 0%, transparent 65%)` }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, rgba(${ACCENT_RGB},0.2), transparent)` }} />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-serif font-bold" style={{ fontSize: '32vw', color: `rgba(${ACCENT_RGB},0.03)`, lineHeight: 1 }}>M</span>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-8" style={{ color: `rgba(${ACCENT_RGB},0.5)` }}>
            Commander maintenant
          </p>
          <h2 className="font-serif font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem,7vw,5.5rem)', letterSpacing: '-0.03em' }}>
            <span style={{ color: '#1a0a12' }}>Prête à sublimer</span>
            <br />
            <span style={{ color: ACCENT }}>votre peau ?</span>
          </h2>
          <p className="text-base leading-relaxed mb-12 max-w-lg mx-auto" style={{ color: 'rgba(26,10,18,0.45)' }}>
            Paiement sécurisé Wave & Orange Money. Livraison express au Sénégal et en France.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <Link href="/v3/boutique"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{ background: ACCENT, color: '#fff' }}>
              Voir la boutique
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-medium"
              style={{ border: `1px solid rgba(${ACCENT_RGB},0.2)`, color: ACCENT }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#4ade80' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs" style={{ color: 'rgba(26,10,18,0.3)' }}>
            <a href="tel:+221710581711" className="transition-colors hover:text-[#9e3d58]">🇸🇳 +221 71 058 17 11</a>
            <a href="tel:+33761783612" className="transition-colors hover:text-[#9e3d58]">🇫🇷 +33 7 61 78 36 12</a>
            <a href="mailto:fatimata6590@gmail.com" className="transition-colors hover:text-[#9e3d58]">fatimata6590@gmail.com</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderTop: `1px solid rgba(${ACCENT_RGB},0.1)` }}>
        <span className="font-serif text-sm" style={{ color: 'rgba(26,10,18,0.35)' }}>Makiné</span>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(26,10,18,0.3)' }}>
          <Link href="/v3" className="transition-colors hover:text-[#9e3d58]">Version sombre</Link>
          <span>·</span>
          <span style={{ color: ACCENT }}>Version claire</span>
        </div>
        <div className="flex gap-5 text-xs" style={{ color: 'rgba(26,10,18,0.3)' }}>
          <Link href="/v3/boutique" className="transition-colors hover:text-[#9e3d58]">Boutique</Link>
          <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-green-600">WhatsApp</a>
          <Link href="/checkout" className="transition-colors hover:text-[#9e3d58]">Panier</Link>
        </div>
      </footer>
    </div>
  )
}
