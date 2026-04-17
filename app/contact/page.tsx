import Image from 'next/image'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <main>
      <header className="bg-makine-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl text-makine-gold">Makiné</Link>
          <Link href="/boutique" className="hover:text-makine-gold transition-colors text-sm">Boutique</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-serif text-4xl font-bold text-center mb-4">Contactez-nous</h1>
        <p className="text-center text-gray-500 mb-12">
          Notre équipe est disponible 7j/7 de 8h à 20h
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Infos de contact */}
          <div className="space-y-6">
            <div className="bg-makine-beige rounded-2xl p-6">
              <h2 className="font-serif text-xl font-bold mb-4">Nos coordonnées</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🇸🇳</span>
                  <div>
                    <p className="font-semibold">Sénégal</p>
                    <a href="tel:+221710581711" className="text-makine-gold hover:underline">+221 71 058 17 11</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🇫🇷</span>
                  <div>
                    <p className="font-semibold">France</p>
                    <a href="tel:+33761783612" className="text-makine-gold hover:underline">+33 7 61 78 36 12</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">✉️</span>
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:fatimata6590@gmail.com" className="text-makine-gold hover:underline">fatimata6590@gmail.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="font-semibold">Adresse</p>
                    <p className="text-gray-600">Thiès, Parcelle Assainie Unité 3, Sénégal</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-makine-beige rounded-2xl p-6">
              <h2 className="font-serif text-xl font-bold mb-4">Réseaux sociaux</h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="https://www.tiktok.com/@makineparis" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-makine-gold transition-colors">
                    <span className="text-xl">📱</span>
                    <span>TikTok : @makineparis</span>
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-xl">📸</span>
                  <span>Instagram : fatimata6590 / Makiné</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-xl">👻</span>
                  <span>Snapchat : fata_seck202153</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-xl">👤</span>
                  <span>Facebook : fatimata6590 / Makiné</span>
                </li>
              </ul>
            </div>

            <a
              href="https://wa.me/221710581711"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-500 text-white px-6 py-4 rounded-2xl font-medium hover:bg-green-600 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Écrire sur WhatsApp
            </a>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold mb-6">Envoyer un message</h2>
            <form className="space-y-4" action="mailto:fatimata6590@gmail.com" method="get">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Votre nom"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-makine-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-makine-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  name="body"
                  rows={5}
                  placeholder="Votre message..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-makine-gold resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-makine-gold text-white py-3 rounded-xl font-medium hover:bg-yellow-600 transition-colors"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
