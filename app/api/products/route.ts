import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ inStock: 'desc' }, { createdAt: 'desc' }],
    })
    return Response.json(products)
  } catch {
    return Response.json([])
  }
}
