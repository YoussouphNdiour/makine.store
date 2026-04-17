import { validateWaveWebhook } from '@/lib/wave'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmation } from '@/lib/whatsappBot'
export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    if (!validateWaveWebhook(rawBody, req.headers.get('Wave-Signature') ?? ''))
      return Response.json({ error: 'Signature invalide' }, { status: 401 })
    const payload = JSON.parse(rawBody)
    if (payload.type === 'checkout.session.completed') {
      const orderId = payload.data?.client_reference
      if (orderId) {
        await prisma.order.update({ where: { id: orderId },
          data: { paymentStatus: 'paid', paymentRef: payload.data?.id, status: 'confirmed' } })
        sendOrderConfirmation(orderId).catch(console.error)
      }
    }
    return Response.json({ received: true })
  } catch (err) { console.error('[Webhook Wave]', err); return Response.json({}, { status: 500 }) }
}
