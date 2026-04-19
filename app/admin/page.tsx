import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminShell from '@/components/AdminShell'
import { ExportButton } from './ExportButton'
import AdminOrdersClient from './AdminOrdersClient'

export const dynamic = 'force-dynamic'

// ── Theme tokens for server-rendered content ──────────────────────────────────
const THEMES = {
  dark: {
    card:        'rgba(255,255,255,0.04)',
    cardBorder:  'rgba(255,255,255,0.08)',
    text:        '#f0ede8',
    textMuted:   '#8a8498',
    accent:      '#d4607a',
    accentRgb:   '212,96,122',
    sub:         'rgba(240,237,232,0.4)',
  },
  light: {
    card:        '#fff',
    cardBorder:  'rgba(0,0,0,0.06)',
    text:        '#1a0a12',
    textMuted:   '#9a7080',
    accent:      '#9e3d58',
    accentRgb:   '158,61,88',
    sub:         'rgba(26,10,18,0.4)',
  },
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getStats() {
  const [total, revenue, pending, confirmed] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'paid' } }),
    prisma.order.count({ where: { paymentStatus: 'pending' } }),
    prisma.order.count({ where: { status: 'confirmed' } }),
  ])
  return { total, revenue: revenue._sum.totalAmount ?? 0, pending, confirmed }
}

async function getRecentStats() {
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(todayMidnight)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const yesterdayMidnight = new Date(todayMidnight)
  yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)

  const [todayCount, yesterdayCount, weekRevenue, prevWeekRevenue, awaitingDelivery, waveStats] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayMidnight } } }),
    prisma.order.count({ where: { createdAt: { gte: yesterdayMidnight, lt: todayMidnight } } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'cancelled' }, paymentStatus: 'paid' } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: new Date(sevenDaysAgo.getTime() - 7 * 86400000), lt: sevenDaysAgo },
        status: { not: 'cancelled' },
        paymentStatus: 'paid',
      },
    }),
    prisma.order.count({ where: { status: { in: ['confirmed', 'shipped'] } } }),
    prisma.order.groupBy({ by: ['paymentMethod'], _count: { id: true }, where: { paymentStatus: 'paid' } }),
  ])

  const totalPaid = waveStats.reduce((s, r) => s + r._count.id, 0)
  const wavePaid = waveStats.find(r => r.paymentMethod === 'wave')?._count.id ?? 0
  const waveRate = totalPaid > 0 ? Math.round((wavePaid / totalPaid) * 100) : 0
  const weekRev = weekRevenue._sum.totalAmount ?? 0
  const prevRev = prevWeekRevenue._sum.totalAmount ?? 0
  const revTrend = prevRev > 0 ? Math.round(((weekRev - prevRev) / prevRev) * 100) : null

  return { todayCount, yesterdayCount, weekRevenue: weekRev, revTrend, awaitingDelivery, waveRate }
}

