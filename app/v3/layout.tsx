import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: { template: '%s · Makiné', default: 'Makiné — Cosmétiques de Luxe' },
  description: 'Gammes corporelles, huiles & soins artisanaux pour sublimer chaque teint. Sénégal & France.',
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Makiné', images: ['/images/lolo/logo.png'] },
}

export default function V3Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
