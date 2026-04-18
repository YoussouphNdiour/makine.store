import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: {
    template: '%s | Makiné',
    default: 'Makiné — Cosmétiques Naturels de Luxe',
  },
  description:
    'Makiné — gammes corporelles, huiles précieuses et soins artisanaux pour sublimer chaque teint. Livraison Sénégal & France.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Makiné',
    images: ['/images/lolo/logo.png'],
  },
}

export default function V3Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