async function getOrders(paymentFilter: string, statusFilter: string) {
  const where: Record<string, unknown> = {}
  if (paymentFilter === 'pending')   where.paymentStatus = 'pending'
  else if (paymentFilter === 'paid') where.paymentStatus = 'paid'
  else if (paymentFilter === 'wave') where.paymentMethod = 'wave'
  if (statusFilter && statusFilter !== 'all') where.status = statusFilter
  if (paymentFilter === 'confirmed') { delete where.paymentStatus; where.status = 'confirmed' }
  return prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, accent, accentRgb, card, cardBorder, text, textMuted,
  trend,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  accent: string
  accentRgb: string
  card: string
  cardBorder: string
  text: string
  textMuted: string
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' } | null
}) {
  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden transition-all"
      style={{ background: card, border: `1px solid ${cardBorder}` }}
    >
      {/* Subtle glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 0%, rgba(${accentRgb},0.08) 0%, transparent 60%)` }}
      />

      {/* Icon + trend */}
      <div className="relative flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `rgba(${accentRgb},0.12)`, color: accent }}
        >
          {icon}
        </div>
        {trend !== null && trend !== undefined && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={trend.direction === 'up'
              ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80' }
              : trend.direction === 'down'
              ? { background: 'rgba(248,113,113,0.15)', color: '#f87171' }
              : { background: 'rgba(163,163,163,0.15)', color: '#a3a3a3' }}
          >
            {trend.direction === 'up' ? '▲' : trend.direction === 'down' ? '▼' : '–'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Value + label */}
      <div className="relative">
        <p className="font-serif text-2xl font-bold leading-tight" style={{ color: text }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: textMuted }}>{label}</p>
        {sub && <p className="text-[10px] mt-1" style={{ color: `rgba(${accentRgb},0.5)` }}>{sub}</p>}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { key?: string; filter?: string; status?: string; confirmed?: string; _theme?: string }
}) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  const isAuth = searchParams.key === adminPassword
  const adminTheme = (searchParams._theme === 'light' ? 'light' : 'dark') as 'dark' | 'light'
  const t = THEMES[adminTheme]

  const paymentFilter = searchParams.filter ?? 'all'
  const statusFilter  = searchParams.status  ?? 'all'

  const [stats, recentStats, orders] = isAuth
    ? await Promise.all([getStats(), getRecentStats(), getOrders(paymentFilter, statusFilter)])
    : [
        { total: 0, revenue: 0, pending: 0, confirmed: 0 },
        { todayCount: 0, yesterdayCount: 0, weekRevenue: 0, revTrend: null, awaitingDelivery: 0, waveRate: 0 },
        [],
      ]

  const todayTrend = recentStats.yesterdayCount > 0
    ? {
        value: Math.round(((recentStats.todayCount - recentStats.yesterdayCount) / recentStats.yesterdayCount) * 100),
        direction: recentStats.todayCount >= recentStats.yesterdayCount ? 'up' as const : 'down' as const,
      }
    : null

  const STAT_CARDS_ROW1 = [
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      label: 'Commandes total',
      value: stats.total,
      trend: null as null,
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: 'Revenu encaissé',
      value: `${stats.revenue.toLocaleString('fr-FR')} FCFA`,
      trend: null as null,
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: 'En attente paiement',
      value: stats.pending,
      trend: null as null,
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: 'Confirmées',
      value: stats.confirmed,
      trend: null as null,
    },
  ]

  const STAT_CARDS_ROW2 = [
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      label: "Commandes aujourd'hui",
      value: recentStats.todayCount,
      sub: 'depuis minuit',
      trend: todayTrend,
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      label: 'Revenus 7 jours',
      value: `${recentStats.weekRevenue.toLocaleString('fr-FR')} FCFA`,
      sub: 'commandes payées',
      trend: recentStats.revTrend !== null ? { value: recentStats.revTrend, direction: (recentStats.revTrend >= 0 ? 'up' : 'down') as 'up' | 'down' } : null,
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
      label: 'En attente livraison',
      value: recentStats.awaitingDelivery,
      sub: 'confirmées + expédiées',
      trend: null as null,
    },
    {
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      label: 'Taux Wave (payés)',
      value: `${recentStats.waveRate}%`,
      sub: 'des paiements digitaux',
      trend: null as null,
    },
  ]

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin" theme={adminTheme}>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">

        {/* ── Confirmation toast ─────────────────────────────────────── */}
        {searchParams.confirmed && (
          <div className="rounded-2xl px-5 py-3.5 flex items-center gap-3"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold text-sm">
                Commande <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(74,222,128,0.15)' }}>{searchParams.confirmed}</code> confirmée !
              </p>
              <p className="text-xs opacity-70">Le client a été notifié par WhatsApp.</p>
            </div>
          </div>
        )}

        {/* ── Page header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold" style={{ color: t.text }}>Commandes</h1>
            <p className="text-sm mt-0.5" style={{ color: t.textMuted }}>Gestion et suivi des commandes</p>
          </div>
          <div className="flex items-center gap-3">
            {isAuth && <ExportButton adminKey={searchParams.key ?? ''} />}
            <Link
              href={`/admin/pos?key=${adminPassword}&_theme=${adminTheme}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: t.accent, color: '#fff' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle vente
            </Link>
          </div>
        </div>

        {/* ── Stat cards row 1 ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS_ROW1.map(card => (
            <StatCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              trend={card.trend}
              accent={t.accent}
              accentRgb={t.accentRgb}
              card={t.card}
              cardBorder={t.cardBorder}
              text={t.text}
              textMuted={t.textMuted}
            />
          ))}
        </div>

        {/* ── Stat cards row 2 (recent) ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS_ROW2.map(card => (
            <StatCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              sub={card.sub}
              trend={card.trend}
              accent={t.accent}
              accentRgb={t.accentRgb}
              card={t.card}
              cardBorder={t.cardBorder}
              text={t.text}
              textMuted={t.textMuted}
            />
          ))}
        </div>

        {/* ── Orders table (client component with search) ─────────────── */}
        <AdminOrdersClient
          orders={orders.map(o => ({
            id: o.id,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            address: o.address ?? null,
            totalAmount: o.totalAmount,
            currency: o.currency,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            status: o.status,
            whatsappSent: o.whatsappSent,
            createdAt: o.createdAt.toISOString(),
            items: o.items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
              product: { name: item.product.name },
            })),
          }))}
          theme={adminTheme}
          adminKey={searchParams.key ?? ''}
          paymentFilter={paymentFilter}
          statusFilter={statusFilter}
          adminPassword={adminPassword}
        />
      </div>
    </AdminShell>
  )
}
