import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/whatsappBot'

const SUCCESS_STATUSES = ['SUCCESS', 'SUCCESSFULL', 'SUCCESSFUL', 'CONFIRMED', 'PAID']

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[Webhook OM] payload:', JSON.stringify(body))

    // Orange Money may use different field names depending on API version
    const orderId = body.orderId ?? body.order_id ?? body.externalId
    const status = (body.status ?? body.paymentStatus ?? '').toUpperCase()
    const payToken = body.payToken ?? body.pay_token ?? body.transactionId

    if (SUCCESS_STATUSES.includes(status) && orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'paid', paymentRef: payToken ?? null, status: 'confirmed' },
      })
      sendOrderConfirmation(orderId).catch(console.error)
    } else {
      console.log('[Webhook OM] statut non traité:', status, 'orderId:', orderId)
    }

    return Response.json({ received: true })
  } catch (err) {
    console.error('[Webhook OM]', err)
    return Response.json({}, { status: 500 })
  }
}
