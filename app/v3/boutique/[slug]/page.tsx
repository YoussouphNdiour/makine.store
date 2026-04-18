import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { products as staticProducts } from '@/data/products'
import { getProductImageUrl } from '@/data/productImages'
import HeaderV3 from '@/components/HeaderV3'
import AddToCartButtonV3 from './AddToCartButtonV3'

export const dynamic = 'force-dynamic'

type PageProduct = {
  id: string
  slug: string
  name: string
  category: string
  price: number
  priceXOF: number
  priceXOF2?: number | null
  badge?: string | null
  description: string
  inStock: boolean
  wholesale: boolean
  imageUrl?: string | null
  contents?: string[]
}

async function getProduct(slug: string): Promise<PageProduct | null> {
  try {
    const db = await prisma.product.findUnique({ where: { slug } })
    if (db) return db
  } catch { /* DB not available */ }
  return staticProducts.find(p => p.slug === slug) ?? null
}

async function getRelated(category: string, excludeId: string): Promise<PageProduct[]> {
  try {
    const db = await prisma.product.findMany({
      where: { category, id: { not: excludeId } },
      take: 4,
      orderBy: { inStock: 'desc' },
    })
    if (db.length) return db
  } catch { /* fallback */ }
  return staticProducts.filter(p => p.category === category && p.id !== excludeId).slice(0, 4)
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Produit introuvable' }
  const priceLabel = product.priceXOF > 0
    ? `${product.priceXOF.toLocaleString('fr-FR')} FCFA`
    : product.price > 0 ? `${product.price.toFixed(2)} €` : ''
  return {
    title: product.name,
    description: `${product.description}${priceLabel ? ` — ${priceLabel}` : ''}. Livraison Sénégal & France.`,
  }
}

const CAT_LABEL: Record<string, string> = {
  gamme: 'Gamme Corporelle',
  soins: 'Soin Visage',
  huile: 'Huile Précieuse',
  savon: 'Savon Artisanal',
  maquillage: 'Maquillage',
}

const WA_NUMBER = '221710581711'

