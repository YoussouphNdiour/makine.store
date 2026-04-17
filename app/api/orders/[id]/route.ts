import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, paymentStatus: true, status: true },
    })
    if (!order) return Response.json({ error: 'Introuvable' }, { status: 404 })
    return Response.json(order)
  } catch {
    return Response.json({ error: 'Erreur' }, { status: 500 })
  }
}
