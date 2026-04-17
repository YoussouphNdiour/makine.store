import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { adminKey, bundleItems: bundleItemsRaw, ...data } = await req.json()
    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Si bundleItems fournis, remplacer entièrement
    if (bundleItemsRaw !== undefined) {
      await prisma.bundleItem.deleteMany({ where: { bundleId: params.id } })
      if (bundleItemsRaw.length > 0) {
        await prisma.bundleItem.createMany({
          data: (bundleItemsRaw as Array<{ componentId: string; qty: number }>).map((bi) => ({
            bundleId: params.id,
            componentId: bi.componentId,
            qty: bi.qty,
          })),
        })
      }
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
        ...(data.stockQty !== undefined && {
          stockQty: data.stockQty !== '' && data.stockQty != null ? parseInt(data.stockQty) : null,
        }),
        ...(data.isBundle !== undefined && { isBundle: data.isBundle }),
        ...(data.inStock !== undefined && { inStock: data.inStock }),
        ...(data.wholesale !== undefined && { wholesale: data.wholesale }),
      },
      include: { bundleItems: { include: { component: true } } },
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
    const itemCount = await prisma.orderItem.count({ where: { productId: params.id } })
    if (itemCount > 0) {
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
