import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { adminKey, ...data } = await req.json()
    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: parseFloat(data.price) }),
        ...(data.priceXOF !== undefined && { priceXOF: parseInt(data.priceXOF) }),
        ...(data.priceXOF2 !== undefined && {
          priceXOF2: data.priceXOF2 ? parseInt(data.priceXOF2) : null,
        }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.badge !== undefined && { badge: data.badge || null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.inStock !== undefined && { inStock: data.inStock }),
        ...(data.wholesale !== undefined && { wholesale: data.wholesale }),
      },
    })
    return Response.json(product)
  } catch (err) {
    console.error('[API Admin Products PATCH]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { adminKey } = await req.json()
    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    // Vérifier s'il y a des commandes liées
    const itemCount = await prisma.orderItem.count({ where: { productId: params.id } })
    if (itemCount > 0) {
      // Désactiver plutôt que supprimer si lié à des commandes
      await prisma.product.update({
        where: { id: params.id },
        data: { inStock: false },
      })
      return Response.json({ success: true, archived: true })
    }
    await prisma.product.delete({ where: { id: params.id } })
    return Response.json({ success: true, deleted: true })
  } catch (err) {
    console.error('[API Admin Products DELETE]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
