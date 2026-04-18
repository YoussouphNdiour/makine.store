import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getProductImageUrl } from '@/data/productImages'
import HeaderV3 from '@/components/HeaderV3'

export const dynamic = 'force-dynamic'

const WA_NUMBER = '221710581711'

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

const SHOOTING_IMGS = [
  'hero-ebony.jpg',
  'trio-sourires.jpg',
  'model-gommage.jpg',
  'model-huile.jpg',
  'model-brume.jpg',
  'trio-produits.jpg',
]

const CATEGORIES = [
  { slug: 'gamme', label: 'Gammes Corporelles', sub: 'Hydratation & Éclat', img: 'trio-sourires.jpg' },
  { slug: 'soins', label: 'Soins Visage',        sub: 'Pureté Naturelle',   img: 'model-gommage.jpg' },
  { slug: 'huile', label: 'Huiles Précieuses',   sub: 'Nutrition Intense',  img: 'model-huile.jpg' },
  { slug: 'savon', label: 'Savons Artisanaux',   sub: 'Douceur & Pureté',   img: 'model-brume.jpg' },
]

const VALUES = [
  { icon: '🌿', title: '100% Naturel', desc: 'Formules sans parabènes ni colorants artificiels' },
  { icon: '✨', title: 'Résultats Visibles', desc: 'Peau lumineuse dès les premières applications' },
  { icon: '💛', title: 'Tous les Teints', desc: 'Conçu pour sublimer chaque carnation' },
  { icon: '🌍', title: 'SN & FR', desc: 'Livraison au Sénégal et en France' },
]

