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
  theme?: 'dark' | 'light'
}

// ── Theme tokens ──────────────────────────────────────────────
const THEMES = {
  dark: {
    bg:           '#06060e',
    sidebar:      'rgba(255,255,255,0.03)',
    sidebarBorder:'rgba(255,255,255,0.07)',
    topbar:       'rgba(6,6,14,0.88)',
    topbarBorder: 'rgba(255,255,255,0.07)',
    text:         '#f0ede8',
    textMuted:    '#8a8498',
    accent:       '#d4607a',          // rose foncé
    accentRgb:    '212,96,122',
    activeGrad:   'linear-gradient(135deg,rgba(212,96,122,0.18) 0%,rgba(212,96,122,0.06) 100%)',
    activeBorder: '#d4607a',
    loginBg:      '#06060e',
    loginCard:    'rgba(255,255,255,0.04)',
    loginGlow:    'radial-gradient(ellipse at 50% 40%,rgba(212,96,122,0.08) 0%,transparent 60%)',
    inputBg:      'rgba(255,255,255,0.06)',
    inputBorder:  'rgba(255,255,255,0.12)',
    btnGrad:      'linear-gradient(135deg,#d4607a,#9a3050)',
    btnColor:     '#fff',
    divider:      'rgba(255,255,255,0.06)',
    mainBg:       '#06060e',
    contentBg:    'transparent',
  },
  light: {
    bg:           '#fdfaf7',
    sidebar:      'rgba(253,250,247,0.95)',
    sidebarBorder:'rgba(158,61,88,0.1)',
    topbar:       'rgba(253,250,247,0.95)',
    topbarBorder: 'rgba(158,61,88,0.1)',
    text:         '#1a0a12',
    textMuted:    '#9a7080',
    accent:       '#9e3d58',          // rose logo
    accentRgb:    '158,61,88',
    activeGrad:   'linear-gradient(135deg,rgba(158,61,88,0.1) 0%,rgba(158,61,88,0.04) 100%)',
    activeBorder: '#9e3d58',
    loginBg:      '#fdfaf7',
    loginCard:    'rgba(158,61,88,0.04)',
    loginGlow:    'radial-gradient(ellipse at 50% 40%,rgba(158,61,88,0.06) 0%,transparent 60%)',
    inputBg:      'rgba(158,61,88,0.05)',
    inputBorder:  'rgba(158,61,88,0.15)',
    btnGrad:      'linear-gradient(135deg,#9e3d58,#c4607a)',
    btnColor:     '#fff',
    divider:      'rgba(158,61,88,0.08)',
    mainBg:       '#f7f0f3',
    contentBg:    '#fdfaf7',
  },
}

