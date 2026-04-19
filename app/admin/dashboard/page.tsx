import { prisma } from '@/lib/prisma'
import AdminShell from '@/components/AdminShell'

export const dynamic = 'force-dynamic'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}j`
}

function fmtDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  confirmed: 'Confirmé',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
}

const PAYMENT_COLORS: Record<string, string> = {
  wave: 'bg-blue-500',
  orange_money: 'bg-orange-500',
  whatsapp: 'bg-green-500',
  cash: 'bg-gray-500',
}

const PAYMENT_LABELS: Record<string, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  whatsapp: 'WhatsApp',
  cash: 'Cash',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { key?: string; _theme?: string }
}) {
  const adminTheme = (searchParams._theme === 'light' ? 'light' : 'dark') as 'dark' | 'light'
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const fourteenDaysAgo = new Date(todayMidnight)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13) // 14 days inclusive

  // ── Section 1: KPI queries ────────────────────────────────────────────────
  const [
    totalOrders,
    revenueSNResult,
    revenueFRResult,
    pendingOrders,
    todayOrders,
    activeSessions,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { currency: 'XOF', paymentStatus: 'paid' },
    }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { currency: 'EUR', paymentStatus: 'paid' },
    }),
    prisma.order.count({
      where: { status: { in: ['new', 'confirmed'] } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: todayMidnight } },
    }),
    prisma.whatsappSession.count(),
  ])

  const totalRevenueSN = revenueSNResult._sum.totalAmount ?? 0
  const totalRevenueFR = revenueFRResult._sum.totalAmount ?? 0

  // ── Section 2: Revenue by day (last 14 days, paid) ───────────────────────
  const revenueByDayRaw = await prisma.order.findMany({
    where: {
      paymentStatus: 'paid',
      createdAt: { gte: fourteenDaysAgo },
    },
    select: { createdAt: true, totalAmount: true, currency: true },
  })

  // Build a map: "YYYY-MM-DD" => total in XOF equivalent
  const dayMap: Record<string, number> = {}
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    dayMap[key] = 0
  }
  for (const order of revenueByDayRaw) {
    const key = order.createdAt.toISOString().slice(0, 10)
    if (key in dayMap) {
      // Normalise EUR → XOF at ~655.957 for display purposes (rough)
      const amount = order.currency === 'EUR' ? order.totalAmount * 656 : order.totalAmount
      dayMap[key] = (dayMap[key] ?? 0) + amount
    }
  }
  const chartDays = Object.entries(dayMap).map(([dateStr, total]) => ({
    dateStr,
    label: fmtDate(new Date(dateStr)),
    total,
  }))
  const maxRevenue = Math.max(...chartDays.map((d) => d.total), 1)

  // ── Section 3: Top 5 products ─────────────────────────────────────────────
  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  })

  const topProductIds = topProductsRaw.map((r) => r.productId)
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  })
  const productNameMap = Object.fromEntries(topProductDetails.map((p) => [p.id, p.name]))

  const topProducts = topProductsRaw.map((r) => ({
    productId: r.productId,
    name: productNameMap[r.productId] ?? r.productId,
    qty: r._sum.quantity ?? 0,
  }))
  const maxQty = Math.max(...topProducts.map((p) => p.qty), 1)

  // ── Section 4: Payment method breakdown ──────────────────────────────────
  const paymentMethodStats = await prisma.order.groupBy({
    by: ['paymentMethod'],
    _count: { id: true },
  })
  const totalOrdersForPayment = paymentMethodStats.reduce((s, r) => s + r._count.id, 0)

  // ── Section 5: Recent orders ──────────────────────────────────────────────
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      createdAt: true,
      customerName: true,
      totalAmount: true,
      currency: true,
      status: true,
    },
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin/dashboard" theme={adminTheme}>
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#2C1A1E]">Dashboard</h1>
          <p className="text-sm text-[#8A6068] mt-1">Vue d&apos;ensemble de l&apos;activité Makiné</p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* Section 1 — KPI cards                                               */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
          {[
            {
              label: 'Total commandes',
              value: totalOrders.toLocaleString('fr-FR'),
              sub: 'toutes périodes',
            },
            {
              label: 'Revenus XOF',
              value: `${Math.round(totalRevenueSN).toLocaleString('fr-FR')}`,
              sub: 'FCFA payés',
            },
            {
              label: 'Revenus EUR',
              value: `${totalRevenueFR.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
              sub: 'EUR payés',
            },
            {
              label: 'En cours',
              value: pendingOrders.toLocaleString('fr-FR'),
              sub: 'new + confirmées',
            },
            {
              label: "Aujourd'hui",
              value: todayOrders.toLocaleString('fr-FR'),
              sub: 'depuis minuit',
            },
            {
              label: 'Sessions WA',
              value: activeSessions.toLocaleString('fr-FR'),
              sub: 'actives',
            },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-[#FAE9EC] shadow-sm p-5 flex flex-col gap-1"
            >
              <p className="text-xs text-[#8A6068] leading-tight">{label}</p>
              <p className="font-serif text-3xl font-bold text-[#6B1E2E] leading-none">{value}</p>
              <p className="text-xs text-[#EFC6CB] mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* Section 2 — Revenue bar chart (last 14 days)                        */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#FAE9EC] shadow-sm p-6 mb-10">
          <h2 className="font-serif text-xl font-semibold text-[#2C1A1E] mb-1">
            Revenus — 14 derniers jours
          </h2>
          <p className="text-xs text-[#8A6068] mb-6">Montants payés (XOF, EUR converti)</p>

          <div className="h-48 flex items-end gap-1">
            {chartDays.map(({ dateStr, label, total }) => {
              const pct = maxRevenue > 0 ? Math.max((total / maxRevenue) * 100, total > 0 ? 4 : 0) : 0
              return (
                <div
                  key={dateStr}
                  className="relative flex-1 h-full flex flex-col justify-end group"
                >
                  {/* Tooltip on hover */}
                  {total > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
                      <div className="bg-[#2C1A1E] text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                        {Math.round(total).toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  )}
                  {/* Bar */}
                  <div
                    className="bg-[#A03048] rounded-t transition-all duration-300 hover:bg-[#6B1E2E]"
                    style={{ height: `${pct}%` }}
                  />
                  {/* Date label */}
                  <p className="text-center text-[10px] text-[#8A6068] mt-1 leading-none">
                    {label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* Section 3 + 4 — Two-column layout                                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">

          {/* Section 3 — Top 5 produits */}
          <div className="bg-white rounded-2xl border border-[#FAE9EC] shadow-sm p-6">
            <h2 className="font-serif text-xl font-semibold text-[#2C1A1E] mb-1">
              Top 5 produits
            </h2>
            <p className="text-xs text-[#8A6068] mb-6">Par quantité vendue (toutes périodes)</p>

            <ol className="space-y-4">
              {topProducts.map((product, idx) => {
                const pct = maxQty > 0 ? Math.round((product.qty / maxQty) * 100) : 0
                return (
                  <li key={product.productId} className="flex items-center gap-3">
                    {/* Position badge */}
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        idx === 0
                          ? 'bg-[#A03048] text-white'
                          : idx === 1
                          ? 'bg-[#D4898E] text-white'
                          : 'bg-[#FAE9EC] text-[#6B1E2E]'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {/* Name + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[#2C1A1E] truncate">{product.name}</p>
                        <span className="text-xs text-[#8A6068] ml-2 shrink-0">
                          {product.qty} vendu{product.qty > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#FAE9EC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#A03048] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
              {topProducts.length === 0 && (
                <li className="text-center py-8 text-[#8A6068] text-sm">Aucune vente enregistrée</li>
              )}
            </ol>
          </div>

          {/* Section 4 — Répartition paiements */}
          <div className="bg-white rounded-2xl border border-[#FAE9EC] shadow-sm p-6">
            <h2 className="font-serif text-xl font-semibold text-[#2C1A1E] mb-1">
              Répartition paiements
            </h2>
            <p className="text-xs text-[#8A6068] mb-6">
              Par méthode — {totalOrdersForPayment} commande{totalOrdersForPayment > 1 ? 's' : ''} au total
            </p>

            <ul className="space-y-4">
              {paymentMethodStats
                .sort((a, b) => b._count.id - a._count.id)
                .map((stat) => {
                  const pct =
                    totalOrdersForPayment > 0
                      ? Math.round((stat._count.id / totalOrdersForPayment) * 100)
                      : 0
                  const dotColor = PAYMENT_COLORS[stat.paymentMethod] ?? 'bg-gray-400'
                  const label = PAYMENT_LABELS[stat.paymentMethod] ?? stat.paymentMethod
                  return (
                    <li key={stat.paymentMethod} className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-[#2C1A1E]">{label}</p>
                          <span className="text-xs text-[#8A6068]">
                            {stat._count.id} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 bg-[#FAE9EC] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${dotColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  )
                })}
              {paymentMethodStats.length === 0 && (
                <li className="text-center py-8 text-[#8A6068] text-sm">
                  Aucune donnée de paiement
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* Section 5 — Activité récente                                         */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#FAE9EC] shadow-sm p-6">
          <h2 className="font-serif text-xl font-semibold text-[#2C1A1E] mb-1">
            Activité récente
          </h2>
          <p className="text-xs text-[#8A6068] mb-6">10 dernières commandes</p>

          <ul className="divide-y divide-[#FDF6F7]">
            {recentOrders.map((order) => {
              const statusClass = STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
              const statusLabel = STATUS_LABELS[order.status] ?? order.status
              const amountStr =
                order.currency === 'EUR'
                  ? `${order.totalAmount.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} €`
                  : `${Math.round(order.totalAmount).toLocaleString('fr-FR')} FCFA`
              return (
                <li key={order.id} className="flex items-center gap-4 py-3">
                  {/* Time indicator */}
                  <div className="flex flex-col items-center shrink-0 w-10">
                    <div className="w-2 h-2 rounded-full bg-[#D4898E]" />
                    <p className="text-[10px] text-[#8A6068] mt-1 leading-none">
                      {timeAgo(new Date(order.createdAt))}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2C1A1E] truncate">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-[#8A6068]">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Amount */}
                  <p className="text-sm font-semibold text-[#6B1E2E] shrink-0">{amountStr}</p>

                  {/* Status badge */}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </li>
              )
            })}
            {recentOrders.length === 0 && (
              <li className="text-center py-12 text-[#8A6068] text-sm">
                Aucune commande récente
              </li>
            )}
          </ul>
        </div>

      </div>
    </AdminShell>
  )
}
