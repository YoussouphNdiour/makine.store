import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { RefundButton, MarkDeliveredButton } from './AdminActions'
import AdminShell from '@/components/AdminShell'
import { ExportButton } from './ExportButton'

export const dynamic = 'force-dynamic'
import { OrderDetail } from './OrderDetail'

// ─── Stat cards (existing 4) ────────────────────────────────────────────────
async function getStats() {
  const [total, revenue, pending, confirmed] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: 'paid' },
    }),
    prisma.order.count({ where: { paymentStatus: 'pending' } }),
    prisma.order.count({ where: { status: 'confirmed' } }),
  ])
  return { total, revenue: revenue._sum.totalAmount ?? 0, pending, confirmed }
}

// ─── New: revenue / activity stats (last 7 days) ────────────────────────────
async function getRecentStats() {
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(todayMidnight)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [todayCount, weekRevenue, awaitingDelivery, waveStats] = await Promise.all([
    // Commandes aujourd'hui
    prisma.order.count({ where: { createdAt: { gte: todayMidnight } } }),
    // Revenus cette semaine (hors annulées)
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { not: 'cancelled' },
        paymentStatus: 'paid',
      },
    }),
    // En attente de livraison
    prisma.order.count({
      where: { status: { in: ['confirmed', 'shipped'] } },
    }),
    // Taux Wave
    prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      where: { paymentStatus: 'paid' },
    }),
  ])

  const totalPaid = waveStats.reduce((s, r) => s + r._count.id, 0)
  const wavePaid = waveStats.find(r => r.paymentMethod === 'wave')?._count.id ?? 0
  const waveRate = totalPaid > 0 ? Math.round((wavePaid / totalPaid) * 100) : 0

  return {
    todayCount,
    weekRevenue: weekRevenue._sum.totalAmount ?? 0,
    awaitingDelivery,
    waveRate,
  }
}

// ─── Orders query ────────────────────────────────────────────────────────────
async function getOrders(paymentFilter: string, statusFilter: string) {
  const where: Record<string, unknown> = {}

  // Payment filter tabs (existing)
  if (paymentFilter === 'pending') where.paymentStatus = 'pending'
  else if (paymentFilter === 'paid') where.paymentStatus = 'paid'
  else if (paymentFilter === 'wave') where.paymentMethod = 'wave'

  // Status filter tabs (new)
  if (statusFilter && statusFilter !== 'all') {
    where.status = statusFilter
  }

  // When paymentFilter is 'confirmed' it was actually a status filter in the
  // original code — keep backward-compat: treat it as a status filter.
  if (paymentFilter === 'confirmed') {
    delete where.paymentStatus
    where.status = 'confirmed'
  }

  return prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
      {text}
    </span>
  )
}

const paymentColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  refunded: 'bg-purple-100 text-purple-700',
  failed: 'bg-red-100 text-red-700',
}

