import { createWaveCheckout } from '@/lib/wave'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppText } from '@/lib/whatsapp'

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) return Response.json({ error: 'orderId requis' }, { status: 400 })

    // [SECURITY] Utiliser le montant depuis la DB, jamais depuis le client
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 })

    const amount = Math.round(order.totalAmount)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://makine.store'
    const ref = orderId.slice(-8).toUpperCase()

    // Mode dev : si clé manquante, simuler UNIQUEMENT en développement
    if (!process.env.WAVE_CHECKOUT_API_KEY) {
      if (process.env.NODE_ENV === 'production') {
        return Response.json({ error: 'Paiement Wave non configuré' }, { status: 503 })
      }
      return Response.json({ wave_launch_url: `${appUrl}/order/${orderId}/success`, _dev_mock: true })
    }

    const checkout = await createWaveCheckout({
      amount,
      currency: 'XOF',
      error_url: `${appUrl}/order/failed?id=${orderId}`,
      success_url: `${appUrl}/order/${orderId}/success`,
      client_reference: orderId,
    })

    // Envoyer le lien Wave au client par WhatsApp (async — ne bloque pas la réponse)
    const phone = order.customerPhone.replace(/\D/g, '')
    if (phone.length >= 8) {
      sendWhatsAppText(
        phone,
        `💙 *Paiement Wave — Makiné*\n\n` +
        `📦 Réf : *${ref}*\n` +
        `💰 Montant : *${amount.toLocaleString('fr-FR')} FCFA*\n\n` +
        `👇 Cliquez pour payer :\n${checkout.wave_launch_url}\n\n` +
        `_Lien valable 30 minutes — Ne pas partager_\n` +
        `📞 Aide : +221 71 058 17 11`
      ).catch(e => console.error('[WA Wave link]', e))
    }

    return Response.json({ wave_launch_url: checkout.wave_launch_url })
  } catch (err) {
    console.error('[API Wave]', err)
    return Response.json({ error: 'Erreur paiement Wave' }, { status: 500 })
  }
}