export default async function HomeV3() {
  const featuredProducts = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return (
    <div className="bg-lux-void text-lux-text min-h-screen overflow-x-hidden">
      <HeaderV3 transparent />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/shooting/hero-ebony.jpg"
            alt="Makiné — Cosmétiques Naturels"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105"
          />
          {/* Layered dark overlays for luxury feel */}
          <div className="absolute inset-0 bg-gradient-to-r from-lux-void/95 via-lux-void/70 to-lux-void/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-lux-void via-transparent to-lux-void/40" />
        </div>

        {/* Decorative gold orb */}
        <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-lux-gold/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-lux-rose/10 blur-[80px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pt-24 pb-20 w-full">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-lux-gold/60" />
              <span className="text-lux-gold text-xs font-semibold tracking-[0.25em] uppercase">
                Cosmétiques Naturels
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.0] text-balance mb-8">
              <span className="text-lux-text">La beauté</span>
              <br />
              <span className="bg-lux-gold-grad bg-clip-text text-transparent">
                authentique
              </span>
              <br />
              <span className="text-lux-text/70">commence ici</span>
            </h1>

            {/* Tagline */}
            <p className="text-lux-muted text-lg md:text-xl leading-relaxed mb-12 max-w-lg">
              Gammes corporelles, huiles précieuses et soins artisanaux formulés pour tous les teints.{' '}
              <span className="text-lux-gold/80">Sénégal & France.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-16">
              <Link
                href="/v3/boutique"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold overflow-hidden transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #d4a96a, #9a7040)' }}
              >
                <span className="relative z-10 text-white">Découvrir la boutique</span>
                <span className="relative z-10 transition-transform group-hover:translate-x-1 text-white/80">→</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-medium border border-white/15 hover:border-green-400/40 text-lux-muted hover:text-green-300 transition-all duration-300 hover:bg-green-400/5"
              >
                {WA_ICON}
                Commander via WhatsApp
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-10">
              {[
                { value: '100%', label: 'Naturel' },
                { value: '16+', label: 'Produits' },
                { value: '2', label: 'Pays livrés' },
              ].map(({ value, label }) => (
                <div key={label} className="border-l border-lux-gold/30 pl-5">
                  <p className="font-serif text-3xl font-bold text-lux-gold">{value}</p>
                  <p className="text-xs text-lux-muted mt-1 tracking-wide uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="w-px h-14 bg-gradient-to-b from-lux-gold to-transparent" />
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
      <section className="py-28 relative">
        {/* Subtle gold glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,169,106,0.06)_0%,transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
          {/* Header */}
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-lux-gold/50" />
                <span className="text-lux-gold text-xs font-semibold tracking-[0.2em] uppercase">Sélection</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-lux-text">
                Nos bestsellers
              </h2>
            </div>
            <Link
              href="/v3/boutique"
              className="hidden md:flex items-center gap-2 text-sm text-lux-muted hover:text-lux-gold transition-colors group"
            >
              Voir tout
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {featuredProducts.map((product, i) => {
              const imgUrl = (product as { imageUrl?: string | null }).imageUrl || getProductImageUrl(product.slug)
              const price = product.priceXOF > 0
                ? `${product.priceXOF.toLocaleString('fr-FR')} FCFA`
                : `${product.price.toFixed(2)} €`
              return (
                <Link
                  key={product.id}
                  href={`/v3/boutique/${product.slug}`}
                  className={`group relative rounded-2xl overflow-hidden border border-white/6 hover:border-lux-gold/30 transition-all duration-500 ${
                    i === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${i === 0 ? 'h-72 md:h-full md:min-h-[500px]' : 'h-52 md:h-60'}`}>
                    <Image
                      src={imgUrl}
                      alt={product.name}
                      fill
                      sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 50vw, 33vw'}
                      className="object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                    {/* Dark overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-lux-void/90 via-lux-void/20 to-transparent" />

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-4 left-4">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-lux-gold/20 text-lux-gold border border-lux-gold/30 backdrop-blur-sm">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Product info on image (bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className={`font-serif font-bold text-lux-text leading-tight mb-1 group-hover:text-lux-gold transition-colors ${
                        i === 0 ? 'text-xl md:text-2xl' : 'text-base'
                      }`}>
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lux-gold font-semibold text-sm">{price}</p>
                        <span className="text-xs text-lux-text/40 group-hover:text-lux-gold/60 transition-colors">
                          Voir →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/v3/boutique"
              className="inline-flex items-center gap-2 text-sm text-lux-muted hover:text-lux-gold transition-colors"
            >
              Voir toute la collection →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,rgba(201,81,110,0.06)_0%,transparent_60%)]" />

        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-lux-gold/40" />
              <span className="text-lux-gold text-xs font-semibold tracking-[0.2em] uppercase">Univers Makiné</span>
              <div className="h-px w-8 bg-lux-gold/40" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-lux-text">
              Nos gammes
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(({ slug, label, sub, img }) => (
              <Link
                key={slug}
                href={`/v3/boutique?cat=${slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] border border-white/6 hover:border-lux-gold/30 transition-all duration-500"
              >
                <Image
                  src={`/images/shooting/${img}`}
                  alt={label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-lux-void/90 via-lux-void/30 to-transparent group-hover:from-lux-void/80 transition-all duration-500" />

                {/* Gold shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-lux-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-lux-gold/60 text-xs mb-1 font-medium tracking-wide">{sub}</p>
                  <h3 className="font-serif text-lg font-bold text-lux-text group-hover:text-lux-gold transition-colors leading-tight">
                    {label}
                  </h3>
                  <div className="flex items-center gap-2 mt-3 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="h-px w-full bg-lux-gold/40" />
                    <span className="text-lux-gold text-xs whitespace-nowrap">Explorer →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Photo mosaic */}
            <div className="grid grid-cols-2 gap-3" style={{ height: '520px' }}>
              <div className="relative rounded-2xl overflow-hidden row-span-2 border border-white/6">
                <Image
                  src="/images/shooting/hero-ebony.jpg"
                  alt="Collection Makiné"
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-lux-gold/5 mix-blend-overlay" />
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-white/6">
                <Image
                  src="/images/shooting/trio-sourires.jpg"
                  alt="Gamme Makiné"
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-white/6">
                <Image
                  src="/images/shooting/model-gommage.jpg"
                  alt="Soins Makiné"
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Text content */}
            <div className="relative">
              {/* Decorative quote */}
              <span className="absolute -top-6 -left-2 font-serif text-9xl text-lux-gold/10 leading-none select-none pointer-events-none">
                "
              </span>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-lux-gold/50" />
                <span className="text-lux-gold text-xs font-semibold tracking-[0.2em] uppercase">Notre histoire</span>
              </div>

              <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
                <span className="text-lux-text">La beauté</span>
                <br />
                <span className="bg-lux-gold-grad bg-clip-text text-transparent">africaine</span>
                <br />
                <span className="text-lux-text">sublimée</span>
              </h2>

              <p className="text-lux-muted text-lg leading-relaxed mb-4">
                Née à <strong className="text-lux-text font-medium">Thiès</strong>, Makiné sublime la beauté africaine avec des formules naturelles, douces et efficaces pour chaque teint.
              </p>
              <p className="text-lux-muted leading-relaxed mb-10">
                Nos gammes voyagent de Dakar à Paris, portant l&apos;essence de la beauté sénégalaise dans chaque flacon.
              </p>

              {/* Values grid */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                {VALUES.map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="p-4 rounded-xl border border-white/6 hover:border-lux-gold/20 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span className="text-xl mb-2 block">{icon}</span>
                    <p className="text-lux-text text-sm font-semibold mb-1">{title}</p>
                    <p className="text-lux-muted text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/v3/boutique"
                className="inline-flex items-center gap-3 text-lux-gold text-sm font-medium hover:gap-5 transition-all group"
              >
                Découvrir toute la gamme
                <span className="h-px w-8 bg-lux-gold/50 group-hover:w-12 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────────────────────── */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mb-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-lux-gold/50" />
                <span className="text-lux-gold text-xs font-semibold tracking-[0.2em] uppercase">Shooting</span>
              </div>
              <h2 className="font-serif text-4xl font-bold text-lux-text">La beauté Makiné</h2>
            </div>
            <a
              href="https://www.tiktok.com/@makineparis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-lux-muted hover:text-lux-gold transition-colors hidden md:block"
            >
              @makineparis →
            </a>
          </div>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:gap-4 px-5 lg:px-8 max-w-7xl mx-auto pb-4 md:pb-0">
          {SHOOTING_IMGS.map((img, i) => (
            <div
              key={img}
              className={`flex-none w-64 md:w-auto relative rounded-2xl overflow-hidden border border-white/6 hover:border-lux-gold/20 transition-colors group ${
                i % 3 === 0 ? 'md:row-span-2' : ''
              }`}
              style={{
                height: i % 3 === 0 ? '360px' : '240px',
                minHeight: i % 3 === 0 ? '360px' : '240px',
              }}
            >
              <Image
                src={`/images/shooting/${img}`}
                alt={`Makiné shooting ${i + 1}`}
                fill
                sizes="(max-width: 768px) 256px, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-lux-void/20 group-hover:bg-lux-void/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────── */}
      <section className="relative py-32 px-5 lg:px-8 overflow-hidden">
        {/* Dark luxury gradient background */}
        <div className="absolute inset-0 bg-lux-surface" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,169,106,0.12)_0%,transparent_70%)]" />
        {/* Gold border top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-lux-gold/50 to-transparent" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-serif text-[28vw] font-bold text-white/[0.02] leading-none">M</span>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-lux-gold/30" />
            <span className="text-lux-gold text-xs font-semibold tracking-[0.2em] uppercase">Commander</span>
            <div className="h-px w-16 bg-lux-gold/30" />
          </div>

          <h2 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-lux-text">Prête à sublimer</span>
            <br />
            <span className="bg-lux-gold-grad bg-clip-text text-transparent">votre peau ?</span>
          </h2>

          <p className="text-lux-muted text-lg mb-14 max-w-xl mx-auto leading-relaxed">
            Livraison express au Sénégal et en France. Paiement sécurisé Wave & Orange Money.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <Link
              href="/v3/boutique"
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #d4a96a, #9a7040)', color: '#fff' }}
            >
              Voir la boutique
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full text-sm font-medium border border-white/10 hover:border-green-400/40 text-lux-muted hover:text-green-300 transition-all duration-300"
            >
              {WA_ICON}
              WhatsApp
            </a>
          </div>

          {/* Contacts */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-lux-muted/40 border-t border-white/5 pt-10">
            <a href="tel:+221710581711" className="hover:text-lux-gold transition-colors">🇸🇳 +221 71 058 17 11</a>
            <a href="tel:+33761783612" className="hover:text-lux-gold transition-colors">🇫🇷 +33 7 61 78 36 12</a>
            <a href="mailto:fatimata6590@gmail.com" className="hover:text-lux-gold transition-colors">fatimata6590@gmail.com</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-lux-gold/20">
              <Image src="/images/lolo/logo.png" alt="Makiné" fill className="object-cover" />
            </div>
            <span className="font-serif text-lux-muted text-sm">Makiné</span>
          </div>
          <p className="text-lux-muted/40 text-xs">
            © {new Date().getFullYear()} Makiné — Cosmétiques Naturels. Sénégal & France.
          </p>
          <div className="flex gap-5 text-xs text-lux-muted/40">
            <Link href="/v3/boutique" className="hover:text-lux-gold transition-colors">Boutique</Link>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
