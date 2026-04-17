import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/whatsappBot'
export async function POST(req: Request) {
  try {
    const { orderId, status, payToken } = await req.json()
    if (status === 'SUCCESS' && orderId) {
      await prisma.order.update({ where: { id: orderId },
        data: { paymentStatus: 'paid', paymentRef: payToken, status: 'confirmed' } })
      sendOrderConfirmation(orderId).catch(console.error)
    }
    return Response.json({ received: true })
  } catch (err) { console.error('[Webhook OM]', err); return Response.json({}, { status: 500 }) }
}
