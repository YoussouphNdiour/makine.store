import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { products } from '@/data/products'
import { getProductImageUrl } from '@/data/productImages'
import HeaderV2 from '@/components/HeaderV2'
import FooterV2 from '@/components/FooterV2'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = products.find((p) => p.slug === params.slug)
  if (!product) return { title: 'Produit introuvable' }

  const priceLabel =
    product.priceXOF > 0
      ? `${product.priceXOF.toLocaleString('fr-FR')} FCFA`
      : product.price > 0
      ? `${product.price.toFixed(2)} €`
      : 'Prix sur demande'

  return {
    title: product.name,
    description: `${product.description} — ${priceLabel}. Livraison Sénégal & France.`,
    openGraph: {
      title: `${product.name} | Makiné`,
      description: `${product.description} — ${priceLabel}.`,
      images: [
        `https://makine.store/web/image/product.product/${product.id}/image_1024/${encodeURIComponent(product.name)}`,
      ],
      type: 'website',
    },
  }
}

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

const CATEGORY_LABEL: Record<string, string> = {
  gamme: 'Gamme Corporelle',
  soins: 'Soin Visage',
  huile: 'Huile Précieuse',
  savon: 'Savon Artisanal',
}

const BADGE_STYLE: Record<string, string> = {
  Bestseller: 'bg-rose-deep text-white',
  Pack:       'bg-rose-wine text-white',
  Nouveau:    'bg-rose-medium text-white',
  Promo:      'bg-red-400 text-white',
}

