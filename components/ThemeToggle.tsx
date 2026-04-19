'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

/**
 * Floating V2 ↔ V3 toggle.
 * - On V2 pages  → shows "🌙 V3"  link
 * - On V3 pages  → shows "☀️ V2"  link
 * Maps equivalent paths automatically.
 */
export default function ThemeToggle() {
  const path = usePathname()

  const isV3 = path.startsWith('/v3')
  const isV2 = path.startsWith('/v2')

  if (!isV2 && !isV3) return null

  // Build target path
  let target: string
  if (isV3) {
    target = path === '/v3' ? '/v2' : path.replace('/v3/', '/v2/')
  } else {
    target = path === '/v2' ? '/v3' : path.replace('/v2/', '/v3/')
  }

  const label   = isV3 ? '☀️ Clair'  : '🌙 Sombre'
  const current = isV3 ? 'Sombre'    : 'Clair'

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-0 rounded-full overflow-hidden"
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Current — inactive */}
      <span
        className="px-4 py-2 text-xs font-semibold"
        style={isV3
          ? { background: '#06060e', color: 'rgba(212,96,122,0.9)' }
          : { background: '#fdfaf7', color: 'rgba(158,61,88,0.8)' }}
      >
        {current}
      </span>

      {/* Separator */}
      <span className="w-px h-5 self-center"
        style={{ background: isV3 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />

      {/* Switch — active link */}
      <Link
        href={target}
        className="px-4 py-2 text-xs font-bold transition-all hover:brightness-110"
        style={isV3
          ? { background: '#d4607a', color: '#fff' }
          : { background: '#9e3d58', color: '#fff' }}
      >
        {label}
      </Link>
    </div>
  )
}
