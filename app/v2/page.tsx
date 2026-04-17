import Image from 'next/image'
import Link from 'next/link'
import { products } from '@/data/products'
import { getProductImageUrl } from '@/data/productImages'
import HeaderV2 from '@/components/HeaderV2'
import FooterV2 from '@/components/FooterV2'

const bestsellers = products.filter(p => p.badge === 'Bestseller' || p.badge === 'Nouveau').slice(0, 5)

// V2 — pyjama solo UNIQUEMENT pour le hero droit (demande utilisateur)
const V2_HERO_RIGHT = 'pajama-solo.jpg'

// Catégories — photos éditoriales fond rouge
const CAT_IMAGES = {
  gamme: 'trio-sourires.jpg',
  soins:  'model-gommage.jpg',
  huile:  'model-huile.jpg',
  savon:  'model-brume.jpg',
}

// Brand story mosaic — 3 photos éditoriales
const BRAND_MOSAIC = ['hero-ebony.jpg', 'trio-sourires.jpg', 'model-gommage.jpg']

// Galerie shooting — aucune photo pyjama
const GALLERY = [
  { img: 'hero-ebony.jpg',     tall: true  },
  { img: 'trio-sourires.jpg',  tall: false },
  { img: 'model-gommage.jpg',  tall: false },
  { img: 'trio-produits.jpg',  tall: false },
  { img: 'model-brume.jpg',    tall: true  },
  { img: 'model-gloss.jpg',    tall: false },
]

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

