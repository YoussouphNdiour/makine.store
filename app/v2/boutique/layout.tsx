import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Boutique',
  description:
    'Explorez toute la collection Makiné — gammes corporelles, soins visage, huiles précieuses et savons artisanaux pour tous les teints.',
  openGraph: {
    title: 'Boutique Makiné',
    description: 'Collection complète de cosmétiques naturels Makiné.',
    type: 'website',
  },
}

export default function BoutiqueLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
