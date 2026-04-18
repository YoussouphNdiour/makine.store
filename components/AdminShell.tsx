import Link from 'next/link'
import Image from 'next/image'

const TABS = [
  { href: '/admin/dashboard',    label: 'Dashboard',     icon: '📊' },
  { href: '/admin',              label: 'Commandes',     icon: '📋' },
  { href: '/admin/comptabilite', label: 'Comptabilité',  icon: '💰' },
  { href: '/admin/clients',      label: 'Clients',       icon: '👥' },
  { href: '/admin/products',     label: 'Produits',      icon: '📦' },
  { href: '/admin/pos',          label: 'POS Caisse',    icon: '🛒' },
  { href: '/admin/broadcast',    label: 'Broadcast WA',  icon: '📣' },
]

type Props = {
  adminKey: string | undefined
  currentPath: string
  children: React.ReactNode
}

export default function AdminShell({ adminKey, currentPath, children }: Props) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'

  if (adminKey !== adminPassword) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#06060e' }}>
        {/* Gold glow behind card */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(212,169,106,0.08)_0%,transparent_60%)]" />
        <div
          className="relative rounded-2xl p-8 max-w-sm w-full text-center border border-white/8"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-1 ring-yellow-500/30">
              <Image src="/images/lolo/logo.png" alt="Makiné" fill className="object-cover" />
            </div>
          </div>
          <h1 className="font-serif text-2xl font-bold mb-1 text-white">Dashboard Makiné</h1>
          <p className="text-sm mb-6" style={{ color: '#8a8498' }}>Accès réservé à l&apos;équipe</p>
          <form method="get">
            <input
              type="password"
              name="key"
              placeholder="Mot de passe admin"
              autoFocus
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none mb-3 transition-colors text-white placeholder-white/30"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg, #d4a96a, #9a7040)',
                color: '#06060e',
              }}
            >
              Accéder →
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#06060e', color: '#f0ede8' }}>
      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r sticky top-0 h-screen"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1" style={{ '--tw-ring-color': 'rgba(212,169,106,0.3)' } as React.CSSProperties}>
            <Image src="/images/lolo/logo.png" alt="Makiné" fill className="object-cover" />
          </div>
          <div>
            <p className="font-serif text-sm font-bold text-white">Makiné</p>
            <p className="text-[10px]" style={{ color: '#8a8498' }}>Administration</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map(tab => {
            const active = currentPath === tab.href
            return (
              <Link
                key={tab.href}
                href={`${tab.href}?key=${adminPassword}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(212,169,106,0.18) 0%, rgba(212,169,106,0.06) 100%)',
                  color: '#d4a96a',
                  borderLeft: '2px solid #d4a96a',
                } : {
                  color: '#8a8498',
                }}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link
            href="/v3"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors hover:text-white"
            style={{ color: '#8a8498' }}
          >
            <span>🌐</span> Voir le site
          </Link>
          <a
            href="https://wa.me/221710581711"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
            style={{ color: '#4ade80' }}
          >
            <span>💬</span> WhatsApp
          </a>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile + desktop) */}
        <header
          className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-20"
          style={{
            background: 'rgba(6,6,14,0.85)',
            borderColor: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Mobile: logo + current section */}
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-full overflow-hidden lg:hidden">
              <Image src="/images/lolo/logo.png" alt="Makiné" fill className="object-cover" />
            </div>
            <span className="font-serif text-sm font-bold text-white lg:hidden">Makiné</span>
            {/* Desktop: current page name */}
            <span className="hidden lg:block text-sm font-medium" style={{ color: '#8a8498' }}>
              {TABS.find(t => t.href === currentPath)?.label ?? 'Admin'}
            </span>
          </div>

          {/* Mobile scrollable tabs */}
          <div className="lg:hidden flex gap-1 overflow-x-auto max-w-[60vw]">
            {TABS.map(tab => (
              <Link
                key={tab.href}
                href={`${tab.href}?key=${adminPassword}`}
                className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                style={currentPath === tab.href ? {
                  background: 'rgba(212,169,106,0.15)',
                  color: '#d4a96a',
                } : {
                  color: '#8a8498',
                }}
              >
                {tab.icon} {tab.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/v3"
              className="hidden sm:block text-xs transition-colors hover:text-white"
              style={{ color: '#8a8498' }}
            >
              ← Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  )
}