export default function AdminShell({ adminKey, currentPath, children, theme = 'dark' }: Props) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin_dev'
  const t = THEMES[theme]
  const otherTheme = theme === 'dark' ? 'light' : 'dark'

  if (adminKey !== adminPassword) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 relative"
        style={{ background: t.loginBg }}>
        <div className="absolute inset-0" style={{ background: t.loginGlow }} />
        <div className="relative rounded-2xl p-8 max-w-sm w-full text-center"
          style={{ background: t.loginCard, backdropFilter: 'blur(20px)', border: `1px solid rgba(${t.accentRgb},0.15)` }}>
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-14 h-14 rounded-full overflow-hidden"
              style={{ boxShadow: `0 0 0 1px rgba(${t.accentRgb},0.3)` }}>
              <Image src="/images/logo/logo.png" alt="Makiné" fill className="object-cover" />
            </div>
          </div>
          <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: t.text }}>Dashboard Makiné</h1>
          <p className="text-sm mb-6" style={{ color: t.textMuted }}>Accès réservé à l&apos;équipe</p>
          <form method="get">
            <input type="password" name="key" placeholder="Mot de passe admin" autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none mb-3 transition-colors"
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }} />
            <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background: t.btnGrad, color: t.btnColor }}>
              Accéder →
            </button>
          </form>

          {/* Theme toggle sur login */}
          <div className="mt-6 pt-4 flex items-center justify-center gap-3"
            style={{ borderTop: `1px solid rgba(${t.accentRgb},0.1)` }}>
            <span className="text-xs" style={{ color: t.textMuted }}>Thème :</span>
            <Link href={`?key=&_theme=${otherTheme}`}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{ background: `rgba(${t.accentRgb},0.1)`, color: t.accent }}>
              {otherTheme === 'light' ? '☀️ Clair' : '🌙 Sombre'}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: t.mainBg, color: t.text }}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r sticky top-0 h-screen"
        style={{ background: t.sidebar, borderColor: t.sidebarBorder, backdropFilter: 'blur(20px)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: t.divider }}>
          <div className="relative w-9 h-9 rounded-full overflow-hidden"
            style={{ boxShadow: `0 0 0 1px rgba(${t.accentRgb},0.3)` }}>
            <Image src="/images/logo/logo.png" alt="Makiné" fill className="object-cover" />
          </div>
          <div>
            <p className="font-serif text-sm font-bold" style={{ color: t.text }}>Makiné</p>
            <p className="text-[10px]" style={{ color: t.textMuted }}>Administration</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {TABS.map(tab => {
            const active = currentPath === tab.href
            return (
              <Link key={tab.href} href={`${tab.href}?key=${adminPassword}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={active ? {
                  background: t.activeGrad,
                  color: t.accent,
                  borderLeft: `2px solid ${t.activeBorder}`,
                } : { color: t.textMuted }}>
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: t.divider }}>
          {/* Theme switch */}
          <Link href={`${currentPath}?key=${adminPassword}&_theme=${otherTheme}`}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
            style={{ color: t.accent, background: `rgba(${t.accentRgb},0.06)` }}>
            <span>{otherTheme === 'light' ? '☀️' : '🌙'}</span>
            {otherTheme === 'light' ? 'Mode clair' : 'Mode sombre'}
          </Link>
          <Link href="/v3" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
            style={{ color: t.textMuted }}>
            <span>🌐</span> Voir le site
          </Link>
          <a href="https://wa.me/221710581711" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
            style={{ color: '#4ade80' }}>
            <span>💬</span> WhatsApp
          </a>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-20"
          style={{ background: t.topbar, borderColor: t.topbarBorder, backdropFilter: 'blur(20px)' }}>
          {/* Mobile: logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 rounded-full overflow-hidden lg:hidden">
              <Image src="/images/logo/logo.png" alt="Makiné" fill className="object-cover" />
            </div>
            <span className="font-serif text-sm font-bold lg:hidden" style={{ color: t.text }}>Makiné</span>
            <span className="hidden lg:block text-sm font-medium" style={{ color: t.textMuted }}>
              {TABS.find(tab => tab.href === currentPath)?.label ?? 'Admin'}
            </span>
          </div>

          {/* Mobile scrollable tabs */}
          <div className="lg:hidden flex gap-1 overflow-x-auto max-w-[60vw]">
            {TABS.map(tab => (
              <Link key={tab.href} href={`${tab.href}?key=${adminPassword}`}
                className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
                style={currentPath === tab.href ? {
                  background: `rgba(${t.accentRgb},0.12)`, color: t.accent,
                } : { color: t.textMuted }}>
                {tab.icon} {tab.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Theme toggle desktop */}
            <Link href={`${currentPath}?key=${adminPassword}&_theme=${otherTheme}`}
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ background: `rgba(${t.accentRgb},0.08)`, color: t.accent }}>
              {otherTheme === 'light' ? '☀️' : '🌙'}
              <span className="hidden md:inline">{otherTheme === 'light' ? 'Clair' : 'Sombre'}</span>
            </Link>
            <Link href="/v3" className="hidden sm:block text-xs transition-colors"
              style={{ color: t.textMuted }}>
              ← Site
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 lg:p-7" style={{ background: t.contentBg }}>
          {children}
        </main>
      </div>
    </div>
  )
}
