import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getProductImageUrl } from '@/data/productImages'
import NavV3 from '@/components/NavV3'

export const dynamic = 'force-dynamic'

/* ─── helpers ─────────────────────────────────────────────────────── */
function px(p: { price: number; priceXOF: number }) {
  if (p.priceXOF > 0) return `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
  if (p.price > 0) return `${p.price.toFixed(2)} €`
  return 'Sur demande'
}

const TICKER_ITEMS = [
  'NATUREL', 'SÉNÉGAL', 'PARIS', 'LUXE', 'ARTISANAL',
  'NATUREL', 'SÉNÉGAL', 'PARIS', 'LUXE', 'ARTISANAL',
]

/* ─── Page ─────────────────────────────────────────────────────────── */
export default async function V3Home() {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  const hero = products[0]
  const bento = products.slice(0, 6)

  return (
    <div style={{ background: '#06060e', color: '#f0ede8', fontFamily: 'var(--font-inter), Inter, sans-serif' }} className="min-h-screen overflow-x-hidden">
      <NavV3 />

      {/* ════════════════════════════════════════════
          HERO — full-screen cinematic split
      ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">

        {/* Full background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/shooting/hero-ebony.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            style={{ filter: 'brightness(0.45) saturate(0.7)' }}
          />
        </div>

        {/* Gradient layers */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,6,14,0.3) 0%, rgba(6,6,14,0.1) 30%, rgba(6,6,14,0.85) 80%, #06060e 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,6,14,0.7) 0%, transparent 60%)' }} />

        {/* Gold orbs */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,169,106,0.06) 0%, transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20 pt-32 w-full">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-block w-10 h-px" style={{ background: '#d4a96a' }} />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: '#d4a96a' }}>
              Cosmétiques Naturels
            </span>
          </div>

          {/* Massive headline */}
          <h1 className="font-serif font-bold leading-[0.92] mb-10" style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', letterSpacing: '-0.03em' }}>
            <span className="block" style={{ color: '#f0ede8' }}>La beauté</span>
            <span className="block text-gold-shimmer">authentique</span>
            <span className="block" style={{ color: 'rgba(240,237,232,0.5)' }}>commence ici.</span>
          </h1>

          {/* Bottom row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="max-w-md text-base leading-relaxed" style={{ color: 'rgba(240,237,232,0.55)' }}>
              Gammes corporelles, huiles précieuses et soins artisanaux formulés pour tous les teints.
              <span style={{ color: '#d4a96a' }}> Sénégal & France.</span>
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/v3/boutique"
                className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-300"
                style={{ background: '#d4a96a', color: '#06060e' }}
              >
                Découvrir
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="https://wa.me/221710581711"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(240,237,232,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#4ade80' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex gap-0 mt-14 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {[
              { n: '100%', l: 'Naturel' },
              { n: '16+',  l: 'Produits' },
              { n: '2',    l: 'Pays livrés' },
              { n: '∞',   l: 'Résultats' },
            ].map(({ n, l }, i) => (
              <div key={l} className="flex-1 pt-6 pr-4" style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p className="font-serif font-bold text-3xl" style={{ color: '#d4a96a' }}>{n}</p>
                <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: 'rgba(240,237,232,0.35)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TICKER MARQUEE
      ════════════════════════════════════════════ */}
      <div className="relative py-5 overflow-hidden border-y" style={{ borderColor: 'rgba(212,169,106,0.15)', background: 'rgba(212,169,106,0.03)' }}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 mx-6">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: 'rgba(212,169,106,0.7)' }}>{item}</span>
              <span style={{ color: 'rgba(212,169,106,0.25)', fontSize: '6px' }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          BENTO GRID — asymmetric product showcase
      ════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: '#d4a96a' }}>Collection</p>
            <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em', color: '#f0ede8' }}>
              Nos Bestsellers
            </h2>
          </div>
          <Link href="/v3/boutique" className="hidden md:flex items-center gap-2 text-sm transition-colors group" style={{ color: 'rgba(240,237,232,0.4)' }}>
            Voir tout
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {bento.map((p, i) => {
            const imgUrl = (p as { imageUrl?: string | null }).imageUrl || getProductImageUrl(p.slug)
            const isBig = i === 0 || i === 5
            return (
              <Link
                key={p.id}
                href={`/v3/boutique/${p.slug}`}
                className={`group relative lux-card-hover rounded-2xl overflow-hidden lux-img-overlay ${isBig ? 'md:col-span-2 md:row-span-2' : ''}`}
                style={{
                  aspectRatio: isBig ? '16/9' : '3/4',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Image
                  src={imgUrl}
                  alt={p.name}
                  fill
                  sizes={isBig ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 33vw'}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: 'brightness(0.7) saturate(0.85)' }}
                />
                {/* Gold tint on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'rgba(212,169,106,0.06)' }} />

                {/* Badge */}
                {p.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(212,169,106,0.2)', color: '#d4a96a', border: '1px solid rgba(212,169,106,0.3)', backdropFilter: 'blur(8px)' }}>
                      {p.badge}
                    </span>
                  </div>
                )}

                {/* Info overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
                  <p className="font-serif font-bold leading-tight mb-1 transition-colors group-hover:text-[#d4a96a]" style={{ fontSize: isBig ? '1.25rem' : '0.9rem', color: '#f0ede8' }}>
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold" style={{ color: '#d4a96a' }}>{px(p)}</p>
                    <span className="text-xs opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300" style={{ color: 'rgba(240,237,232,0.5)' }}>
                      Voir →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CATEGORIES — full-width horizontal strip
      ════════════════════════════════════════════ */}
      <section className="py-6 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { slug: 'gamme', label: 'Gammes', sub: 'Corps', img: 'trio-sourires.jpg', n: '01' },
            { slug: 'soins', label: 'Soins',  sub: 'Visage', img: 'model-gommage.jpg', n: '02' },
            { slug: 'huile', label: 'Huiles', sub: 'Précieuses', img: 'model-huile.jpg', n: '03' },
            { slug: 'savon', label: 'Savons', sub: 'Artisanaux', img: 'model-brume.jpg', n: '04' },
          ].map(({ slug, label, sub, img, n }) => (
            <Link
              key={slug}
              href={`/v3/boutique?cat=${slug}`}
              className="group relative rounded-2xl overflow-hidden lux-card-hover"
              style={{ aspectRatio: '1/1', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Image
                src={`/images/shooting/${img}`}
                alt={label}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ filter: 'brightness(0.5) saturate(0.7)' }}
              />
              <div className="absolute inset-0 transition-all duration-500" style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.9) 0%, rgba(6,6,14,0.3) 60%, transparent 100%)' }} />
              {/* Gold shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(212,169,106,0.12) 0%, transparent 60%)' }} />

              <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-5">
                <span className="text-xs font-semibold" style={{ color: 'rgba(212,169,106,0.4)' }}>{n}</span>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(240,237,232,0.4)' }}>{sub}</p>
                  <h3 className="font-serif font-bold text-lg transition-colors group-hover:text-[#d4a96a]" style={{ color: '#f0ede8' }}>
                    {label}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="h-px flex-1" style={{ background: 'rgba(212,169,106,0.5)' }} />
                    <span className="text-xs" style={{ color: '#d4a96a' }}>→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          EDITORIAL QUOTE
      ════════════════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(212,169,106,0.05) 0%, transparent 70%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,169,106,0.4), transparent)' }} />

        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-10" style={{ color: 'rgba(212,169,106,0.5)' }}>Makiné</p>

        <blockquote className="font-serif font-bold leading-[1.1] max-w-4xl mx-auto" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}>
          <span style={{ color: 'rgba(240,237,232,0.2)' }}>"</span>
          <span style={{ color: '#f0ede8' }}>Née à </span>
          <em className="not-italic text-gold-shimmer">Thiès</em>
          <span style={{ color: '#f0ede8' }}>, portée</span>
          <br />
          <span style={{ color: '#f0ede8' }}>jusqu&apos;à </span>
          <em className="not-italic text-gold-shimmer">Paris</em>
          <span style={{ color: 'rgba(240,237,232,0.2)' }}>"</span>
        </blockquote>

        <p className="mt-10 max-w-xl mx-auto text-base leading-relaxed" style={{ color: 'rgba(240,237,232,0.4)' }}>
          Des formules naturelles, douces et efficaces qui subliment la beauté africaine — pour chaque teint, à chaque latitude.
        </p>
      </section>

      {/* ════════════════════════════════════════════
          SHOOTING GALLERY — masonry overlap
      ════════════════════════════════════════════ */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: '#d4a96a' }}>Shooting</p>
            <h2 className="font-serif font-bold" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#f0ede8', letterSpacing: '-0.02em' }}>
              La beauté<br />en images
            </h2>
          </div>
          <a href="https://www.tiktok.com/@makineparis" target="_blank" rel="noopener noreferrer"
            className="text-xs transition-colors hidden md:block" style={{ color: 'rgba(240,237,232,0.3)' }}>
            @makineparis →
          </a>
        </div>

        {/* 3-column mosaic */}
        <div className="grid grid-cols-3 gap-3">
          {/* col 1 — tall */}
          <div className="flex flex-col gap-3">
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <Image src="/images/shooting/hero-ebony.jpg" alt="" fill sizes="33vw" className="object-cover" style={{ filter: 'brightness(0.6) saturate(0.8)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.6) 0%, transparent 50%)' }} />
            </div>
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
              <Image src="/images/shooting/model-gloss.jpg" alt="" fill sizes="33vw" className="object-cover" style={{ filter: 'brightness(0.6) saturate(0.8)' }} />
            </div>
          </div>
          {/* col 2 — offset top */}
          <div className="flex flex-col gap-3 mt-8">
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <Image src="/images/shooting/trio-sourires.jpg" alt="" fill sizes="33vw" className="object-cover" style={{ filter: 'brightness(0.6) saturate(0.8)' }} />
            </div>
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <Image src="/images/shooting/trio-produits.jpg" alt="" fill sizes="33vw" className="object-cover" style={{ filter: 'brightness(0.6) saturate(0.8)' }} />
            </div>
          </div>
          {/* col 3 */}
          <div className="flex flex-col gap-3">
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
              <Image src="/images/shooting/model-gommage.jpg" alt="" fill sizes="33vw" className="object-cover" style={{ filter: 'brightness(0.6) saturate(0.8)' }} />
            </div>
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '3/5' }}>
              <Image src="/images/shooting/model-brume.jpg" alt="" fill sizes="33vw" className="object-cover" style={{ filter: 'brightness(0.6) saturate(0.8)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          VALUES — 4-column cards
      ════════════════════════════════════════════ */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🌿', title: '100% Naturel', desc: 'Sans parabènes ni colorants artificiels' },
            { icon: '✨', title: 'Visible',       desc: 'Peau lumineuse dès les premières applications' },
            { icon: '🌍', title: 'SN & FR',       desc: 'Livraison Sénégal et France' },
            { icon: '💛', title: 'Tous les teints', desc: 'Formulé pour sublimer chaque carnation' },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(212,169,106,0.2)]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-2xl block mb-4">{icon}</span>
              <p className="font-serif font-semibold text-sm mb-1.5" style={{ color: '#f0ede8' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,237,232,0.4)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FINAL CTA — cinematic dark
      ════════════════════════════════════════════ */}
      <section className="relative py-40 px-6 lg:px-12 text-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0c0b18 0%, #06060e 50%, #13111f 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(212,169,106,0.1) 0%, transparent 65%)' }} />

        {/* Decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,169,106,0.3), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(212,169,106,0.15), transparent)' }} />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none">
          <span className="font-serif font-bold" style={{ fontSize: '32vw', color: 'rgba(240,237,232,0.015)', lineHeight: 1 }}>M</span>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-8" style={{ color: 'rgba(212,169,106,0.5)' }}>
            Commander maintenant
          </p>
          <h2 className="font-serif font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', letterSpacing: '-0.03em' }}>
            <span style={{ color: '#f0ede8' }}>Prête à sublimer</span>
            <br />
            <span className="text-gold-shimmer">votre peau ?</span>
          </h2>
          <p className="text-base leading-relaxed mb-12 max-w-lg mx-auto" style={{ color: 'rgba(240,237,232,0.4)' }}>
            Paiement sécurisé Wave & Orange Money. Livraison express au Sénégal et en France.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <Link
              href="/v3/boutique"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105"
              style={{ background: '#d4a96a', color: '#06060e' }}
            >
              Voir la boutique
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="https://wa.me/221710581711"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-medium transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.6)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#4ade80' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs" style={{ color: 'rgba(240,237,232,0.25)' }}>
            <a href="tel:+221710581711" className="hover:text-[#d4a96a] transition-colors">🇸🇳 +221 71 058 17 11</a>
            <a href="tel:+33761783612" className="hover:text-[#d4a96a] transition-colors">🇫🇷 +33 7 61 78 36 12</a>
            <a href="mailto:fatimata6590@gmail.com" className="hover:text-[#d4a96a] transition-colors">fatimata6590@gmail.com</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="px-6 lg:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-serif text-sm" style={{ color: 'rgba(240,237,232,0.3)' }}>Makiné</span>
        <p className="text-xs" style={{ color: 'rgba(240,237,232,0.2)' }}>© {new Date().getFullYear()} Makiné — Cosmétiques Naturels</p>
        <div className="flex gap-5 text-xs" style={{ color: 'rgba(240,237,232,0.25)' }}>
          <Link href="/v3/boutique" className="hover:text-[#d4a96a] transition-colors">Boutique</Link>
          <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">WhatsApp</a>
          <Link href="/checkout" className="hover:text-[#d4a96a] transition-colors">Panier</Link>
        </div>
      </footer>
    </div>
  )
}
