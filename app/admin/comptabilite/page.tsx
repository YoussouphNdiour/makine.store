import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AdminShell from '@/components/AdminShell'

export const dynamic = 'force-dynamic'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function formatXOF(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function formatEUR(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function periodLabel(month: number, year: number) {
  return `${MONTHS_FR[month - 1]} ${year}`
}

function prevMonth(month: number, year: number) {
  if (month === 1) return { month: 12, year: year - 1 }
  return { month: month - 1, year }
}

function nextMonth(month: number, year: number) {
  if (month === 12) return { month: 1, year: year + 1 }
  return { month: month + 1, year }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ComptabilitePage({
  searchParams,
}: {
  searchParams: { key?: string; month?: string; year?: string ; _theme?: string }
}) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  const adminTheme = (searchParams._theme === 'light' ? 'light' : 'dark') as 'dark' | 'light'
  const isAuth = searchParams.key === adminPassword

  const now = new Date()
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1))
  const year = parseInt(searchParams.year ?? String(now.getFullYear()))

  // Build prev/next month navigation URLs
  const prev = prevMonth(month, year)
  const next = nextMonth(month, year)
  const navBase = (m: number, y: number) =>
    `/admin/comptabilite?key=${searchParams.key ?? ''}&month=${m}&year=${y}`

  if (!isAuth) {
    return (
      <AdminShell adminKey={searchParams.key} currentPath="/admin/comptabilite" theme={adminTheme}>
        <div />
      </AdminShell>
    )
  }

  // ── Date range for selected period ──────────────────────────────────────────
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59)

  // ── Previous period (for growth calculation) ────────────────────────────────
  const prevPeriod = prevMonth(month, year)
  const startOfPrev = new Date(prevPeriod.year, prevPeriod.month - 1, 1)
  const endOfPrev = new Date(prevPeriod.year, prevPeriod.month, 0, 23, 59, 59)

  // ── Queries ─────────────────────────────────────────────────────────────────
  const [paidOrders, last12Raw] = await Promise.all([
    // Section 2, 3, 5: current month paid orders
    prisma.order.findMany({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        paymentStatus: 'paid',
        status: { not: 'cancelled' },
      },
      include: { items: { include: { product: true } } },
    }),
    // Section 4: last 12 months, paid & not cancelled
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(year - 1, month - 1, 1), // 12 months back
          lte: endOfMonth,
        },
        paymentStatus: 'paid',
        status: { not: 'cancelled' },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        currency: true,
      },
    }),
  ])

  // ── Section 2: Summary cards ─────────────────────────────────────────────────
  const xofOrders = paidOrders.filter(o => o.currency === 'XOF')
  const eurOrders = paidOrders.filter(o => o.currency === 'EUR')
  const caXOF = xofOrders.reduce((s, o) => s + o.totalAmount, 0)
  const caEUR = eurOrders.reduce((s, o) => s + o.totalAmount, 0)
  const nbOrders = paidOrders.length
  const panierMoyenXOF = xofOrders.length > 0 ? caXOF / xofOrders.length : 0
  const nbWholesale = paidOrders.filter(o => o.isWholesale).length

  // ── Section 3: Revenue by payment method ─────────────────────────────────────
  const methodMap: Record<string, { nb: number; xof: number; eur: number }> = {}
  for (const o of paidOrders) {
    const key = o.paymentMethod
    if (!methodMap[key]) methodMap[key] = { nb: 0, xof: 0, eur: 0 }
    methodMap[key].nb += 1
    if (o.currency === 'XOF') methodMap[key].xof += o.totalAmount
    else if (o.currency === 'EUR') methodMap[key].eur += o.totalAmount
  }
  const methodRows = Object.entries(methodMap).sort((a, b) => b[1].nb - a[1].nb)

  // ── Section 4: Last 12 months table ──────────────────────────────────────────
  type MonthBucket = { label: string; month: number; year: number; nb: number; xof: number; eur: number }
  const buckets = new Map<string, MonthBucket>()

  for (const o of last12Raw) {
    const d = new Date(o.createdAt)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const key = `${y}-${String(m).padStart(2, '0')}`
    if (!buckets.has(key)) {
      buckets.set(key, { label: periodLabel(m, y), month: m, year: y, nb: 0, xof: 0, eur: 0 })
    }
    const b = buckets.get(key)!
    b.nb += 1
    if (o.currency === 'XOF') b.xof += o.totalAmount
    else if (o.currency === 'EUR') b.eur += o.totalAmount
  }

  // Sort descending (most recent first), take last 12
  const monthRows: (MonthBucket & { growth: number | null })[] = Array.from(buckets.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12)
    .map((entry, idx, arr) => {
      const curr = entry[1]
      const prevBucket = arr[idx + 1]?.[1]
      let growth: number | null = null
      if (prevBucket && prevBucket.xof > 0) {
        growth = Math.round(((curr.xof - prevBucket.xof) / prevBucket.xof) * 100)
      }
      return { ...curr, growth }
    })

  // ── Section 5: Top clients ────────────────────────────────────────────────────
  const clientMap: Record<string, { name: string; phone: string; nb: number; total: number }> = {}
  for (const o of paidOrders) {
    const k = o.customerPhone
    if (!clientMap[k]) clientMap[k] = { name: o.customerName, phone: o.customerPhone, nb: 0, total: 0 }
    clientMap[k].nb += 1
    clientMap[k].total += o.currency === 'XOF' ? o.totalAmount : 0
  }
  const topClients = Object.values(clientMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // ── Previous month XOF for growth context in cards ──────────────────────────
  const prevMonthOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfPrev, lte: endOfPrev },
      paymentStatus: 'paid',
      status: { not: 'cancelled' },
      currency: 'XOF',
    },
    select: { totalAmount: true },
  })
  const prevCaXOF = prevMonthOrders.reduce((s, o) => s + o.totalAmount, 0)
  const caGrowth = prevCaXOF > 0 ? Math.round(((caXOF - prevCaXOF) / prevCaXOF) * 100) : null

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin/comptabilite" theme={adminTheme}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ── Header + period selector ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-rose-wine">Comptabilité</h1>
            <p className="text-sm text-rose-muted mt-0.5">Analyse financière par période</p>
          </div>

          {/* Period navigation */}
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-2 shadow-sm border border-rose-petal">
            <Link
              href={navBase(prev.month, prev.year)}
              className="text-rose-muted hover:text-rose-wine transition-colors p-1 rounded-lg hover:bg-rose-snow"
              aria-label="Mois précédent"
            >
              ‹
            </Link>
            <span className="font-serif font-semibold text-rose-wine text-sm min-w-[120px] text-center">
              {periodLabel(month, year)}
            </span>
            <Link
              href={navBase(next.month, next.year)}
              className="text-rose-muted hover:text-rose-wine transition-colors p-1 rounded-lg hover:bg-rose-snow"
              aria-label="Mois suivant"
            >
              ›
            </Link>
          </div>
        </div>

        {/* ── Section 2: Summary cards ──────────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-rose-muted mb-3">
            Résumé — {periodLabel(month, year)}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* CA XOF */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-petal col-span-2 lg:col-span-1">
              <p className="text-xs text-rose-muted mb-1">Chiffre d&apos;affaires XOF</p>
              <p className="font-serif text-xl font-bold text-rose-wine">
                {caXOF.toLocaleString('fr-FR')}
              </p>
              <p className="text-xs text-rose-muted">FCFA</p>
              {caGrowth !== null && (
                <p className={`text-xs font-medium mt-1 ${caGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {caGrowth >= 0 ? '↑' : '↓'} {Math.abs(caGrowth)}% vs mois préc.
                </p>
              )}
            </div>

            {/* CA EUR */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-petal">
              <p className="text-xs text-rose-muted mb-1">Chiffre d&apos;affaires EUR</p>
              <p className="font-serif text-xl font-bold text-rose-wine">
                {caEUR.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-rose-muted">Euro</p>
            </div>

            {/* Nb commandes */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-petal">
              <p className="text-xs text-rose-muted mb-1">Commandes payées</p>
              <p className="font-serif text-xl font-bold text-rose-deep">{nbOrders}</p>
              <p className="text-xs text-rose-muted">commandes</p>
            </div>

            {/* Panier moyen */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-petal">
              <p className="text-xs text-rose-muted mb-1">Panier moyen XOF</p>
              <p className="font-serif text-xl font-bold text-rose-wine">
                {Math.round(panierMoyenXOF).toLocaleString('fr-FR')}
              </p>
              <p className="text-xs text-rose-muted">FCFA / commande</p>
            </div>

            {/* Commandes gros */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-petal">
              <p className="text-xs text-rose-muted mb-1">Commandes grossiste</p>
              <p className="font-serif text-xl font-bold text-rose-medium">{nbWholesale}</p>
              <p className="text-xs text-rose-muted">commandes gros</p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Revenue by payment method ─────────────────────────── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-rose-muted mb-3">
            Revenus par mode de paiement
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-rose-petal overflow-hidden">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-rose-snow border-b border-rose-petal">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    Méthode
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    Nb commandes
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    Montant XOF
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    Montant EUR
                  </th>
                </tr>
              </thead>
              <tbody>
                {methodRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-rose-muted text-sm">
                      Aucune commande payée ce mois-ci
                    </td>
                  </tr>
                ) : (
                  methodRows.map(([method, data], idx) => (
                    <tr
                      key={method}
                      className={idx % 2 === 1 ? 'bg-rose-snow/50' : 'bg-white'}
                    >
                      <td className="px-5 py-3 font-medium text-rose-wine capitalize">
                        {method}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">
                        {data.nb}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">
                        {data.xof > 0 ? data.xof.toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">
                        {data.eur > 0
                          ? data.eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {methodRows.length > 0 && (
                <tfoot>
                  <tr className="bg-rose-snow border-t border-rose-petal font-semibold">
                    <td className="px-5 py-3 text-rose-wine">Total</td>
                    <td className="px-5 py-3 text-right tabular-nums text-rose-wine">{nbOrders}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-rose-wine">
                      {caXOF > 0 ? caXOF.toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-rose-wine">
                      {caEUR > 0
                        ? caEUR.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : '—'}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ── Section 4: Last 12 months ─────────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-rose-muted mb-3">
            Évolution — 12 derniers mois
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-rose-petal overflow-hidden">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-rose-snow border-b border-rose-petal">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    Mois
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    Commandes
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    CA XOF
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    CA EUR
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                    Croissance
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-rose-muted text-sm">
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : (
                  monthRows.map((row, idx) => {
                    const isCurrent = row.month === month && row.year === year
                    return (
                      <tr
                        key={`${row.year}-${row.month}`}
                        className={`${idx % 2 === 1 ? 'bg-rose-snow/50' : 'bg-white'} ${isCurrent ? 'ring-1 ring-inset ring-rose-petal' : ''}`}
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={navBase(row.month, row.year)}
                            className={`font-medium hover:text-rose-deep transition-colors ${isCurrent ? 'text-rose-wine font-semibold' : 'text-gray-700'}`}
                          >
                            {row.label}
                            {isCurrent && (
                              <span className="ml-2 text-xs bg-rose-blush text-rose-wine px-1.5 py-0.5 rounded-full">
                                actuel
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                          {row.nb}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                          {row.xof > 0 ? row.xof.toLocaleString('fr-FR') : '—'}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                          {row.eur > 0
                            ? row.eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {row.growth === null ? (
                            <span className="text-gray-300 text-xs">—</span>
                          ) : (
                            <span
                              className={`text-xs font-semibold ${
                                row.growth > 0
                                  ? 'text-green-600'
                                  : row.growth < 0
                                  ? 'text-red-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              {row.growth > 0 ? '+' : ''}{row.growth}%
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 5: Top clients du mois ────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-rose-muted mb-3">
            Top clients — {periodLabel(month, year)}
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-rose-petal overflow-hidden">
            {topClients.length === 0 ? (
              <p className="text-center py-8 text-rose-muted text-sm">
                Aucun client ce mois-ci
              </p>
            ) : (
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="bg-rose-snow border-b border-rose-petal">
                    <th className="text-center px-4 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide w-12">
                      #
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                      Client
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                      Téléphone
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                      Commandes
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-rose-wine uppercase tracking-wide">
                      Total XOF
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((c, idx) => (
                    <tr
                      key={c.phone}
                      className={idx % 2 === 1 ? 'bg-rose-snow/50' : 'bg-white'}
                    >
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                          ${idx === 0 ? 'bg-yellow-100 text-yellow-700'
                          : idx === 1 ? 'bg-gray-100 text-gray-600'
                          : idx === 2 ? 'bg-orange-50 text-orange-600'
                          : 'bg-rose-snow text-rose-muted'}`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                      <td className="px-5 py-3">
                        <a
                          href={`tel:${c.phone}`}
                          className="text-rose-medium hover:text-rose-deep transition-colors text-xs font-mono"
                        >
                          {c.phone}
                        </a>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">{c.nb}</td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold text-rose-wine">
                        {c.total > 0 ? c.total.toLocaleString('fr-FR') + ' FCFA' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Section 6: Export buttons ──────────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-rose-muted mb-3">
            Exports CSV
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/api/admin/export?key=${searchParams.key ?? ''}`}
              download="commandes-makine-all.csv"
              className="inline-flex items-center gap-2 bg-white border border-rose-petal text-rose-wine text-sm font-medium px-5 py-3 rounded-xl hover:bg-rose-snow hover:border-rose-blush transition-colors shadow-sm"
            >
              <span>⬇</span>
              Toutes les commandes
            </a>
            <a
              href={`/api/admin/export?key=${searchParams.key ?? ''}&month=${month}&year=${year}`}
              download={`commandes-makine-${MONTHS_FR[month - 1].toLowerCase()}-${year}.csv`}
              className="inline-flex items-center gap-2 bg-rose-wine text-white text-sm font-medium px-5 py-3 rounded-xl hover:bg-rose-deep transition-colors shadow-sm"
            >
              <span>⬇</span>
              {periodLabel(month, year)} uniquement
            </a>
          </div>
          <p className="text-xs text-rose-muted mt-2">
            L&apos;export par période inclut toutes les commandes (tout statut, tout mode de paiement) pour le mois sélectionné.
          </p>
        </div>

      </div>
    </AdminShell>
  )
}
