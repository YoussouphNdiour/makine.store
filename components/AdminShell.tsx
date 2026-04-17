import Link from 'next/link'

const TABS = [
  { href: '/admin/dashboard',    label: '📊 Dashboard' },
  { href: '/admin',              label: '📋 Commandes' },
  { href: '/admin/comptabilite', label: '💰 Comptabilité' },
  { href: '/admin/clients',      label: '👥 Clients' },
  { href: '/admin/products',     label: '📦 Produits' },
  { href: '/admin/pos',          label: '🛒 POS Caisse' },
  { href: '/admin/broadcast',    label: '📣 Broadcast WA' },
]

type Props = {
  adminKey: string | undefined
  /** Pathname like '/admin', '/admin/dashboard', '/admin/clients', etc. */
  currentPath: string
  children: React.ReactNode
}

export default function AdminShell({ adminKey, currentPath, children }: Props) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'

  if (adminKey !== adminPassword) {
    return (
      <main className="min-h-screen bg-rose-snow flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-rose-card max-w-sm w-full text-center border border-rose-petal">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="font-serif text-2xl font-bold mb-2 text-rose-wine">Dashboard Makiné</h1>
          <p className="text-sm text-rose-muted mb-6">Accès réservé à l&apos;équipe Makiné</p>
          <form method="get">
            <input
              type="password"
              name="key"
              placeholder="Mot de passe admin"
              autoFocus
              className="w-full border border-rose-blush rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-deep mb-3 transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-rose-deep text-white py-3 rounded-xl font-medium hover:bg-rose-wine transition-colors"
            >
              Accéder →
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-rose-wine text-white sticky top-0 z-10 shadow-rose-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg text-rose-blush">Makiné</span>
            <span className="text-white/40 text-xs">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/221710581711"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-300 hover:text-green-200 hidden sm:block"
            >
              WhatsApp +221 71 058 17 11
            </a>
            <Link href="/v2" className="text-xs text-white/50 hover:text-white transition-colors">
              ← Site
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-px">
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={`${tab.href}?key=${adminPassword}`}
              className={`flex-none px-4 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                currentPath === tab.href
                  ? 'bg-white text-rose-wine font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>
      {children}
    </main>
  )
}