export default async function ProductV3Page({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const related = await getRelated(product.category, product.id)
  const imgUrl = product.imageUrl || getProductImageUrl(product.slug)
  const waMessage = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par : ${product.name}\n` +
    (product.priceXOF > 0 ? `Prix : ${product.priceXOF.toLocaleString('fr-FR')} FCFA` : '')
  )

  return (
    <div className="min-h-screen bg-lux-void text-lux-text">
      <HeaderV3 />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6">
          <nav className="flex items-center gap-2 text-xs text-lux-muted/60">
            <Link href="/v3" className="hover:text-lux-gold transition-colors">Accueil</Link>
            <span className="text-white/20">/</span>
            <Link href="/v3/boutique" className="hover:text-lux-gold transition-colors">Boutique</Link>
            <span className="text-white/20">/</span>
            <span className="text-lux-text/80 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Product detail */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

            {/* Image panel */}
            <div className="relative">
              {/* Gold glow behind image */}
              <div className="absolute -inset-8 bg-lux-gold/5 rounded-3xl blur-3xl pointer-events-none" />
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/8">
                <Image
                  src={imgUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {/* Subtle dark vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-lux-void/30 to-transparent" />

                {product.badge && (
                  <div className="absolute top-5 left-5">
                    <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-lux-gold/20 text-lux-gold border border-lux-gold/30 backdrop-blur-sm">
                      {product.badge}
                    </span>
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-lux-void/60 backdrop-blur-[2px]">
                    <span className="text-sm font-semibold px-6 py-3 rounded-full border border-white/20 text-lux-muted">
                      Épuisé temporairement
                    </span>
                  </div>
                )}
              </div>
              {/* Decorative gold line below */}
              <div className="absolute -bottom-3 left-12 right-12 h-px bg-gradient-to-r from-transparent via-lux-gold/30 to-transparent" />
            </div>

            {/* Info panel */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-lux-gold/40" />
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-lux-gold/70">
                  {CAT_LABEL[product.category] ?? product.category}
                </p>
              </div>

              <h1 className="font-serif text-4xl md:text-5xl font-bold text-lux-text leading-tight mb-6">
                {product.name}
              </h1>

              {/* Separator */}
              <div className="h-px bg-gradient-to-r from-lux-gold/30 to-transparent mb-7" />

              <p className="text-lux-muted text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Contents */}
              {product.contents && product.contents.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs font-semibold tracking-wider uppercase text-lux-muted/60 mb-3">
                    Contenu du pack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.contents.map(item => (
                      <span
                        key={item}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-lux-muted"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price card */}
              <div className="rounded-2xl p-6 mb-6 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-xs text-lux-muted/60 uppercase tracking-wider mb-4">Tarif</p>
                <div className="flex flex-wrap gap-8 items-end">
                  {product.priceXOF > 0 && (
                    <div>
                      <p className="font-serif text-4xl font-bold text-lux-gold">
                        {product.priceXOF.toLocaleString('fr-FR')}
                        <span className="text-lg font-normal text-lux-muted ml-1">FCFA</span>
                      </p>
                      <p className="text-xs text-lux-muted/60 mt-1">🇸🇳 Sénégal</p>
                    </div>
                  )}
                  {product.price > 0 && (
                    <div>
                      <p className="font-serif text-4xl font-bold text-lux-text/80">
                        {product.price.toFixed(2)}
                        <span className="text-lg font-normal text-lux-muted ml-1">€</span>
                      </p>
                      <p className="text-xs text-lux-muted/60 mt-1">🇫🇷 France</p>
                    </div>
                  )}
                  {product.priceXOF === 0 && product.price === 0 && (
                    <p className="text-xl text-lux-muted italic">Prix sur demande</p>
                  )}
                </div>
                {product.priceXOF2 && (
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <p className="text-sm text-lux-rose font-medium">
                      🎁 Offre : 2 pour {product.priceXOF2.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <AddToCartButtonV3 productId={product.id} inStock={product.inStock} />
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1EBE5C] text-white font-semibold px-6 py-4 rounded-2xl text-sm transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Commander via WhatsApp
                </a>
              </div>

              {/* Wholesale */}
              {product.wholesale && (
                <div className="mt-5 border border-lux-gold/20 rounded-2xl p-4" style={{ background: 'rgba(212,169,106,0.04)' }}>
                  <p className="font-semibold text-lux-gold text-sm flex items-center gap-2 mb-1">
                    💼 Disponible en vente en gros
                  </p>
                  <p className="text-xs text-lux-muted">
                    Contactez-nous pour les tarifs revendeurs ·{' '}
                    <a href="tel:+221710581711" className="text-lux-gold hover:underline">+221 71 058 17 11</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-white/6 py-20 px-5 lg:px-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-lux-gold/40" />
                <span className="text-lux-gold text-xs font-semibold tracking-[0.2em] uppercase">Vous aimerez aussi</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-lux-text mb-10">Produits similaires</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map(p => {
                  const rImgUrl = p.imageUrl || getProductImageUrl(p.slug)
                  return (
                    <Link
                      key={p.id}
                      href={`/v3/boutique/${p.slug}`}
                      className="group relative rounded-2xl overflow-hidden border border-white/6 hover:border-lux-gold/25 transition-all duration-500"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={rImgUrl}
                          alt={p.name}
                          fill
                          sizes="25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-lux-void/80 to-transparent" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif text-sm font-semibold text-lux-text leading-tight mb-1 group-hover:text-lux-gold transition-colors line-clamp-2">
                          {p.name}
                        </h3>
                        <p className="text-xs text-lux-gold font-medium">
                          {p.priceXOF > 0 ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA` : p.price > 0 ? `${p.price.toFixed(2)} €` : 'Sur demande'}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/v3/boutique" className="font-serif text-lux-muted/60 text-sm hover:text-lux-gold transition-colors">
            ← Boutique
          </Link>
          <p className="text-lux-muted/30 text-xs">© {new Date().getFullYear()} Makiné</p>
          <Link href="/checkout" className="text-xs text-lux-muted/60 hover:text-lux-gold transition-colors">
            Panier →
          </Link>
        </div>
      </footer>
    </div>
  )
}
