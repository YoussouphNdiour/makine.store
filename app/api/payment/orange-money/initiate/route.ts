import { initiateOrangeMoneyPayment } from '@/lib/orangeMoney'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppText } from '@/lib/whatsapp'

export async function POST(req: Request) {
  try {
    const { orderId, phone } = await req.json()
    if (!orderId) return Response.json({ error: 'orderId requis' }, { status: 400 })

    // [SECURITY] Montant depuis la DB, pas depuis le client
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://makine.store'

    // Mode dev : si clé manquante, simuler UNIQUEMENT en développement
    if (!process.env.ORANGE_MONEY_CLIENT_ID) {
      if (process.env.NODE_ENV === 'production') {
        return Response.json({ error: 'Orange Money non configuré' }, { status: 503 })
      }
      return Response.json({ success: true, payToken: `dev_mock_${orderId}`, _dev_mock: true })
    }

    const customerPhone = phone || order.customerPhone

    console.log('[OM] Initiation paiement:', { orderId, phone: customerPhone, amount: Math.round(order.totalAmount) })
    const result = await initiateOrangeMoneyPayment({
      amount: Math.round(order.totalAmount),
      currency: 'XOF',
      orderId,
      customerPhone,
      description: `Commande Makiné #${orderId.slice(-8).toUpperCase()}`,
      notifUrl: `${appUrl}/api/payment/orange-money/webhook`,
      returnUrl: `${appUrl}/order/${orderId}/success`,
    })
    console.log('[OM] Réponse:', JSON.stringify(result))

    if (!result?.payToken) {
      console.error('[OM] Pas de payToken dans la réponse:', result)
      return Response.json({ error: 'Réponse Orange Money invalide' }, { status: 502 })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentRef: result.payToken },
    })

    const amount = Math.round(order.totalAmount)
    const ref = orderId.slice(-8).toUpperCase()
    const cleanPhone = (customerPhone as string).replace(/\D/g, '')
    if (cleanPhone.length >= 8) {
      sendWhatsAppText(
        cleanPhone,
        `🟠 *Paiement Orange Money — Makiné*\n\n` +
        `📦 Réf : *${ref}*\n` +
        `💰 Montant : *${amount.toLocaleString('fr-FR')} FCFA*\n\n` +
        `📱 Une demande de paiement Orange Money a été envoyée sur votre téléphone.\n` +
        `Confirmez le paiement de *${amount.toLocaleString('fr-FR')} FCFA* 📲\n\n` +
        `📞 Aide : +221 71 058 17 11`
      ).catch(e => console.error('[WA OM link]', e))
    }

    return Response.json({ success: true, payToken: result?.payToken })
  } catch (err) {
    console.error('[API OM Initiate]', err)
    return Response.json({ error: 'Erreur Orange Money' }, { status: 500 })
  }
}