export default function HomeV2() {
  return (
    <main className="bg-rose-snow text-rose-text overflow-x-hidden">
      <HeaderV2 transparent />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex overflow-hidden">
        {/* Left panel — editorial text */}
        <div className="relative z-10 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-28 pb-16 w-full md:w-1/2 bg-rose-snow">
          {/* Petal blur decoration */}
          <div className="petal-blur w-72 h-72 bg-rose-petal top-20 -left-20" style={{ position: 'absolute' }} />
          <div className="petal-blur w-48 h-48 bg-rose-blush/40 bottom-20 right-0" style={{ position: 'absolute' }} />

          <div className="relative z-10 max-w-md">
            {/* Label */}
            <div className="flex items-center gap-3 mb-8 animate-slide-right">
              <div className="w-8 h-px bg-rose-deep" />
              <span className="text-rose-deep text-xs font-semibold tracking-widest uppercase">
                Cosmétiques Naturels
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-balance animate-fade-up mb-6 text-rose-wine">
              L&apos;élégance<br />
              <em className="not-italic text-rose-shimmer">commence</em><br />
              par une peau<br />douce
            </h1>

            {/* Tagline */}
            <p className="text-rose-muted text-base md:text-lg leading-relaxed mb-10 animate-fade-up delay-200">
              Gammes corporelles, soins, huiles et savons<br className="hidden md:block" />
              formulés pour tous les teints.{' '}
              <span className="text-rose-deep font-medium">Sénégal & France.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12 animate-fade-up delay-300">
              <Link
                href="/v2/boutique"
                className="group inline-flex items-center gap-3 bg-rose-deep hover:bg-rose-wine text-white font-semibold px-8 py-4 rounded-full text-sm transition-all duration-300 hover:shadow-rose-md hover:gap-4"
              >
                Découvrir la boutique
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="https://wa.me/221710581711"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-rose-blush hover:border-rose-deep text-rose-muted hover:text-rose-deep font-medium px-8 py-4 rounded-full text-sm transition-all duration-300 hover:bg-rose-petal"
              >
                {WA_ICON}
                Commander via WhatsApp
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 animate-fade-up delay-500">
              {[
                { value: '100%', label: 'Naturel' },
                { value: '16+', label: 'Produits' },
                { value: '2', label: 'Pays livrés' },
              ].map(({ value, label }) => (
                <div key={label} className="border-l-2 border-rose-blush pl-4">
                  <p className="font-serif text-2xl font-bold text-rose-deep">{value}</p>
                  <p className="text-xs text-rose-muted mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — image */}
        <div className="hidden md:block absolute right-0 top-0 w-1/2 h-full">
          <Image
            src={`/images/shooting/${V2_HERO_RIGHT}`}
            alt="Makiné cosmétiques"
            fill
            sizes="50vw"
            className="object-cover object-center"
            priority
          />
          {/* Rose gradient overlay left edge */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-snow via-rose-snow/5 to-transparent" />
          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-rose-snow/30" />
          {/* Rose tint */}
          <div className="absolute inset-0 bg-rose-deep/10 mix-blend-multiply" />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float opacity-40">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-10 bg-gradient-to-b from-rose-medium to-transparent" />
            <div className="w-1 h-1 rounded-full bg-rose-medium" />
          </div>
        </div>
      </section>

      {/* ── HORIZONTAL PRODUCT SCROLL ─────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-3">
                Sélection
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-rose-wine leading-tight">
                Nos bestsellers
              </h2>
            </div>
            <Link
              href="/v2/boutique"
              className="hidden md:flex items-center gap-2 text-sm text-rose-muted hover:text-rose-deep transition-colors group"
            >
              Voir toute la collection
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Scroll container */}
          <div className="flex gap-6 overflow-x-auto scroll-snap-x pb-4 -mx-5 lg:-mx-8 px-5 lg:px-8">
            {bestsellers.map((product) => (
              <Link
                key={product.id}
                href={`/v2/boutique/${product.slug}`}
                className="flex-none w-64 md:w-72 snap-start group rose-card-lift rounded-3xl overflow-hidden bg-rose-snow border border-rose-petal"
              >
                {/* Image */}
                <div className="relative h-72 bg-rose-petal overflow-hidden">
                  <Image
                    src={getProductImageUrl(product.slug)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 256px, 288px"
                    className="object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  {product.badge && (
                    <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${
                      product.badge === 'Bestseller' ? 'bg-rose-deep text-white' :
                      product.badge === 'Nouveau' ? 'bg-rose-wine text-white' :
                      product.badge === 'Pack' ? 'bg-rose-text text-white' :
                      'bg-rose-medium text-white'
                    }`}>
                      {product.badge}
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="bg-white text-rose-deep text-xs font-bold px-4 py-2 rounded-full shadow-rose-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      Voir le produit →
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-serif font-semibold text-base leading-tight mb-1 text-rose-wine group-hover:text-rose-deep transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-rose-muted line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-rose-deep text-sm">
                      {product.priceXOF > 0
                        ? `${product.priceXOF.toLocaleString('fr-FR')} FCFA`
                        : `${product.price.toFixed(2)} €`}
                    </p>
                    {product.priceXOF2 && (
                      <span className="text-xs text-rose-medium font-medium bg-rose-petal px-2 py-0.5 rounded-full">
                        Promo ×2
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {/* "Voir tout" card */}
            <Link
              href="/v2/boutique"
              className="flex-none w-64 md:w-72 snap-start rounded-3xl overflow-hidden bg-rose-gradient flex flex-col items-center justify-center gap-4 min-h-[400px] group"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <span className="text-white text-2xl font-serif">→</span>
              </div>
              <p className="font-serif text-xl font-bold text-white text-center px-6">
                Toute la<br />collection
              </p>
              <p className="text-xs text-white/60">{products.length} produits</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────────── */}
      <section className="py-24 bg-rose-snow">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-3">Univers Makiné</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-rose-wine">
              Nos gammes
            </h2>
          </div>

          {/* 2×2 grid with feature card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { cat: 'gamme', label: 'Gammes Corporelles', sub: 'Hydratation profonde', img: CAT_IMAGES.gamme, count: products.filter(p => p.category === 'gamme').length },
              { cat: 'soins', label: 'Soins Visage',       sub: 'Éclat naturel',      img: CAT_IMAGES.soins,  count: products.filter(p => p.category === 'soins').length },
              { cat: 'huile', label: 'Huiles Précieuses',  sub: 'Nutrition intense',  img: CAT_IMAGES.huile,  count: products.filter(p => p.category === 'huile').length },
              { cat: 'savon', label: 'Savons Artisanaux',  sub: 'Pureté & Douceur',  img: CAT_IMAGES.savon,  count: products.filter(p => p.category === 'savon').length },
            ].map(({ cat, label, sub, img, count }, i) => (
              <Link
                key={cat}
                href={`/v2/boutique?cat=${cat}`}
                className={`group relative rounded-3xl overflow-hidden bg-rose-petal rose-img-overlay ${
                  i === 0 ? 'md:row-span-2 aspect-[3/4] md:aspect-auto' : 'aspect-[4/5]'
                }`}
              >
                <Image
                  src={`/images/shooting/${img}`}
                  alt={label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-600"
                />
                {/* Rose gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-rose-wine/80 via-rose-deep/20 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <span className="text-white/50 text-xs mb-1">{count} produit{count > 1 ? 's' : ''}</span>
                  <p className="text-white/70 text-xs mb-1">{sub}</p>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight group-hover:text-rose-blush transition-colors">
                    {label}
                  </h3>
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-xs text-rose-blush font-medium">Explorer</span>
                    <div className="h-px flex-1 bg-rose-blush/50" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Mosaic photos */}
            <div className="grid grid-cols-2 gap-3 h-[540px]">
              <div className="relative rounded-3xl overflow-hidden row-span-2">
                <Image src={`/images/shooting/${BRAND_MOSAIC[0]}`} alt="Collection Makiné" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                {/* Rose film overlay */}
                <div className="absolute inset-0 bg-rose-deep/5 mix-blend-multiply" />
              </div>
              <div className="relative rounded-3xl overflow-hidden">
                <Image src={`/images/shooting/${BRAND_MOSAIC[1]}`} alt="Gamme Makiné" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                <div className="absolute inset-0 bg-rose-deep/5 mix-blend-multiply" />
              </div>
              <div className="relative rounded-3xl overflow-hidden">
                <Image src={`/images/shooting/${BRAND_MOSAIC[2]}`} alt="Soins Makiné" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                <div className="absolute inset-0 bg-rose-deep/5 mix-blend-multiply" />
              </div>
            </div>

            {/* Text */}
            <div className="relative">
              {/* Decorative quote mark */}
              <span className="absolute -top-8 -left-4 font-serif text-8xl text-rose-petal leading-none select-none pointer-events-none">
                "
              </span>

              <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-5">
                Notre histoire
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-rose-wine leading-tight mb-6">
                La beauté<br />
                <em className="not-italic text-rose-deep">authentique</em>
              </h2>

              <p className="text-rose-muted text-lg leading-relaxed mb-4">
                Née à <strong className="text-rose-wine">Thiès</strong>, Makiné sublime la beauté africaine avec des formules naturelles, douces et efficaces pour chaque teint.
              </p>
              <p className="text-rose-muted leading-relaxed mb-10">
                Nos gammes voyagent de Dakar à Paris, portant l&apos;essence de la beauté sénégalaise dans chaque flacon.
              </p>

              {/* Values as elegant badges */}
              <div className="flex flex-wrap gap-3 mb-10">
                {[
                  { icon: '🌿', label: '100% Naturel' },
                  { icon: '✨', label: 'Résultats visibles' },
                  { icon: '💛', label: 'Tous les teints' },
                  { icon: '🌍', label: 'SN & FR' },
                ].map(({ icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 bg-rose-petal border border-rose-blush/50 text-rose-wine text-sm font-medium px-4 py-2 rounded-full"
                  >
                    <span>{icon}</span> {label}
                  </span>
                ))}
              </div>

              <Link
                href="/v2/boutique"
                className="group inline-flex items-center gap-3 text-rose-deep font-semibold text-sm hover:text-rose-wine transition-colors"
              >
                Découvrir toute la gamme
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY (masonry 3-col) ─────────────────────────────── */}
      <section className="py-24 bg-rose-petal/40">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-3">Shooting</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-rose-wine">La beauté Makiné</h2>
            </div>
            <a
              href="https://www.tiktok.com/@makineparis"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm text-rose-muted hover:text-rose-deep transition-colors group"
            >
              @makineparis
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>

          {/* 3-column masonry-like grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map(({ img, tall }, i) => (
              <div
                key={i}
                className={`relative rounded-3xl overflow-hidden rose-img-overlay ${tall ? 'row-span-2' : ''}`}
                style={{ aspectRatio: tall ? undefined : '4/3', minHeight: tall ? '400px' : undefined }}
              >
                <Image
                  src={`/images/shooting/${img}`}
                  alt={`Makiné ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                {/* Rose hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-400 z-10">
                  <span className="bg-white/90 text-rose-deep text-xs font-bold px-4 py-2 rounded-full backdrop-blur-sm">
                    Voir +
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────── */}
      <section className="relative py-28 px-5 lg:px-8 overflow-hidden">
        {/* Full rose gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-blush via-rose-deep to-rose-wine" />
        {/* Petal blur decorations */}
        <div className="petal-blur w-96 h-96 bg-white/10 top-0 right-0" style={{ position: 'absolute' }} />
        <div className="petal-blur w-64 h-64 bg-rose-wine/30 bottom-0 left-0" style={{ position: 'absolute' }} />
        {/* Logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-serif text-[30vw] font-bold text-white/4 leading-none">M</span>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-rose-blush mb-5">
            Commander maintenant
          </p>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-6 text-balance">
            Prête à sublimer<br />
            <em className="not-italic text-rose-petal">votre peau ?</em>
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto">
            Livraison express au Sénégal et en France. Paiement sécurisé Wave &amp; Orange Money.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <Link
              href="/v2/boutique"
              className="group inline-flex items-center gap-3 bg-white hover:bg-rose-snow text-rose-deep font-bold px-8 py-4 rounded-full text-sm transition-all hover:shadow-lg hover:gap-4"
            >
              Voir la boutique
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="https://wa.me/221710581711"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-white/30 hover:border-white/70 text-white/80 hover:text-white font-medium px-8 py-4 rounded-full text-sm transition-all hover:bg-white/10"
            >
              {WA_ICON}
              <span className="text-green-300">WhatsApp</span>
            </a>
          </div>

          {/* Contacts */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30 border-t border-white/10 pt-8">
            <a href="tel:+221710581711" className="hover:text-white transition-colors">🇸🇳 +221 71 058 17 11</a>
            <a href="tel:+33761783612" className="hover:text-white transition-colors">🇫🇷 +33 7 61 78 36 12</a>
            <a href="mailto:fatimata6590@gmail.com" className="hover:text-white transition-colors">fatimata6590@gmail.com</a>
          </div>
        </div>
      </section>

      <FooterV2 />
    </main>
  )
}