export default function ProductV2Page({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug)
  if (!product) notFound()

  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const waMessage = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par : ${product.name}\nPrix : ${product.priceXOF > 0 ? `${product.priceXOF.toLocaleString('fr-FR')} FCFA` : 'Prix sur demande'}`
  )

  return (
    <div className="min-h-screen bg-rose-snow text-rose-text">
      <HeaderV2 />

      <main>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-8 pb-4">
          <nav className="flex items-center gap-2 text-xs text-rose-muted">
            <Link href="/v2" className="hover:text-rose-deep transition-colors">Accueil</Link>
            <span className="text-rose-blush">/</span>
            <Link href="/v2/boutique" className="hover:text-rose-deep transition-colors">Boutique</Link>
            <span className="text-rose-blush">/</span>
            <span className="text-rose-wine font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Product detail */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-24">

            {/* Image panel */}
            <div className="relative">
              {/* Decorative rose blur behind image */}
              <div className="petal-blur w-80 h-80 bg-rose-blush/40 -top-8 -left-8" style={{ position: 'absolute' }} />
              <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-rose-petal shadow-rose-lg border border-rose-blush/30">
                <Image
                  src={getProductImageUrl(product.slug)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {/* Rose film */}
                <div className="absolute inset-0 bg-rose-deep/5 mix-blend-multiply" />
                {product.badge && (
                  <div className="absolute top-5 left-5">
                    <span className={`text-sm font-semibold px-4 py-1.5 rounded-full ${BADGE_STYLE[product.badge] ?? 'bg-rose-medium text-white'}`}>
                      {product.badge}
                    </span>
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-rose-snow/75 flex items-center justify-center rounded-[2.5rem]">
                    <span className="bg-white text-rose-wine font-semibold px-6 py-3 rounded-full shadow-rose-sm">
                      Épuisé temporairement
                    </span>
                  </div>
                )}
              </div>
              {/* Decorative rose line below */}
              <div className="absolute -bottom-4 left-12 right-12 h-px bg-gradient-to-r from-transparent via-rose-blush to-transparent" />
            </div>

            {/* Info panel */}
            <div className="flex flex-col">
              <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-4">
                {CATEGORY_LABEL[product.category] ?? product.category}
              </p>

              <h1 className="font-serif text-4xl md:text-5xl font-bold text-rose-wine leading-tight mb-5">
                {product.name}
              </h1>

              <div className="rose-line mb-7 opacity-50" />

              <p className="text-rose-muted text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Contents */}
              {product.contents && (
                <div className="mb-8">
                  <p className="text-xs font-semibold tracking-wider uppercase text-rose-text/60 mb-3">
                    Contenu du pack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.contents.map((item) => (
                      <span
                        key={item}
                        className="text-xs bg-rose-petal text-rose-wine px-3 py-1.5 rounded-full border border-rose-blush/50"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price card — light rose style */}
              <div className="bg-rose-petal border border-rose-blush/60 rounded-3xl p-6 mb-6">
                <p className="text-xs text-rose-muted uppercase tracking-wider mb-4">Tarif</p>
                <div className="flex flex-wrap gap-8 items-end">
                  {product.priceXOF > 0 && (
                    <div>
                      <p className="font-serif text-3xl font-bold text-rose-wine">
                        {product.priceXOF.toLocaleString('fr-FR')}
                        <span className="text-base font-normal text-rose-muted ml-1">FCFA</span>
                      </p>
                      <p className="text-xs text-rose-muted mt-0.5">🇸🇳 Sénégal</p>
                    </div>
                  )}
                  {product.price > 0 && (
                    <div>
                      <p className="font-serif text-3xl font-bold text-rose-wine">
                        {product.price.toFixed(2)}
                        <span className="text-base font-normal text-rose-muted ml-1">€</span>
                      </p>
                      <p className="text-xs text-rose-muted mt-0.5">🇫🇷 France</p>
                    </div>
                  )}
                  {product.priceXOF === 0 && product.price === 0 && (
                    <p className="text-xl text-rose-muted italic">Prix sur demande</p>
                  )}
                </div>
                {product.priceXOF2 && (
                  <div className="mt-4 pt-4 border-t border-rose-blush/40">
                    <p className="text-sm text-rose-deep font-medium">
                      🎁 Offre groupée : 2 pour {product.priceXOF2.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <Link
                  href={`/checkout?product=${product.id}`}
                  className={`flex items-center justify-center gap-3 bg-rose-deep hover:bg-rose-wine text-white font-semibold px-6 py-4 rounded-2xl text-sm transition-all hover:shadow-rose-md group ${!product.inStock ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  Commander en ligne
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <a
                  href={`https://wa.me/221784715757?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1EBE5C] text-white font-semibold px-6 py-4 rounded-2xl text-sm transition-all"
                >
                  {WA_ICON}
                  Commander sur WhatsApp
                </a>
              </div>

              {/* Wholesale */}
              {product.wholesale && (
                <div className="mt-5 border border-rose-blush rounded-2xl p-4 bg-rose-petal/50">
                  <p className="font-semibold text-rose-deep text-sm flex items-center gap-2 mb-1">
                    💼 Disponible en vente en gros
                  </p>
                  <p className="text-xs text-rose-muted">
                    Contactez-nous pour les tarifs revendeurs ·{' '}
                    <a href="tel:+221710581711" className="text-rose-deep hover:underline">+221 71 058 17 11</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="bg-rose-petal/30 py-20 px-5 lg:px-8 border-t border-rose-blush/30">
            <div className="max-w-7xl mx-auto">
              <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-3">
                Vous aimerez aussi
              </p>
              <h2 className="font-serif text-3xl font-bold text-rose-wine mb-10">
                Produits similaires
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {related.map(p => (
                  <Link
                    key={p.id}
                    href={`/v2/boutique/${p.slug}`}
                    className="group bg-white rounded-3xl overflow-hidden hover:shadow-rose-md transition-all border border-rose-petal"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={getProductImageUrl(p.slug)}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-rose-deep/5 mix-blend-multiply" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-sm font-semibold text-rose-wine leading-tight mb-1 group-hover:text-rose-deep transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-rose-deep font-medium">
                        {p.priceXOF > 0 ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA` : `${p.price.toFixed(2)} €`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <FooterV2 />
    </div>
  )
}
