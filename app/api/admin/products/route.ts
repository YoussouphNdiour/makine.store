import { prisma } from '@/lib/prisma'

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('adminKey') !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { bundleItems: { include: { component: true } } },
  })
  return Response.json(products)
}

export async function POST(req: Request) {
  try {
    const { adminKey, bundleItems: bundleItemsRaw, ...data } = await req.json()
    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const slug = data.slug?.trim() || slugify(data.name)
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? '',
        price: parseFloat(data.price) || 0,
        priceXOF: parseInt(data.priceXOF) || 0,
        priceXOF2: data.priceXOF2 ? parseInt(data.priceXOF2) : null,
        category: data.category,
        badge: data.badge || null,
        imageUrl: data.imageUrl || null,
        stockQty: data.stockQty !== '' && data.stockQty != null ? parseInt(data.stockQty) : null,
        isBundle: data.isBundle ?? false,
        inStock: data.inStock ?? true,
        wholesale: data.wholesale ?? false,
        bundleItems: bundleItemsRaw?.length
          ? {
              create: (bundleItemsRaw as Array<{ componentId: string; qty: number }>).map((bi) => ({
                componentId: bi.componentId,
                qty: bi.qty,
              })),
            }
          : undefined,
      },
      include: { bundleItems: { include: { component: true } } },
    })
    return Response.json(product)
  } catch (err) {
    console.error('[API Admin Products POST]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
