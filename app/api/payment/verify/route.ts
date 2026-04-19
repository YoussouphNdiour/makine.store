import { prisma } from '@/lib/prisma'
import { getWaveCheckoutSession } from '@/lib/wave'
import { checkOrangeMoneyStatus } from '@/lib/orangeMoney'
import { sendOrderConfirmation } from '@/lib/whatsapp'

const WAVE_SUCCESS_STATUSES = ['succeeded', 'completed', 'paid']
const OM_SUCCESS_STATUSES = ['SUCCESS', 'SUCCESSFUL', 'SUCCESSFULL']

// POST /api/payment/verify — vérifie manuellement le statut d'un paiement Wave ou OM
export async function POST(req: Request) {
  try {
    const { orderId, adminKey } = await req.json()
    if (!orderId) return Response.json({ error: 'orderId requis' }, { status: 400 })

    // Auth : admin key ou appel interne (pas de clé = route publique pour la page success)
    const isAdmin = adminKey === process.env.ADMIN_PASSWORD
    if (adminKey && !isAdmin) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 })

    // Déjà payé — rien à faire
    if (order.paymentStatus === 'paid') {
      return Response.json({ alreadyPaid: true, paymentStatus: 'paid', status: order.status })
    }

    // Pas un paiement numérique
    if (!['wave', 'orange_money'].includes(order.paymentMethod)) {
      return Response.json({ error: 'Méthode de paiement non vérifiable' }, { status: 400 })
    }

    // Pas de référence stockée = impossible de vérifier
    if (!order.paymentRef) {
      return Response.json({ error: 'Aucune référence de paiement disponible', noRef: true }, { status: 422 })
    }

    // ── Wave ────────────────────────────────────────────────────────────────────
    if (order.paymentMethod === 'wave') {
      const session = await getWaveCheckoutSession(order.paymentRef)
      const waveStatus = session.payment_status ?? session.status ?? ''

      if (WAVE_SUCCESS_STATUSES.includes(waveStatus)) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            status: 'confirmed',
            paymentRef: session.id ?? order.paymentRef,
          },
        })
        sendOrderConfirmation(orderId).catch(console.error)
        return Response.json({ updated: true, paymentStatus: 'paid', status: 'confirmed', waveStatus })
      }

      return Response.json({ updated: false, paymentStatus: 'pending', waveStatus })
    }

    // ── Orange Money ────────────────────────────────────────────────────────────
    if (order.paymentMethod === 'orange_money') {
      const omResult = await checkOrangeMoneyStatus(order.paymentRef)
      const omStatus = omResult?.status ?? omResult?.data?.status ?? ''

      if (OM_SUCCESS_STATUSES.includes(omStatus)) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'paid', status: 'confirmed' },
        })
        sendOrderConfirmation(orderId).catch(console.error)
        return Response.json({ updated: true, paymentStatus: 'paid', status: 'confirmed', omStatus })
      }

      return Response.json({ updated: false, paymentStatus: 'pending', omStatus })
    }

    return Response.json({ error: 'Méthode non supportée' }, { status: 400 })
  } catch (err) {
    console.error('[API Verify]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
