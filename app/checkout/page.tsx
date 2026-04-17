'use client'

import { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { products, type Product } from '@/data/products'
import { getProductImageUrl } from '@/data/productImages'

type CartItem = { productId: string; quantity: number }

function getCartFromUrl(slug?: string | null): CartItem[] {
  if (slug) {
    const product = products.find((p) => p.slug === slug)
    if (product) return [{ productId: product.id, quantity: 1 }]
  }
  return []
}

function formatPrice(p: Product, country: string) {
  if (country === 'SN') return p.priceXOF === 0 ? null : p.priceXOF
  return p.price === 0 ? null : p.price
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = searchParams.get('product')

  const [cart, setCart] = useState<CartItem[]>(getCartFromUrl(slug))
  const [country, setCountry] = useState<'SN' | 'FR'>('SN')
  const [step, setStep] = useState<'cart' | 'info' | 'payment'>('cart')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })

  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money'>('wave')

  const currency = country === 'SN' ? 'FCFA' : '€'

  function getItemPrice(p: Product) {
    return country === 'SN' ? p.priceXOF : p.price
  }

  function calcTotal() {
    return cart.reduce((acc, item) => {
      const p = products.find((pr) => pr.id === item.productId)
      if (!p) return acc
      return acc + getItemPrice(p) * item.quantity
    }, 0)
  }

  function addProduct(productId: string) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { productId, quantity: 1 }]
    })
  }

  function removeProduct(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) { removeProduct(productId); return }
    setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i))
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) {
      setError('Veuillez remplir votre nom et numéro de téléphone.')
      return
    }
    const phoneRegex = /^[+]?[\d\s\-().]{8,15}$/
    if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) {
      setError('Numéro de téléphone invalide (ex: +221 77 000 00 00)')
      return
    }
    if (cart.length === 0) {
      setError('Votre panier est vide.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const total = calcTotal()
      const EUR_TO_XOF = 655.957 // parité fixe CFA

      // Prix unitaires selon la devise du client
      const itemsPayload = cart.map((item) => {
        const p = products.find((pr) => pr.id === item.productId)
        const price = country === 'SN' ? (p?.priceXOF ?? 0) : (p?.price ?? 0)
        return { productId: item.productId, quantity: item.quantity, price }
      })

      // Créer la commande (total recalculé côté serveur)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email || undefined,
          address: form.address || undefined,
          country,
          currency: country === 'SN' ? 'XOF' : 'EUR',
          paymentMethod,
          items: itemsPayload,
        }),
      })

      if (!orderRes.ok) throw new Error('Erreur création commande')
      const { orderId } = await orderRes.json()

      if (paymentMethod === 'wave') {
        // Montant récupéré depuis la DB par l'API Wave
        const waveRes = await fetch('/api/payment/wave/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        })
        if (!waveRes.ok) throw new Error('Erreur Wave')
        const { wave_launch_url } = await waveRes.json()
        window.location.href = wave_launch_url
      } else {
        // Orange Money — vérifier que l'init réussit avant de rediriger
        const omRes = await fetch('/api/payment/orange-money/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, phone: form.phone }),
        })
        if (!omRes.ok) throw new Error('Erreur Orange Money')
        // Orange Money = paiement initié sur le téléphone du client → page d'attente
        router.push(`/order/${orderId}/success`)
      }
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter.')
    } finally {
      setLoading(false)
    }
  }

  const total = calcTotal()

  return (
    <main className="min-h-screen bg-rose-snow">
      {/* Header */}
      <header className="bg-rose-wine text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/v2" className="font-serif text-2xl text-rose-deep">Makiné</Link>
          <Link href="/v2/boutique" className="text-sm hover:text-rose-deep transition-colors">
            ← Boutique
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold text-center mb-8">Commander</h1>

        {/* Étapes */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {(['cart', 'info', 'payment'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s ? 'bg-rose-deep text-white' :
                i < ['cart', 'info', 'payment'].indexOf(step) ? 'bg-rose-wine text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === s ? 'font-semibold' : 'text-gray-400'}`}>
                {s === 'cart' ? 'Panier' : s === 'info' ? 'Informations' : 'Paiement'}
              </span>
              {i < 2 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">

            {/* ÉTAPE 1 — PANIER */}
            {step === 'cart' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold">Votre panier</h2>
                  {/* Sélecteur pays */}
                  <div className="flex rounded-full border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setCountry('SN')}
                      className={`px-4 py-1.5 text-sm font-medium transition-colors ${country === 'SN' ? 'bg-rose-deep text-white' : 'hover:bg-gray-50'}`}
                    >
                      🇸🇳 FCFA
                    </button>
                    <button
                      onClick={() => setCountry('FR')}
                      className={`px-4 py-1.5 text-sm font-medium transition-colors ${country === 'FR' ? 'bg-rose-deep text-white' : 'hover:bg-gray-50'}`}
                    >
                      🇫🇷 EUR
                    </button>
                  </div>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-lg mb-4">Votre panier est vide</p>
                    <Link href="/v2/boutique" className="text-rose-deep hover:underline">
                      Voir la boutique →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const p = products.find((pr) => pr.id === item.productId)
                      if (!p) return null
                      const price = getItemPrice(p)
                      return (
                        <div key={item.productId} className="flex items-center gap-4 p-4 bg-rose-snow rounded-xl">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-rose-petal flex-shrink-0">
                            <Image
                              src={getProductImageUrl(p.slug)}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{p.name}</p>
                            <p className="text-sm text-rose-deep">
                              {price === 0 ? 'Prix sur demande' : `${price.toLocaleString('fr-FR')} ${currency}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeProduct(item.productId)}
                            className="text-gray-400 hover:text-red-500 transition-colors text-lg"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Ajouter un produit */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-medium mb-3 text-gray-600">Ajouter un produit :</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {products.filter((p) => p.inStock).slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p.id)}
                        className="text-left p-2 rounded-lg border border-gray-100 hover:border-rose-deep hover:bg-rose-petal transition-colors text-xs"
                      >
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-rose-deep">
                          {getItemPrice(p) === 0 ? 'Sur demande' : `${getItemPrice(p).toLocaleString('fr-FR')} ${currency}`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={() => setStep('info')}
                  className="mt-6 w-full bg-rose-deep text-white py-3 rounded-xl font-medium hover:bg-rose-wine transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer →
                </button>
              </div>
            )}

            {/* ÉTAPE 2 — INFORMATIONS */}
            {step === 'info' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-2xl font-bold mb-6">Vos informations</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Prénom Nom"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-deep transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+221 70 000 00 00"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-deep transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email (optionnel)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-deep transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Adresse de livraison (optionnel)</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Quartier, ville..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-deep transition-colors resize-none"
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep('cart')}
                    className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => {
                      if (!form.name || !form.phone) {
                        setError('Veuillez remplir votre nom et numéro de téléphone.')
                        return
                      }
                      setError('')
                      setStep('payment')
                    }}
                    className="flex-2 flex-1 bg-rose-deep text-white py-3 rounded-xl font-medium hover:bg-rose-wine transition-colors"
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 — PAIEMENT */}
            {step === 'payment' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-2xl font-bold mb-6">Mode de paiement</h2>

                <div className="space-y-3 mb-6">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'wave' ? 'border-wave-blue bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input
                      type="radio"
                      value="wave"
                      checked={paymentMethod === 'wave'}
                      onChange={() => setPaymentMethod('wave')}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 rounded-full bg-wave-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">W</div>
                    <div>
                      <p className="font-semibold">Wave 💙</p>
                      <p className="text-xs text-gray-500">Paiement sécurisé par Wave Mobile Money</p>
                    </div>
                    {paymentMethod === 'wave' && <span className="ml-auto text-wave-blue">✓</span>}
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'orange_money' ? 'border-om-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input
                      type="radio"
                      value="orange_money"
                      checked={paymentMethod === 'orange_money'}
                      onChange={() => setPaymentMethod('orange_money')}
                      className="sr-only"
                    />
                    <div className="w-10 h-10 rounded-full bg-om-orange flex items-center justify-center text-white font-bold text-sm flex-shrink-0">OM</div>
                    <div>
                      <p className="font-semibold">Orange Money 🟠</p>
                      <p className="text-xs text-gray-500">Paiement via Orange Money Sénégal</p>
                    </div>
                    {paymentMethod === 'orange_money' && <span className="ml-auto text-om-orange">✓</span>}
                  </label>

                  <a
                    href={`https://wa.me/221710581711?text=${encodeURIComponent('Bonjour, je souhaite commander. Voici mon panier :\n' + cart.map((i) => { const p = products.find((pr) => pr.id === i.productId); return p ? `• ${p.name} x${i.quantity}` : '' }).join('\n'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">WhatsApp</p>
                      <p className="text-xs text-gray-500">Commander directement via WhatsApp</p>
                    </div>
                    <span className="ml-auto text-sm text-gray-400">→</span>
                  </a>
                </div>

                {error && (
                  <p className="mb-4 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('info')}
                    className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-rose-deep text-white py-3 rounded-xl font-medium hover:bg-rose-wine transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Traitement...
                      </>
                    ) : (
                      'Payer maintenant'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Résumé commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h3 className="font-serif text-lg font-bold mb-4">Résumé</h3>

              {cart.length === 0 ? (
                <p className="text-sm text-gray-400">Panier vide</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const p = products.find((pr) => pr.id === item.productId)
                    if (!p) return null
                    const price = getItemPrice(p)
                    return (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate mr-2">
                          {p.name} ×{item.quantity}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          {price === 0 ? '—' : `${(price * item.quantity).toLocaleString('fr-FR')} ${currency}`}
                        </span>
                      </div>
                    )
                  })}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-rose-deep">
                        {total === 0 ? 'Sur demande' : `${total.toLocaleString('fr-FR')} ${currency}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                <p>📦 Livraison partout au Sénégal & Europe</p>
                <p>📞 +221 71 058 17 11</p>
                <p>🔒 Paiement sécurisé</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-rose-snow flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-rose-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
