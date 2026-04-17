import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import HeaderV2 from '@/components/HeaderV2'
import FooterV2 from '@/components/FooterV2'
import Link from 'next/link'

export default async function OrderSuccessPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } } },
  })
  if (!order) notFound()

  const ref = order.id.slice(-8).toUpperCase()
  const total = order.currency === 'XOF'
    ? `${order.totalAmount.toLocaleString('fr-FR')} FCFA`
    : `${order.totalAmount.toFixed(2)} €`
  const paymentLabel = ({
    wave: 'Wave 💙',
    orange_money: 'Orange Money 🟠',
    whatsapp: 'WhatsApp',
    cash: 'Espèces',
  } as Record<string, string>)[order.paymentMethod] ?? order.paymentMethod

  return (
    <div className="min-h-screen bg-rose-snow">
      <HeaderV2 />
      <main className="max-w-2xl mx-auto px-5 py-20">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-rose-wine mb-2">
            Commande confirmée !
          </h1>
          <p className="text-rose-muted text-lg">
            Merci <strong className="text-rose-wine">{order.customerName}</strong> ✨
          </p>
          <div className="mt-3 bg-rose-petal border border-rose-blush rounded-full px-6 py-2">
            <p className="text-xs text-rose-muted">Référence commande</p>
            <p className="font-serif text-xl font-bold text-rose-wine tracking-widest">{ref}</p>
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-3xl border border-rose-petal p-6 mb-6">
          <h2 className="font-serif text-lg font-bold text-rose-wine mb-4">Récapitulatif</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-rose-text">{item.product.name} ×{item.quantity}</span>
                <span className="font-semibold text-rose-deep">
                  {order.currency === 'XOF'
                    ? `${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`
                    : `${(item.price * item.quantity).toFixed(2)} €`}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-rose-blush mt-4 pt-4 flex justify-between">
            <span className="font-semibold text-rose-text">Total</span>
            <span className="font-serif text-xl font-bold text-rose-wine">{total}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-rose-muted">
            <span>💳 Paiement :</span>
            <span className="font-medium text-rose-text">{paymentLabel}</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {order.paymentStatus === 'paid' ? '✓ Payé' : '⏳ En attente'}
            </span>
          </div>
        </div>

        {/* WA notification */}
        <div className="bg-[#E8F5E9] border border-green-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <p className="font-medium text-green-800 text-sm">Confirmation WhatsApp</p>
            <p className="text-xs text-green-700 mt-0.5">
              Vous recevrez un message de confirmation sur WhatsApp au numéro{' '}
              <strong>{order.customerPhone}</strong> sous peu.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/221710581711?text=${encodeURIComponent(`Bonjour, je voudrais des infos sur ma commande Réf ${ref}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1EBE5C] text-white font-semibold px-6 py-4 rounded-2xl transition-all"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Contacter Makiné sur WhatsApp
          </a>
          <Link
            href="/v2/boutique"
            className="flex items-center justify-center gap-2 border border-rose-blush text-rose-deep hover:bg-rose-petal font-medium px-6 py-4 rounded-2xl transition-all"
          >
            ← Retour à la boutique
          </Link>
        </div>
      </main>
      <FooterV2 />
    </div>
  )
}
