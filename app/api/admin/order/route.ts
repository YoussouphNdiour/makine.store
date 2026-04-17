import { prisma } from '@/lib/prisma'
import { sendWhatsAppText } from '@/lib/whatsapp'

// PATCH /api/admin/order — mettre à jour le statut d'une commande
export async function PATCH(req: Request) {
  try {
    const { orderId, status, paymentStatus, adminKey } = await req.json()

    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const validStatuses = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return Response.json({ error: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: { include: { product: true } } },
    })

    // When confirming: send WhatsApp to customer
    if (status === 'confirmed') {
      const ref = order.id.slice(-8).toUpperCase()
      const total = order.currency === 'XOF'
        ? `${order.totalAmount.toLocaleString('fr-FR')} FCFA`
        : `${order.totalAmount.toFixed(2)} €`
      const itemsText = order.items
        .map(i => `• ${i.product.name} ×${i.quantity}`)
        .join('\n')

      const msg =
        `✅ *Commande Makiné confirmée !*\n` +
        `📦 Réf : *${ref}*\n\n` +
        `*Votre commande :*\n${itemsText}\n\n` +
        `💰 *Total : ${total}*\n\n` +
        `🚚 Votre commande est confirmée et en cours de préparation.\n` +
        `📞 +221 71 058 17 11\nMerci ! *Makiné* 🌸`

      const phone = order.customerPhone.replace(/\D/g, '')
      sendWhatsAppText(phone, msg).catch(e => console.error('[WA Confirm]', e))

      await prisma.order.update({
        where: { id: orderId },
        data: { whatsappSent: true },
      })
    }

    return Response.json({ success: true, order })
  } catch (err) {
    console.error('[API Admin Order]', err)
    return Response.json({ error: 'Erreur mise à jour commande' }, { status: 500 })
  }
}
