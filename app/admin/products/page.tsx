import { prisma } from '@/lib/prisma'
import AdminShell from '@/components/AdminShell'
import ProductManager from './ProductManager'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { key?: string }
}) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  const isAuth = searchParams.key === adminPassword

  const products = isAuth
    ? await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    : []

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin/products">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ProductManager initialProducts={products} adminKey={adminPassword} />
      </div>
    </AdminShell>
  )
}
