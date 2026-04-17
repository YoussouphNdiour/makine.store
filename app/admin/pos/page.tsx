import { prisma } from '@/lib/prisma'
import AdminShell from '@/components/AdminShell'
import POSInterface from './POSInterface'

export default async function AdminPOSPage({
  searchParams,
}: {
  searchParams: { key?: string }
}) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  const isAuth = searchParams.key === adminPassword

  const products = isAuth
    ? await prisma.product.findMany({
        where: { inStock: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, category: true, priceXOF: true, price: true, badge: true, inStock: true },
      })
    : []

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin/pos">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <POSInterface products={products} adminKey={adminPassword} />
      </div>
    </AdminShell>
  )
}