const statusColors: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-teal-100 text-teal-700',
  cancelled: 'bg-red-100 text-red-700',
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { key?: string; filter?: string; status?: string }
}) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  const isAuth = searchParams.key === adminPassword

  const paymentFilter = searchParams.filter ?? 'all'
  const statusFilter = searchParams.status ?? 'all'

  const [stats, recentStats, orders] = isAuth
    ? await Promise.all([getStats(), getRecentStats(), getOrders(paymentFilter, statusFilter)])
    : [
        { total: 0, revenue: 0, pending: 0, confirmed: 0 },
        { todayCount: 0, weekRevenue: 0, awaitingDelivery: 0, waveRate: 0 },
        [],
      ]

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Page header with CSV export ── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-makine-black">Commandes</h1>
          {isAuth && <ExportButton adminKey={searchParams.key ?? ''} />}
        </div>

        {/* ── Existing 4 stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Commandes total', value: stats.total, color: 'text-makine-black' },
            {
              label: 'Revenu (payé)',
              value: `${stats.revenue.toLocaleString('fr-FR')} FCFA`,
              color: 'text-makine-gold',
            },
            { label: 'En attente paiement', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Confirmées', value: stats.confirmed, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`font-serif text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Feature 3: Recent activity stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Commandes aujourd\'hui',
              value: recentStats.todayCount,
              color: 'text-rose-deep',
              sub: 'depuis minuit',
            },
            {
              label: 'Revenus cette semaine',
              value: `${recentStats.weekRevenue.toLocaleString('fr-FR')} FCFA`,
              color: 'text-rose-wine',
              sub: '7 derniers jours (payés)',
            },
            {
              label: 'En attente livraison',
              value: recentStats.awaitingDelivery,
              color: 'text-indigo-600',
              sub: 'confirmées + expédiées',
            },
            {
              label: 'Taux Wave (payés)',
              value: `${recentStats.waveRate}%`,
              color: 'text-blue-600',
              sub: 'commandes Wave payées',
            },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className={`font-serif text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-300 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Feature 4: Payment filter tabs (original) ── */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'pending', label: '⏳ En attente paiement' },
            { key: 'paid', label: '✅ Payées' },
            { key: 'confirmed', label: '📦 Confirmées' },
            { key: 'wave', label: '💙 Wave' },
          ].map(({ key, label }) => (
            <Link
              key={key}
              href={`/admin?key=${adminPassword}&filter=${key}&status=${statusFilter}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                paymentFilter === key
                  ? 'bg-makine-gold text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-makine-beige'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Feature 4: Order status filter tabs (new) ── */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'Tous statuts' },
            { key: 'new', label: '🆕 Nouveau' },
            { key: 'confirmed', label: '✅ Confirmé' },
            { key: 'shipped', label: '🚚 Expédié' },
            { key: 'delivered', label: '📬 Livré' },
            { key: 'cancelled', label: '❌ Annulé' },
          ].map(({ key, label }) => (
            <Link
              key={key}
              href={`/admin?key=${adminPassword}&filter=${paymentFilter}&status=${key}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                statusFilter === key
                  ? 'bg-makine-black text-white border-makine-black shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="ml-auto text-xs text-gray-400 self-center">
            {orders.length} commande{orders.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Orders table ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-makine-beige text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Réf</th>
                  <th className="text-left px-4 py-3 font-semibold">Client</th>
                  <th className="text-left px-4 py-3 font-semibold">Articles</th>
                  <th className="text-left px-4 py-3 font-semibold">Montant</th>
                  <th className="text-left px-4 py-3 font-semibold">Paiement</th>
                  <th className="text-left px-4 py-3 font-semibold">Statut</th>
                  <th className="text-left px-4 py-3 font-semibold">WA</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                        {order.id.slice(-8).toUpperCase()}
                      </code>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium leading-tight">{order.customerName}</p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-xs text-gray-400 hover:text-makine-gold"
                      >
                        {order.customerPhone}
                      </a>
                      {order.address && (
                        <p className="text-xs text-gray-300 truncate max-w-[120px]">{order.address}</p>
                      )}
                    </td>

                    {/* Feature 2: Articles column now uses OrderDetail expandable panel */}
                    <td className="px-4 py-3">
                      <OrderDetail
                        orderId={order.id}
                        currency={order.currency === 'XOF' ? 'FCFA' : '€'}
                        items={order.items.map(item => ({
                          name: item.product.name,
                          quantity: item.quantity,
                          price: item.price,
                        }))}
                      />
                    </td>

                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {order.totalAmount.toLocaleString('fr-FR')}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        {order.currency === 'XOF' ? 'FCFA' : '€'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge
                          text={order.paymentStatus}
                          className={paymentColors[order.paymentStatus] ?? 'bg-gray-100 text-gray-700'}
                        />
                        <span className={`text-xs ${order.paymentMethod === 'wave' ? 'text-blue-500' : 'text-orange-500'}`}>
                          {order.paymentMethod === 'wave' ? '💙 Wave' : '🟠 Orange'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <Badge
                        text={order.status}
                        className={statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}
                      />
                    </td>

                    <td className="px-4 py-3 text-center text-base">
                      {order.whatsappSent ? '✅' : '⏳'}
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                      <br />
                      {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5 min-w-[100px]">
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Bonjour ${order.customerName}, concernant votre commande Makiné #${order.id.slice(-8).toUpperCase()} 🌸`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-center text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          📱 WhatsApp
                        </a>

                        {order.paymentMethod === 'wave' && order.paymentStatus === 'paid' && (
                          <RefundButton orderId={order.id} adminKey={adminPassword} />
                        )}

                        {['confirmed', 'shipped'].includes(order.status) && (
                          <MarkDeliveredButton orderId={order.id} adminKey={adminPassword} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-4">📭</p>
                <p>Aucune commande pour ce filtre.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
