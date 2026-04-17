import HeaderV2 from '@/components/HeaderV2'
import FooterV2 from '@/components/FooterV2'
import Link from 'next/link'

export default function OrderFailedPage() {
  return (
    <div className="min-h-screen bg-rose-snow">
      <HeaderV2 />
      <main className="max-w-xl mx-auto px-5 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">❌</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-rose-wine mb-3">
          Paiement non abouti
        </h1>
        <p className="text-rose-muted mb-8">
          Votre paiement n&apos;a pas pu être traité. Aucun montant n&apos;a été débité.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/checkout"
            className="bg-rose-deep text-white font-semibold px-6 py-4 rounded-2xl hover:bg-rose-wine transition-colors"
          >
            Réessayer →
          </Link>
          <a
            href="https://wa.me/221710581711"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white font-semibold px-6 py-4 rounded-2xl hover:bg-[#1EBE5C] transition-colors"
          >
            Commander via WhatsApp
          </a>
          <Link href="/v2/boutique" className="text-rose-muted hover:text-rose-deep text-sm">
            ← Retour à la boutique
          </Link>
        </div>
      </main>
      <FooterV2 />
    </div>
  )
}
