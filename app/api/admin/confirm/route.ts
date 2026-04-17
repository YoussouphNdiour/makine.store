import { prisma } from '@/lib/prisma'
import { sendWhatsAppText } from '@/lib/whatsapp'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')?.toUpperCase()
  const key = searchParams.get('key')

  if (key !== process.env.ADMIN_PASSWORD) {
    return new Response('Non autorisé', { status: 401 })
  }
  if (!ref) {
    return new Response('Référence manquante', { status: 400 })
  }

  // Find order by last 8 chars of ID
  const orders = await prisma.order.findMany({
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } } },
  })
  const order = orders.find(o => o.id.slice(-8).toUpperCase() === ref)

  if (!order) {
    return new Response(`Commande ${ref} introuvable`, { status: 404 })
  }

  if (order.status === 'confirmed') {
    // Already confirmed — just redirect to admin
    redirect(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://makine.store'}/admin?key=${key}&confirmed=${ref}`)
  }

  // Confirm order
  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'confirmed', paymentStatus: 'paid', whatsappSent: true },
  })

  // Send WA confirmation to customer
  const total =
    order.currency === 'XOF'
      ? `${order.totalAmount.toLocaleString('fr-FR')} FCFA`
      : `${order.totalAmount.toFixed(2)} €`
  const itemsText = order.items.map(i => `• ${i.product.name} ×${i.quantity}`).join('\n')

  const customerMsg =
    `✅ *Commande Makiné confirmée !*\n` +
    `📦 Réf : *${ref}*\n\n` +
    `*Votre commande :*\n${itemsText}\n\n` +
    `💰 *Total : ${total}*\n\n` +
    `🚚 Votre commande est confirmée et en cours de préparation.\n` +
    `📞 +221 71 058 17 11\nMerci ! *Makiné* 🌸`

  const customerPhone = order.customerPhone.replace(/\D/g, '')
  await sendWhatsAppText(customerPhone, customerMsg).catch(e =>
    console.error('[WA Confirm customer]', e)
  )

  // Redirect to admin dashboard
  redirect(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://makine.store'}/admin?key=${key}&confirmed=${ref}`
  )
}
