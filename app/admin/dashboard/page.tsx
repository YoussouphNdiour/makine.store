import { prisma } from '@/lib/prisma'
import AdminShell from '@/components/AdminShell'

export const dynamic = 'force-dynamic'

function fmtDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}

const THEMES = {
  dark: {
    card:        'rgba(255,255,255,0.04)',
    cardBorder:  'rgba(255,255,255,0.08)',
    text:        '#f0ede8',
    textMuted:   '#8a8498',
    accent:      '#d4607a',
    accentRgb:   '212,96,122',
    divider:     'rgba(255,255,255,0.06)',
    barBg:       'rgba(255,255,255,0.06)',
  },
  light: {
    card:        '#fff',
    cardBorder:  'rgba(0,0,0,0.06)',
    text:        '#1a0a12',
    textMuted:   '#9a7080',
    accent:      '#9e3d58',
    accentRgb:   '158,61,88',
    divider:     'rgba(0,0,0,0.06)',
    barBg:       'rgba(158,61,88,0.08)',
  },
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau', confirmed: 'Confirmé', shipped: 'Expédié',
  delivered: 'Livré', cancelled: 'Annulé',
}
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new:       { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' },
  confirmed: { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa' },
  shipped:   { bg: 'rgba(129,140,248,0.15)', text: '#818cf8' },
  delivered: { bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
  cancelled: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
}
const PAYMENT_LABELS: Record<string, string> = {
  wave: 'Wave', orange_money: 'Orange Money', whatsapp: 'WhatsApp', cash: 'Espèces',
}
const PAYMENT_DOTS: Record<string, string> = {
  wave: '#3b82f6', orange_money: '#f97316', whatsapp: '#22c55e', cash: '#737373',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { key?: string; _theme?: string }
}) {
  const adminTheme = (searchParams._theme === 'light' ? 'light' : 'dark') as 'dark' | 'light'
  const t = THEMES[adminTheme]

  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const fourteenDaysAgo = new Date(todayMidnight)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)

  const [
    totalOrders,
    revenueSNResult,
    pendingOrders,
    todayOrders,
    activeSessions,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'paid' } }),
    prisma.order.count({ where: { status: { in: ['new', 'confirmed'] } } }),
    prisma.order.count({ where: { createdAt: { gte: todayMidnight } } }),
    prisma.whatsappSession.count(),
  ])

  const totalRevenue = revenueSNResult._sum.totalAmount ?? 0

  // Revenue last 14 days
  const revenueByDayRaw = await prisma.order.findMany({
    where: { paymentStatus: 'paid', createdAt: { gte: fourteenDaysAgo } },
    select: { createdAt: true, totalAmount: true },
  })
  const dayMap: Record<string, number> = {}
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo)
    d.setDate(d.getDate() + i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const order of revenueByDayRaw) {
    const key = order.createdAt.toISOString().slice(0, 10)
    if (key in dayMap) dayMap[key] += order.totalAmount
  }
  const chartDays = Object.entries(dayMap).map(([dateStr, total]) => ({
    dateStr,
    label: fmtDate(new Date(dateStr)),
    total,
  }))
  const maxRevenue = Math.max(...chartDays.map(d => d.total), 1)

  // Top 5 products
  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  })
  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProductsRaw.map(r => r.productId) } },
    select: { id: true, name: true },
  })
  const productNameMap = Object.fromEntries(topProductDetails.map(p => [p.id, p.name]))
  const topProducts = topProductsRaw.map(r => ({
    name: productNameMap[r.productId] ?? r.productId,
    qty: r._sum.quantity ?? 0,
  }))
  const maxQty = Math.max(...topProducts.map(p => p.qty), 1)

  // Payment breakdown
  const paymentStats = await prisma.order.groupBy({
    by: ['paymentMethod'],
    _count: { id: true },
  })
  const totalForPayment = paymentStats.reduce((s, r) => s + r._count.id, 0)

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, createdAt: true, customerName: true, totalAmount: true, currency: true, status: true },
  })

  const KPI_CARDS = [
    { label: 'Total commandes', value: totalOrders.toLocaleString('fr-FR'), sub: 'toutes périodes', icon: '📋' },
    { label: 'Revenu encaissé', value: `${Math.round(totalRevenue).toLocaleString('fr-FR')} FCFA`, sub: 'paiements confirmés', icon: '💰' },
    { label: 'En cours', value: pendingOrders.toLocaleString('fr-FR'), sub: 'new + confirmées', icon: '⏳' },
    { label: "Aujourd'hui", value: todayOrders.toLocaleString('fr-FR'), sub: 'depuis minuit', icon: '📅' },
    { label: 'Sessions WA', value: activeSessions.toLocaleString('fr-FR'), sub: 'actives', icon: '💬' },
  ]

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin/dashboard" theme={adminTheme}>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl font-bold" style={{ color: t.text }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: t.textMuted }}>Vue d&apos;ensemble de l&apos;activité Makiné</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {KPI_CARDS.map(card => (
            <div
              key={card.label}
              className="relative rounded-2xl p-5 flex flex-col gap-2 overflow-hidden"
              style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 0% 0%, rgba(${t.accentRgb},0.07) 0%, transparent 60%)` }}
              />
              <span className="text-xl relative">{card.icon}</span>
              <div className="relative">
                <p className="font-serif text-2xl font-bold leading-tight" style={{ color: t.text }}>{card.value}</p>
                <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{card.label}</p>
                <p className="text-[10px] mt-1" style={{ color: `rgba(${t.accentRgb},0.5)` }}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="rounded-2xl p-6" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
          <p className="font-serif text-base font-semibold mb-1" style={{ color: t.text }}>Revenus — 14 derniers jours</p>
          <p className="text-xs mb-5" style={{ color: t.textMuted }}>Montants payés (FCFA)</p>
          <div className="h-40 flex items-end gap-1">
            {chartDays.map(({ dateStr, label, total }) => {
              const pct = Math.max((total / maxRevenue) * 100, total > 0 ? 4 : 0)
              return (
                <div key={dateStr} className="relative flex-1 h-full flex flex-col justify-end group">
                  {total > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
                      <div className="rounded-lg px-2 py-1 text-[10px] whitespace-nowrap shadow-lg"
                        style={{ background: t.accent, color: '#fff' }}>
                        {Math.round(total).toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  )}
                  <div
                    className="rounded-t transition-all duration-300"
                    style={{ height: `${pct}%`, background: total > 0 ? t.accent : t.barBg }}
                  />
                  <p className="text-center mt-1 leading-none" style={{ fontSize: 9, color: t.textMuted }}>{label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products + Payment breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top products */}
          <div className="rounded-2xl p-6" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="font-serif text-base font-semibold mb-1" style={{ color: t.text }}>Top 5 produits</p>
            <p className="text-xs mb-5" style={{ color: t.textMuted }}>Par quantité vendue</p>
            <ol className="space-y-4">
              {topProducts.map((product, idx) => {
                const pct = Math.round((product.qty / maxQty) * 100)
                return (
                  <li key={product.name} className="flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-none"
                      style={{
                        background: idx === 0 ? t.accent : `rgba(${t.accentRgb},0.12)`,
                        color: idx === 0 ? '#fff' : t.accent,
                      }}
                    >{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate" style={{ color: t.text }}>{product.name}</p>
                        <span className="text-xs ml-2 flex-none" style={{ color: t.textMuted }}>{product.qty} vendus</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.barBg }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: t.accent }} />
                      </div>
                    </div>
                  </li>
                )
              })}
              {topProducts.length === 0 && <li className="text-center py-8 text-sm" style={{ color: t.textMuted }}>Aucune vente</li>}
            </ol>
          </div>

          {/* Payment breakdown */}
          <div className="rounded-2xl p-6" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="font-serif text-base font-semibold mb-1" style={{ color: t.text }}>Répartition paiements</p>
            <p className="text-xs mb-5" style={{ color: t.textMuted }}>{totalForPayment} commande{totalForPayment > 1 ? 's' : ''} au total</p>
            <ul className="space-y-4">
              {paymentStats.sort((a, b) => b._count.id - a._count.id).map(stat => {
                const pct = totalForPayment > 0 ? Math.round((stat._count.id / totalForPayment) * 100) : 0
                const dot = PAYMENT_DOTS[stat.paymentMethod] ?? '#737373'
                return (
                  <li key={stat.paymentMethod} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full flex-none" style={{ background: dot }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium" style={{ color: t.text }}>{PAYMENT_LABELS[stat.paymentMethod] ?? stat.paymentMethod}</p>
                        <span className="text-xs" style={{ color: t.textMuted }}>{stat._count.id} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: t.barBg }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: dot }} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl p-6" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
          <p className="font-serif text-base font-semibold mb-1" style={{ color: t.text }}>Activité récente</p>
          <p className="text-xs mb-5" style={{ color: t.textMuted }}>10 dernières commandes</p>
          <ul style={{ borderTop: `1px solid ${t.divider}` }}>
            {recentOrders.map(order => {
              const sta = STATUS_COLORS[order.status] ?? { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' }
              const amount = order.currency === 'EUR'
                ? `${order.totalAmount.toFixed(2)} €`
                : `${Math.round(order.totalAmount).toLocaleString('fr-FR')} FCFA`
              return (
                <li key={order.id} className="flex items-center gap-4 py-3" style={{ borderBottom: `1px solid ${t.divider}` }}>
                  <div className="flex flex-col items-center flex-none w-10">
                    <div className="w-2 h-2 rounded-full" style={{ background: t.accent }} />
                    <p className="mt-1 leading-none text-[10px]" style={{ color: t.textMuted }}>{timeAgo(order.createdAt)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: t.text }}>{order.customerName}</p>
                    <p className="text-xs" style={{ color: t.textMuted }}>
                      {order.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold flex-none" style={{ color: t.accent }}>{amount}</p>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium flex-none" style={{ background: sta.bg, color: sta.text }}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </li>
              )
            })}
            {recentOrders.length === 0 && (
              <li className="text-center py-12 text-sm" style={{ color: t.textMuted }}>Aucune commande récente</li>
            )}
          </ul>
        </div>

      </div>
    </AdminShell>
  )
}
