import { prisma } from '@/lib/prisma'

const EUR_TO_XOF = 655.957 // parité fixe CFA

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      country,
      currency,
      paymentMethod,
      items,
    } = body

    if (!customerName || !customerPhone || !country || !paymentMethod || !items?.length) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // [SECURITY] Calcul du total côté serveur — ne jamais faire confiance au client
    const validatedItems = items as Array<{ productId: string; quantity: number; price: number }>
    if (validatedItems.some(i => !i.productId || i.quantity < 1 || i.price < 0)) {
      return Response.json({ error: 'Articles invalides' }, { status: 400 })
    }

    const computedTotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Convertir en XOF si commande EUR
    const totalAmount = currency === 'EUR'
      ? Math.round(computedTotal * EUR_TO_XOF)
      : Math.round(computedTotal)

    if (totalAmount <= 0) {
      return Response.json({ error: 'Total invalide' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        address: address || null,
        country,
        currency,
        totalAmount,
        paymentMethod,
        paymentStatus: 'pending',
        status: 'new',
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })

    // Décrémenter le stock pour chaque article
    for (const item of validatedItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { bundleItems: true },
      })
      if (!product) continue

      if (product.isBundle && product.bundleItems.length > 0) {
        // Gamme : décrémenter chaque composant
        for (const bi of product.bundleItems) {
          const comp = await prisma.product.findUnique({ where: { id: bi.componentId } })
          if (!comp || comp.stockQty == null) continue
          const newQty = comp.stockQty - bi.qty * item.quantity
          await prisma.product.update({
            where: { id: bi.componentId },
            data: { stockQty: Math.max(0, newQty), inStock: newQty > 0 },
          })
        }
      } else if (product.stockQty != null) {
        // Produit simple avec stock fini
        const newQty = product.stockQty - item.quantity
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQty: Math.max(0, newQty), inStock: newQty > 0 },
        })
      }
    }

    return Response.json({ orderId: order.id })
  } catch (err) {
    console.error('[API Orders]', err)
    return Response.json({ error: 'Erreur création commande' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const orders = await prisma.order.findMany({
      where: status ? { status } : undefined,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return Response.json(orders)
  } catch (err) {
    console.error('[API Orders GET]', err)
    return Response.json({ error: 'Erreur' }, { status: 500 })
  }
}
