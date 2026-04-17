import { prisma } from '@/lib/prisma'
import { sendWhatsAppText } from '@/lib/whatsapp'

const ADMIN_NUMBER = (
  process.env.WHATSAPP_ADMIN_NUMBER ??
  process.env.WHATSAPP_BUSINESS_NUMBER ??
  '221710581711'
).replace(/\D/g, '')

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) return Response.json({ error: 'orderId requis' }, { status: 400 })

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    })
    if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 })

    const ref = order.id.slice(-8).toUpperCase()
    const total =
      order.currency === 'XOF'
        ? `${order.totalAmount.toLocaleString('fr-FR')} FCFA`
        : `${order.totalAmount.toFixed(2)} €`
    const itemsText = order.items
      .map(i => `• ${i.product.name} ×${i.quantity} — ${
        order.currency === 'XOF'
          ? `${(i.price * i.quantity).toLocaleString('fr-FR')} FCFA`
          : `${(i.price * i.quantity).toFixed(2)} €`
      }`)
      .join('\n')

    // Message au client
    const customerMsg =
      `✅ *Commande Makiné reçue !*\n` +
      `📦 Réf : *${ref}*\n\n` +
      `*Votre panier :*\n${itemsText}\n\n` +
      `💰 *Total : ${total}*\n\n` +
      `📞 Un conseiller Makiné va vous contacter sous peu pour organiser le paiement et la livraison.\n\n` +
      `Merci pour votre confiance ! *Makiné* 🌸`

    // Message à l'admin
    const adminMsg =
      `🆕 *Nouvelle commande WhatsApp !*\n` +
      `📦 Réf : *${ref}*\n` +
      `👤 ${order.customerName} — ${order.customerPhone}\n\n` +
      `${itemsText}\n\n` +
      `💰 *Total : ${total}*\n` +
      `💳 Paiement : WhatsApp\n\n` +
      `_Voir admin : ${process.env.NEXT_PUBLIC_APP_URL ?? 'https://makine.store'}/admin_`

    // Envoyer les deux messages en parallèle
    const customerPhone = order.customerPhone.replace(/\D/g, '')
    await Promise.allSettled([
      sendWhatsAppText(customerPhone, customerMsg),
      sendWhatsAppText(ADMIN_NUMBER, adminMsg),
    ])

    // Marquer comme notifié
    await prisma.order.update({
      where: { id: orderId },
      data: { whatsappSent: true },
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('[API WA Notify]', err)
    return Response.json({ error: 'Erreur notification' }, { status: 500 })
  }
}
