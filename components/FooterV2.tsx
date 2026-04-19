import Link from 'next/link'
import Image from 'next/image'

export default function FooterV2() {
  return (
    <>
      {/* Floating WhatsApp CTA */}
      <a
        href="https://wa.me/221710581711"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Commander sur WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1EBE5C] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center gap-2 group"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span className="text-sm font-semibold max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 whitespace-nowrap">
          Commander
        </span>
      </a>

      <footer className="bg-rose-text text-white/70 relative overflow-hidden">
      {/* Decorative blurred petals */}
      <div className="petal-blur w-80 h-80 bg-rose-deep/20 top-0 right-0" style={{ position: 'absolute' }} />
      <div className="petal-blur w-48 h-48 bg-rose-medium/15 bottom-0 left-20" style={{ position: 'absolute' }} />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="relative w-16 h-16 mb-5">
              <Image src="/images/logo/logo.png" alt="Makiné" fill className="object-contain brightness-150 saturate-0" />
            </div>
            <p className="font-serif text-xl text-white font-semibold mb-2">Makiné</p>
            <p className="text-sm text-white/40 italic mb-6">l&apos;élégance commence par une peau douce</p>
            <p className="text-sm leading-relaxed max-w-sm text-white/50">
              Cosmétiques naturels formulés pour sublimer la beauté africaine, de Thiès jusqu&apos;à Paris.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://www.tiktok.com/@makineparis"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-rose-medium hover:bg-rose-deep/20 transition-all"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.53V6.77a4.85 4.85 0 01-1-.08z" />
                </svg>
              </a>
              <a
                href="https://wa.me/221710581711"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-green-400 hover:bg-green-500/10 transition-all"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-5">Boutique</p>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/v2/boutique', label: 'Tous les produits' },
                { href: '/v2/boutique?cat=gamme', label: 'Gammes corporelles' },
                { href: '/v2/boutique?cat=soins', label: 'Soins visage' },
                { href: '/v2/boutique?cat=huile', label: 'Huiles précieuses' },
                { href: '/v2/boutique?cat=savon', label: 'Savons artisanaux' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-rose-medium mb-5">Contact</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:+221710581711" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="text-base">🇸🇳</span> +221 71 058 17 11
                </a>
              </li>
              <li>
                <a href="tel:+33761783612" className="hover:text-white transition-colors flex items-center gap-2">
                  <span className="text-base">🇫🇷</span> +33 7 61 78 36 12
                </a>
              </li>
              <li>
                <a href="mailto:fatimata6590@gmail.com" className="hover:text-white transition-colors break-all">
                  fatimata6590@gmail.com
                </a>
              </li>
              <li className="text-white/30 text-xs leading-relaxed pt-2">
                📍 Thiès / Parcelle Assainie Unité 3<br />
                Horaires : 8h–20h ·{' '}
                <span className="text-rose-medium">Lun–Sam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="rose-line mb-8 opacity-20" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <p>© 2026 Makiné · Tous droits réservés</p>
          <div className="flex items-center gap-2">
            <span>Paiement sécurisé</span>
            <span className="text-rose-medium">Wave</span>
            <span>·</span>
            <span className="text-rose-medium">Orange Money</span>
          </div>
          <p>Livraison 🇸🇳 Sénégal · 🇫🇷 France</p>
        </div>
      </div>
    </footer>
    </>
  )
}
