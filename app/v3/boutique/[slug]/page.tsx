import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { products as staticProducts } from '@/data/products'
import { getProductImageUrl } from '@/data/productImages'
import NavV3 from '@/components/NavV3'
import AddToCartV3 from './AddToCartV3'

export const dynamic = 'force-dynamic'

type Prod = {
  id: string; slug: string; name: string; category: string
  price: number; priceXOF: number; priceXOF2?: number | null
  badge?: string | null; description: string; inStock: boolean
  wholesale: boolean; imageUrl?: string | null; contents?: string[]
}

async function getProd(slug: string): Promise<Prod | null> {
  try {
    const db = await prisma.product.findUnique({ where: { slug } })
    if (db) return db
  } catch { /* fallback */ }
  return staticProducts.find(p => p.slug === slug) ?? null
}

async function getRelated(category: string, excludeId: string): Promise<Prod[]> {
  try {
    const db = await prisma.product.findMany({ where: { category, id: { not: excludeId } }, take: 4, orderBy: { inStock: 'desc' } })
    if (db.length) return db
  } catch { /* fallback */ }
  return staticProducts.filter(p => p.category === category && p.id !== excludeId).slice(0, 4)
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProd(params.slug)
  if (!p) return { title: 'Produit introuvable' }
  const price = p.priceXOF > 0 ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA` : p.price > 0 ? `${p.price.toFixed(2)} €` : ''
  return { title: p.name, description: `${p.description}${price ? ` — ${price}` : ''}. Livraison SN & FR.` }
}

const CAT: Record<string, string> = { gamme: 'Gamme Corporelle', soins: 'Soin Visage', huile: 'Huile Précieuse', savon: 'Savon Artisanal', maquillage: 'Maquillage' }
const WA = '221710581711'

export default async function ProductV3({ params }: { params: { slug: string } }) {
  const product = await getProd(params.slug)
  if (!product) notFound()

  const related = await getRelated(product.category, product.id)
  const img = (product as { imageUrl?: string | null }).imageUrl || getProductImageUrl(product.slug)
  const waMsg = encodeURIComponent(`Bonjour, je suis intéressé(e) par : ${product.name}${product.priceXOF > 0 ? `\nPrix : ${product.priceXOF.toLocaleString('fr-FR')} FCFA` : ''}`)

  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>
      <NavV3 />

      <main className="max-w-7xl mx-auto px-6 lg:px-12" style={{ paddingTop: '100px', paddingBottom: '80px' }}>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-10" style={{ color: 'rgba(240,237,232,0.3)' }}>
          <Link href="/v3" className="hover:text-[#d4607a] transition-colors">Accueil</Link>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
          <Link href="/v3/boutique" className="hover:text-[#d4607a] transition-colors">Boutique</Link>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
          <span className="truncate max-w-[160px]" style={{ color: 'rgba(240,237,232,0.6)' }}>{product.name}</span>
        </nav>

        {/* Product grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ── LEFT: Image ───────────────────────────── */}
          <div className="relative">
            {/* Gold ambient glow */}
            <div className="absolute -inset-12 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(212,96,122,0.06) 0%, transparent 70%)' }} />

            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '4/5', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Image
                src={img} alt={product.name} fill priority
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
                style={{ filter: 'brightness(0.85) saturate(0.9)' }}
              />
              {/* Subtle bottom fade */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.4) 0%, transparent 40%)' }} />

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-5 left-5">
                  <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(212,96,122,0.2)', color: '#d4607a', border: '1px solid rgba(212,96,122,0.35)', backdropFilter: 'blur(12px)' }}>
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Out of stock */}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(6,6,14,0.7)', backdropFilter: 'blur(4px)' }}>
                  <span className="text-sm font-semibold px-6 py-3 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(240,237,232,0.5)' }}>Épuisé</span>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info ───────────────────────────── */}
          <div className="flex flex-col">

            {/* Category */}
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px block" style={{ background: 'rgba(212,96,122,0.5)' }} />
              <p className="text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: 'rgba(212,96,122,0.7)' }}>
                {CAT[product.category] ?? product.category}
              </p>
            </div>

            {/* Name */}
            <h1 className="font-serif font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', letterSpacing: '-0.02em', color: '#f0ede8' }}>
              {product.name}
            </h1>

            {/* Divider */}
            <div className="mb-7" style={{ height: '1px', background: 'linear-gradient(to right, rgba(212,96,122,0.3), transparent)' }} />

            {/* Description */}
            <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(240,237,232,0.55)' }}>
              {product.description}
            </p>

            {/* Contents */}
            {product.contents && product.contents.length > 0 && (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: 'rgba(240,237,232,0.3)' }}>Contenu</p>
                <div className="flex flex-wrap gap-2">
                  {product.contents.map(item => (
                    <span key={item} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,237,232,0.6)' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price block */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs uppercase tracking-wider mb-4" style={{ color: 'rgba(240,237,232,0.3)' }}>Tarif</p>
              <div className="flex flex-wrap gap-8 items-end">
                {product.priceXOF > 0 && (
                  <div>
                    <p className="font-serif font-bold" style={{ fontSize: '2.5rem', color: '#d4607a', lineHeight: 1 }}>
                      {product.priceXOF.toLocaleString('fr-FR')}
                      <span className="text-lg font-normal ml-1.5" style={{ color: 'rgba(240,237,232,0.3)' }}>FCFA</span>
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(240,237,232,0.3)' }}>🇸🇳 Sénégal</p>
                  </div>
                )}
                {product.price > 0 && (
                  <div>
                    <p className="font-serif font-bold" style={{ fontSize: '2rem', color: 'rgba(240,237,232,0.7)', lineHeight: 1 }}>
                      {product.price.toFixed(2)}
                      <span className="text-base font-normal ml-1.5" style={{ color: 'rgba(240,237,232,0.3)' }}>€</span>
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(240,237,232,0.3)' }}>🇫🇷 France</p>
                  </div>
                )}
                {product.priceXOF === 0 && product.price === 0 && (
                  <p className="text-lg italic" style={{ color: 'rgba(240,237,232,0.4)' }}>Prix sur demande</p>
                )}
              </div>
              {product.priceXOF2 && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-sm font-medium" style={{ color: '#e8b4be' }}>🎁 Offre : 2 pour {product.priceXOF2.toLocaleString('fr-FR')} FCFA</p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <AddToCartV3 productId={product.id} inStock={product.inStock} />
              <a
                href={`https://wa.me/${WA}?text=${waMsg}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)', color: '#4ade80' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Commander via WhatsApp
              </a>
            </div>

            {/* Wholesale */}
            {product.wholesale && (
              <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(212,96,122,0.05)', border: '1px solid rgba(212,96,122,0.15)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#d4607a' }}>💼 Vente en gros disponible</p>
                <p className="text-xs" style={{ color: 'rgba(240,237,232,0.4)' }}>
                  Contactez-nous pour les tarifs revendeurs ·{' '}
                  <a href="tel:+221710581711" className="hover:text-[#d4607a] transition-colors" style={{ color: '#d4607a' }}>+221 71 058 17 11</a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED ───────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px block" style={{ background: '#d4607a' }} />
              <p className="text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: '#d4607a' }}>Vous aimerez aussi</p>
            </div>
            <h2 className="font-serif font-bold mb-8" style={{ fontSize: '2rem', color: '#f0ede8', letterSpacing: '-0.02em' }}>
              Produits similaires
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => {
                const rImg = (p as { imageUrl?: string | null }).imageUrl || getProductImageUrl(p.slug)
                return (
                  <Link key={p.id} href={`/v3/boutique/${p.slug}`}
                    className="group lux-card-hover rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                      <Image src={rImg} alt={p.name} fill sizes="25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-108"
                        style={{ filter: 'brightness(0.65) saturate(0.8)' }} />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,6,14,0.7) 0%, transparent 50%)' }} />
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-serif text-sm font-semibold leading-tight mb-1 transition-colors group-hover:text-[#d4607a] line-clamp-2" style={{ color: '#f0ede8' }}>
                        {p.name}
                      </h3>
                      <p className="text-xs font-medium" style={{ color: '#d4607a' }}>
                        {p.priceXOF > 0 ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA` : p.price > 0 ? `${p.price.toFixed(2)} €` : 'Sur demande'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/v3/boutique" className="text-sm transition-colors" style={{ color: 'rgba(240,237,232,0.3)' }}>← Boutique</Link>
        <p className="text-xs" style={{ color: 'rgba(240,237,232,0.15)' }}>© {new Date().getFullYear()} Makiné</p>
        <Link href="/checkout" className="text-sm transition-colors" style={{ color: 'rgba(240,237,232,0.3)' }}>Panier →</Link>
      </footer>
    </div>
  )
}
