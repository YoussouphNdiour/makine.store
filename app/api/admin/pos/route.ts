import { prisma } from '@/lib/prisma'
import { createWaveCheckout } from '@/lib/wave'
import { initiateOrangeMoneyPayment } from '@/lib/orangeMoney'
import { sendWhatsAppText } from '@/lib/whatsapp'

// POST /api/admin/pos — créer une commande caisse
export async function POST(req: Request) {
  try {
    const { adminKey, customerName, customerPhone, items, paymentMethod, currency, notes } =
      await req.json()

    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!customerName || !items?.length) {
      return Response.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )

    const isDigital = paymentMethod === 'wave' || paymentMethod === 'orange_money'

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone: customerPhone || 'Caisse',
        country: 'SN',
        currency: currency || 'XOF',
        totalAmount,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: isDigital ? 'pending' : 'paid',
        status: isDigital ? 'new' : 'delivered',
        notes: notes || `Vente caisse — ${paymentMethod}`,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://makine.store'
    const ref = order.id.slice(-8).toUpperCase()
    const amount = Math.round(totalAmount)
    const phone = (customerPhone || '').replace(/\D/g, '')

    // Wave — créer checkout et envoyer lien par WA
    if (paymentMethod === 'wave' && process.env.WAVE_CHECKOUT_API_KEY) {
      try {
        const checkout = await createWaveCheckout({
          amount,
          currency: 'XOF',
          error_url: `${appUrl}/order/failed?id=${order.id}`,
          success_url: `${appUrl}/order/${order.id}/success`,
          client_reference: order.id,
        })

        // Stocker l'ID de session Wave pour pouvoir vérifier le paiement manuellement
        if (checkout.id) {
          await prisma.order.update({ where: { id: order.id }, data: { paymentRef: checkout.id } })
        }

        if (phone.length >= 8) {
          sendWhatsAppText(
            phone,
            `💙 *Paiement Wave — Makiné*\n\n` +
            `📦 Réf : *${ref}*\n` +
            `💰 Montant : *${amount.toLocaleString('fr-FR')} FCFA*\n\n` +
            `👇 Cliquez pour payer :\n${checkout.wave_launch_url}\n\n` +
            `_Lien valable 30 minutes — Ne pas partager_\n` +
            `📞 Aide : +221 71 058 17 11`
          ).catch(e => console.error('[WA POS Wave]', e))
        }

        return Response.json({ success: true, order, wave_launch_url: checkout.wave_launch_url })
      } catch (waveErr) {
        console.error('[POS Wave checkout]', waveErr)
        // Order already created — return it without the Wave URL
        return Response.json({ success: true, order, wave_error: 'Lien Wave indisponible' })
      }
    }

    // Orange Money — initier et envoyer notification WA
    if (paymentMethod === 'orange_money' && process.env.ORANGE_MONEY_CLIENT_ID && phone.length >= 8) {
      try {
        const result = await initiateOrangeMoneyPayment({
          amount,
          currency: 'XOF',
          orderId: order.id,
          customerPhone: phone,
          description: `Commande Makiné #${ref}`,
          notifUrl: `${appUrl}/api/payment/orange-money/webhook`,
          returnUrl: `${appUrl}/order/${order.id}/success`,
        })

        if (result?.payToken) {
          await prisma.order.update({ where: { id: order.id }, data: { paymentRef: result.payToken } })
        }

        sendWhatsAppText(
          phone,
          `🟠 *Paiement Orange Money — Makiné*\n\n` +
          `📦 Réf : *${ref}*\n` +
          `💰 Montant : *${amount.toLocaleString('fr-FR')} FCFA*\n\n` +
          `📱 Une demande de paiement Orange Money a été envoyée sur votre téléphone.\n` +
          `Confirmez le paiement de *${amount.toLocaleString('fr-FR')} FCFA* 📲\n\n` +
          `📞 Aide : +221 71 058 17 11`
        ).catch(e => console.error('[WA POS OM]', e))
      } catch (omErr) {
        console.error('[POS OM initiate]', omErr)
      }
    }

    return Response.json({ success: true, order })
  } catch (err) {
    console.error('[API Admin POS]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
