import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  if (key !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Optional period filter
  const monthParam = req.nextUrl.searchParams.get('month')
  const yearParam = req.nextUrl.searchParams.get('year')

  let dateFilter: { gte?: Date; lte?: Date } | undefined
  let filenameSuffix = 'toutes'

  if (monthParam && yearParam) {
    const month = parseInt(monthParam)
    const year = parseInt(yearParam)
    dateFilter = {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59),
    }
    const MONTHS_FR = [
      'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
    ]
    filenameSuffix = `${MONTHS_FR[month - 1]}-${year}`
  }

  const orders = await prisma.order.findMany({
    where: dateFilter ? { createdAt: dateFilter } : undefined,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const rows = ['ID,Date,Client,Téléphone,Pays,Total,Devise,Paiement,Statut,Produits']
  for (const o of orders) {
    const products = o.items.map(i => `${i.product.name}×${i.quantity}`).join(' | ')
    rows.push([
      o.id.slice(0, 8),
      new Date(o.createdAt).toLocaleDateString('fr-FR'),
      o.customerName,
      o.customerPhone,
      o.country,
      o.totalAmount,
      o.currency,
      o.paymentMethod,
      o.status,
      `"${products}"`
    ].join(','))
  }

  return new NextResponse(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="commandes-makine-${filenameSuffix}.csv"`,
    },
  })
}
