import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: {
    template: '%s | Makiné',
    default: 'Makiné — Cosmétiques Naturels',
  },
  description:
    'Découvrez les gammes de cosmétiques naturels Makiné — soins, huiles, savons et gammes corporelles pour tous les teints. Livraison Sénégal & France.',
  keywords: [
    'cosmétiques naturels',
    'Makiné',
    'soins peau noire',
    'gamme beauté',
    'savon artisanal',
    'huile corps',
    'Sénégal',
    'France',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://makine.store/v2',
    siteName: 'Makiné',
    images: ['/images/lolo/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function V2Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
