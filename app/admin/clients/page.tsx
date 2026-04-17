import { prisma } from '@/lib/prisma'
import AdminShell from '@/components/AdminShell'

export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type Customer = {
  phone: string
  name: string
  email?: string
  country: string
  totalOrders: number
  totalSpentXOF: number
  totalSpentEUR: number
  lastOrderDate: Date
  isWholesale: boolean
  orderIds: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countryFlag(country: string) {
  if (country === 'SN') return '🇸🇳'
  if (country === 'FR') return '🇫🇷'
  if (country === 'CI') return '🇨🇮'
  if (country === 'BJ') return '🇧🇯'
  if (country === 'ML') return '🇲🇱'
  if (country === 'GN') return '🇬🇳'
  if (country === 'MA') return '🇲🇦'
  if (country === 'BE') return '🇧🇪'
  if (country === 'CH') return '🇨🇭'
  if (country === 'CA') return '🇨🇦'
  if (country === 'US') return '🇺🇸'
  return '🌍'
}

const stateEmoji: Record<string, string> = {
  shopping_cart: '🛒',
  checkout: '💳',
  idle: '😴',
  greeting: '👋',
  asking_name: '📝',
  asking_phone: '📞',
  asking_address: '📍',
  payment: '💰',
  confirmed: '✅',
}

function getStateEmoji(state: string) {
  return stateEmoji[state] ?? '💬'
}

function isActiveSession(state: string) {
  return !['idle'].includes(state)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { key?: string; q?: string; section?: string }
}) {
  // ── Data fetching ──────────────────────────────────────────────────────────
  const allOrders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  // Build customer map grouped by phone
  const customerMap = new Map<string, Customer>()
  for (const order of allOrders) {
    const existing = customerMap.get(order.customerPhone)
    if (existing) {
      existing.totalOrders++
      if (order.currency === 'XOF' && order.paymentStatus === 'paid')
        existing.totalSpentXOF += order.totalAmount
      if (order.currency === 'EUR' && order.paymentStatus === 'paid')
        existing.totalSpentEUR += order.totalAmount
      if (order.createdAt > existing.lastOrderDate)
        existing.lastOrderDate = order.createdAt
      if (order.isWholesale) existing.isWholesale = true
      existing.orderIds.push(order.id)
    } else {
      customerMap.set(order.customerPhone, {
        phone: order.customerPhone,
        name: order.customerName,
        email: order.customerEmail ?? undefined,
        country: order.country,
        totalOrders: 1,
        totalSpentXOF:
          order.currency === 'XOF' && order.paymentStatus === 'paid'
            ? order.totalAmount
            : 0,
        totalSpentEUR:
          order.currency === 'EUR' && order.paymentStatus === 'paid'
            ? order.totalAmount
            : 0,
        lastOrderDate: order.createdAt,
        isWholesale: order.isWholesale,
        orderIds: [order.id],
      })
    }
  }

  const sessions = await prisma.whatsappSession.findMany({
    orderBy: { lastMsg: 'desc' },
  })

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  let customers = Array.from(customerMap.values()).sort(
    (a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime()
  )

  // Apply search filter
  const q = searchParams.q?.toLowerCase()
  if (q) {
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q)
    )
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalUnique = customerMap.size
  const totalWholesale = Array.from(customerMap.values()).filter(
    (c) => c.isWholesale
  ).length
  const activeSessions = sessions.filter((s) => isActiveSession(s.state))

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin/clients">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl font-bold text-rose-wine">Clients</h1>
            <p className="text-rose-muted text-sm">
              {customers.length} client{customers.length !== 1 ? 's' : ''} unique{customers.length !== 1 ? 's' : ''}
              {q && <span className="ml-1 text-rose-deep">· filtre : &quot;{searchParams.q}&quot;</span>}
            </p>
          </div>
        </div>

        {/* ── Section 1: Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Clients uniques',
              value: totalUnique,
              sub: 'depuis les commandes',
              color: 'text-rose-wine',
            },
            {
              label: 'Clients grossistes',
              value: totalWholesale,
              sub: 'commandes en gros',
              color: 'text-rose-deep',
            },
            {
              label: 'Abonnés newsletter',
              value: subscribers.length,
              sub: 'inscrits par email',
              color: 'text-rose-medium',
            },
            {
              label: 'Sessions WA actives',
              value: activeSessions.length,
              sub: `sur ${sessions.length} total`,
              color: 'text-green-600',
            },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-5 shadow-sm border border-rose-petal"
            >
              <p className="text-xs text-rose-muted mb-1">{label}</p>
              <p className={`font-serif text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-rose-muted/60 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Section 2: Search bar ── */}
        <form method="get" className="flex gap-2 mb-6">
          <input type="hidden" name="key" value={searchParams.key ?? ''} />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Rechercher par nom, téléphone ou email…"
            className="flex-1 border border-rose-blush rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-deep"
          />
          <button
            type="submit"
            className="bg-rose-deep text-white px-4 py-2 rounded-xl text-sm"
          >
            Rechercher
          </button>
          {q && (
            <a
              href={`?key=${searchParams.key ?? ''}`}
              className="border border-rose-blush text-rose-muted px-4 py-2 rounded-xl text-sm hover:bg-rose-snow transition-colors"
            >
              Effacer
            </a>
          )}
        </form>

        {/* ── Section 3: Customers table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-rose-petal overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-rose-petal flex items-center justify-between">
            <h2 className="font-serif font-semibold text-rose-wine text-lg">
              Clients ({customers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-rose-snow text-xs uppercase tracking-wide text-rose-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Client</th>
                  <th className="text-left px-4 py-3 font-semibold">Téléphone</th>
                  <th className="text-left px-4 py-3 font-semibold">Pays</th>
                  <th className="text-center px-4 py-3 font-semibold">Commandes</th>
                  <th className="text-right px-4 py-3 font-semibold">CA Total</th>
                  <th className="text-center px-4 py-3 font-semibold">Gros ?</th>
                  <th className="text-left px-4 py-3 font-semibold">Dernière commande</th>
                  <th className="text-center px-4 py-3 font-semibold">WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-petal/40">
                {customers.map((c, i) => {
                  const session = sessions.find(
                    (s) =>
                      s.phone === c.phone ||
                      s.customerPhone === c.phone
                  )
                  const isActive = session ? isActiveSession(session.state) : false
                  const rowBg = i % 2 === 0 ? 'bg-white' : 'bg-rose-snow/30'

                  return (
                    <tr key={c.phone} className={`${rowBg} hover:bg-rose-blush/10 transition-colors`}>
                      {/* Rang */}
                      <td className="px-4 py-3 text-rose-muted text-xs font-mono">
                        {i + 1}
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-rose-text leading-tight">{c.name}</p>
                        {c.email && (
                          <p className="text-xs text-rose-muted truncate max-w-[160px]">{c.email}</p>
                        )}
                      </td>

                      {/* Téléphone */}
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-rose-deep hover:text-rose-wine font-mono underline-offset-2 hover:underline"
                        >
                          {c.phone}
                        </a>
                      </td>

                      {/* Pays */}
                      <td className="px-4 py-3 text-sm">
                        <span className="mr-1">{countryFlag(c.country)}</span>
                        <span className="text-rose-muted text-xs">{c.country}</span>
                      </td>

                      {/* Commandes */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-petal text-rose-wine text-xs font-bold">
                          {c.totalOrders}
                        </span>
                      </td>

                      {/* CA Total */}
                      <td className="px-4 py-3 text-right">
                        {c.totalSpentXOF > 0 && (
                          <p className="font-semibold text-rose-wine text-xs whitespace-nowrap">
                            {c.totalSpentXOF.toLocaleString('fr-FR')}{' '}
                            <span className="font-normal text-rose-muted">FCFA</span>
                          </p>
                        )}
                        {c.totalSpentEUR > 0 && (
                          <p className="font-semibold text-rose-medium text-xs whitespace-nowrap">
                            {c.totalSpentEUR.toLocaleString('fr-FR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            <span className="font-normal text-rose-muted">€</span>
                          </p>
                        )}
                        {c.totalSpentXOF === 0 && c.totalSpentEUR === 0 && (
                          <span className="text-xs text-rose-muted">—</span>
                        )}
                      </td>

                      {/* Gros */}
                      <td className="px-4 py-3 text-center text-base">
                        {c.isWholesale ? (
                          <span title="Grossiste">💼</span>
                        ) : (
                          <span className="text-rose-muted text-xs">—</span>
                        )}
                      </td>

                      {/* Dernière commande */}
                      <td className="px-4 py-3 text-xs text-rose-muted whitespace-nowrap">
                        {c.lastOrderDate.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </td>

                      {/* WA session */}
                      <td className="px-4 py-3 text-center">
                        {session ? (
                          <span
                            title={`État : ${session.state}`}
                            className="inline-flex items-center gap-1 text-xs"
                          >
                            <span
                              className={`w-2 h-2 rounded-full inline-block ${
                                isActive ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                            <span className="hidden sm:inline text-rose-muted">
                              {getStateEmoji(session.state)}
                            </span>
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full inline-block bg-gray-200" title="Pas de session" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {customers.length === 0 && (
              <div className="text-center py-16 text-rose-muted">
                <p className="text-4xl mb-4">🔍</p>
                <p>Aucun client trouvé pour cette recherche.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 4: Newsletter subscribers ── */}
        <details className="mb-10 group">
          <summary className="cursor-pointer select-none bg-white rounded-2xl px-6 py-4 shadow-sm border border-rose-petal flex items-center justify-between list-none group-open:rounded-b-none">
            <h2 className="font-serif font-semibold text-rose-wine text-lg">
              Abonnés newsletter
              <span className="ml-2 text-sm font-normal text-rose-muted bg-rose-snow px-2 py-0.5 rounded-full">
                {subscribers.length}
              </span>
            </h2>
            <span className="text-rose-muted text-sm group-open:rotate-180 transition-transform inline-block">▼</span>
          </summary>
          <div className="bg-white border-x border-b border-rose-petal rounded-b-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-rose-snow text-xs uppercase tracking-wide text-rose-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">#</th>
                    <th className="text-left px-4 py-3 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 font-semibold">Pays</th>
                    <th className="text-left px-4 py-3 font-semibold">Date d&apos;inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-petal/40">
                  {subscribers.map((sub, i) => (
                    <tr
                      key={sub.id}
                      className={`${i % 2 === 0 ? 'bg-white' : 'bg-rose-snow/30'} hover:bg-rose-blush/10 transition-colors`}
                    >
                      <td className="px-4 py-3 text-xs text-rose-muted font-mono">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-rose-text">{sub.email}</td>
                      <td className="px-4 py-3 text-sm">
                        {sub.country ? (
                          <>
                            <span className="mr-1">{countryFlag(sub.country)}</span>
                            <span className="text-rose-muted text-xs">{sub.country}</span>
                          </>
                        ) : (
                          <span className="text-rose-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-rose-muted">
                        {sub.createdAt.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-rose-muted">
                        Aucun abonné pour l&apos;instant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* ── Section 5: Active WhatsApp sessions ── */}
        <details className="mb-10 group">
          <summary className="cursor-pointer select-none bg-white rounded-2xl px-6 py-4 shadow-sm border border-rose-petal flex items-center justify-between list-none group-open:rounded-b-none">
            <h2 className="font-serif font-semibold text-rose-wine text-lg">
              Sessions WhatsApp
              <span className="ml-2 text-sm font-normal text-rose-muted bg-rose-snow px-2 py-0.5 rounded-full">
                {activeSessions.length} actives / {sessions.length} total
              </span>
            </h2>
            <span className="text-rose-muted text-sm group-open:rotate-180 transition-transform inline-block">▼</span>
          </summary>
          <div className="bg-white border-x border-b border-rose-petal rounded-b-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-rose-snow text-xs uppercase tracking-wide text-rose-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Téléphone</th>
                    <th className="text-left px-4 py-3 font-semibold">Nom</th>
                    <th className="text-left px-4 py-3 font-semibold">État</th>
                    <th className="text-left px-4 py-3 font-semibold">Pays</th>
                    <th className="text-left px-4 py-3 font-semibold">Dernier message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-petal/40">
                  {sessions.map((s, i) => {
                    const active = isActiveSession(s.state)
                    return (
                      <tr
                        key={s.id}
                        className={`${i % 2 === 0 ? 'bg-white' : 'bg-rose-snow/30'} hover:bg-rose-blush/10 transition-colors`}
                      >
                        {/* Téléphone */}
                        <td className="px-4 py-3">
                          <a
                            href={`https://wa.me/${s.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-rose-deep hover:text-rose-wine font-mono"
                          >
                            {s.phone}
                          </a>
                        </td>

                        {/* Nom */}
                        <td className="px-4 py-3 text-rose-text">
                          {s.customerName ?? (
                            <span className="text-rose-muted text-xs italic">Inconnu</span>
                          )}
                        </td>

                        {/* État */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                              active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full inline-block ${
                                active ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                            {getStateEmoji(s.state)} {s.state}
                          </span>
                        </td>

                        {/* Pays */}
                        <td className="px-4 py-3 text-sm">
                          <span className="mr-1">{countryFlag(s.country)}</span>
                          <span className="text-rose-muted text-xs">{s.country}</span>
                        </td>

                        {/* Dernier message */}
                        <td className="px-4 py-3 text-xs text-rose-muted whitespace-nowrap">
                          {s.lastMsg.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}
                          {' '}
                          {s.lastMsg.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    )
                  })}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-rose-muted">
                        Aucune session WhatsApp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </details>

      </div>
    </AdminShell>
  )
}
