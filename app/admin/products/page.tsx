import { prisma } from '@/lib/prisma'
import AdminShell from '@/components/AdminShell'
import ProductManager from './ProductManager'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { key?: string ; _theme?: string }
}) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  const adminTheme = (searchParams._theme === 'light' ? 'light' : 'dark') as 'dark' | 'light'
  const isAuth = searchParams.key === adminPassword

  const products = isAuth
    ? await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { bundleItems: { include: { component: true } } },
      })
    : []

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin/products" theme={adminTheme}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ProductManager initialProducts={products} adminKey={adminPassword} />
      </div>
    </AdminShell>
  )
}
