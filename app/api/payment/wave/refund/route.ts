import { createWavePayout } from '@/lib/wave'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { orderId, adminKey } = await req.json()

    // Vérification admin
    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!orderId) {
      return Response.json({ error: 'orderId requis' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 })
    if (order.paymentStatus !== 'paid') {
      return Response.json({ error: 'Commande non payée — impossible de rembourser' }, { status: 400 })
    }
    if (order.paymentMethod !== 'wave') {
      return Response.json({ error: 'Remboursement Wave uniquement pour les paiements Wave' }, { status: 400 })
    }

    // Format E.164
    let mobile = order.customerPhone.replace(/\s/g, '')
    if (!mobile.startsWith('+')) mobile = '+221' + mobile.replace(/^0+/, '')

    const payout = await createWavePayout({
      mobile,
      amount: order.totalAmount,
      name: order.customerName,
      client_reference: `REFUND_${order.id}`,
      payment_reason: `Remboursement commande #${order.id.slice(-8).toUpperCase()} — Makiné`,
    })

    // Mettre à jour la commande
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'refunded',
        status: 'cancelled',
        wavePayoutId: payout.id,
        notes: `Remboursé le ${new Date().toISOString()}`,
      },
    })

    return Response.json({ success: true, payoutId: payout.id })
  } catch (err) {
    console.error('[API Wave Refund]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
