import AdminShell from '@/components/AdminShell'
import { prisma } from '@/lib/prisma'
import { BroadcastForm } from './BroadcastForm'

export const dynamic = 'force-dynamic'

export default async function BroadcastPage({
  searchParams,
}: {
  searchParams: { key?: string }
}) {
  // Stats for display
  const [totalPaid, totalSN, totalFR, totalWholesale] = await Promise.all([
    prisma.order.groupBy({ by: ['customerPhone'], where: { paymentStatus: 'paid' } }).then(r => r.length),
    prisma.order.groupBy({ by: ['customerPhone'], where: { paymentStatus: 'paid', country: 'SN' } }).then(r => r.length),
    prisma.order.groupBy({ by: ['customerPhone'], where: { paymentStatus: 'paid', country: 'FR' } }).then(r => r.length),
    prisma.order.groupBy({ by: ['customerPhone'], where: { paymentStatus: 'paid', isWholesale: true } }).then(r => r.length),
  ])

  return (
    <AdminShell adminKey={searchParams.key} currentPath="/admin/broadcast">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-rose-wine mb-1">📣 Broadcast WhatsApp</h1>
          <p className="text-rose-muted text-sm">Envoyez un message personnalisé à vos clients via WaSenderAPI</p>
        </div>

        {/* Audience stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Tous les clients', count: totalPaid, emoji: '🌍' },
            { label: 'Sénégal', count: totalSN, emoji: '🇸🇳' },
            { label: 'France', count: totalFR, emoji: '🇫🇷' },
            { label: 'Grossistes', count: totalWholesale, emoji: '💼' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-rose-petal p-4 text-center">
              <p className="text-2xl mb-1">{s.emoji}</p>
              <p className="font-serif text-xl font-bold text-rose-wine">{s.count}</p>
              <p className="text-xs text-rose-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6 text-sm text-yellow-800">
          ⚠️ <strong>Important :</strong> Les messages WhatsApp sont envoyés un par un (1/seconde). N&apos;utilisez cette fonctionnalité que pour des communications légitimes à vos clients ayant commandé.
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-rose-petal p-6">
          <BroadcastForm adminKey={searchParams.key ?? ''} />
        </div>
      </div>
    </AdminShell>
  )
}
