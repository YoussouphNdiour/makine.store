import { prisma } from '@/lib/prisma'

// PATCH /api/admin/order — mettre à jour le statut d'une commande
export async function PATCH(req: Request) {
  try {
    const { orderId, status, adminKey } = await req.json()

    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const validStatuses = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return Response.json({ error: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() },
    })

    return Response.json({ success: true, order })
  } catch (err) {
    console.error('[API Admin Order]', err)
    return Response.json({ error: 'Erreur mise à jour commande' }, { status: 500 })
  }
}
