'use client'

import { useState } from 'react'

type Product = {
  id: string
  name: string
  category: string
  priceXOF: number
  price: number
  badge: string | null
  inStock: boolean
}

type CartItem = {
  product: Product
  quantity: number
}

const categoryColor: Record<string, string> = {
  gamme: 'bg-purple-100 text-purple-700',
  soins: 'bg-pink-100 text-pink-700',
  huile: 'bg-amber-100 text-amber-700',
  savon: 'bg-teal-100 text-teal-700',
  maquillage: 'bg-rose-100 text-rose-700',
}

export default function POSInterface({
  products,
  adminKey,
}: {
  products: Product[]
  adminKey: string
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wave' | 'orange_money'>('cash')
  const [loading, setLoading] = useState(false)
  const [lastOrder, setLastOrder] = useState<{ id: string; totalAmount: number; waveLaunchUrl?: string } | null>(null)
  const [currency, setCurrency] = useState<'XOF' | 'EUR'>('XOF')

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter
    return matchSearch && matchCat && p.inStock
  })

  const total = cart.reduce((sum, item) => {
    const price = currency === 'XOF' ? item.product.priceXOF : item.product.price
    return sum + price * item.quantity
  }, 0)

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev =>
      prev.flatMap(i => {
        if (i.product.id !== productId) return [i]
        const q = i.quantity + delta
        return q <= 0 ? [] : [{ ...i, quantity: q }]
      })
    )
  }

  function clearCart() {
    setCart([])
    setCustomerName('')
    setCustomerPhone('')
    // Ne pas reset lastOrder ici — il est affiché après la vente
  }

  async function handleSubmit() {
    if (!cart.length) return alert('Panier vide')
    if (!customerName.trim()) return alert('Nom client requis')
    setLoading(true)
    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: currency === 'XOF' ? item.product.priceXOF : item.product.price,
      }))
      const res = await fetch('/api/admin/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          customerName,
          customerPhone,
          items,
          paymentMethod,
          currency,
          notes: `POS - ${paymentMethod}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      clearCart()
      setLastOrder({ id: data.order.id, totalAmount: data.order.totalAmount, waveLaunchUrl: data.wave_launch_url })
    } catch (err) {
      alert(`❌ ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Left: produits */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search + filtres */}
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-deep flex-1 min-w-[140px]"
          />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-rose-deep text-white'
                  : 'bg-white text-gray-600 hover:bg-rose-petal'
              }`}
            >
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>

        {/* Grid produits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pb-2">
          {filtered.map(p => {
            const inCart = cart.find(i => i.product.id === p.id)
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className={`text-left bg-white rounded-xl p-3 shadow-sm border-2 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${
                  inCart ? 'border-rose-deep' : 'border-transparent'
                }`}
              >
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[p.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {p.category}
                </span>
                <p className="font-semibold text-sm mt-2 leading-tight line-clamp-2">{p.name}</p>
                <p className="text-rose-deep font-bold text-sm mt-1">
                  {currency === 'XOF'
                    ? `${p.priceXOF.toLocaleString('fr-FR')} FCFA`
                    : `${p.price}€`}
                </p>
                {inCart && (
                  <span className="text-xs bg-rose-deep text-white px-2 py-0.5 rounded-full font-medium">
                    ×{inCart.quantity}
                  </span>
                )}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 text-sm">Aucun produit</div>
          )}
        </div>
      </div>

      {/* Right: panier + paiement */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header panier */}
        <div className="bg-rose-wine text-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">🛒 Panier</span>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrency(c => c === 'XOF' ? 'EUR' : 'XOF')}
              className="text-xs bg-white/10 px-2 py-1 rounded-lg hover:bg-white/20"
            >
              {currency}
            </button>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300">
                Vider
              </button>
            )}
          </div>
        </div>

        {/* Succès dernière vente */}
        {lastOrder && (
          <div className="mx-3 mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-green-700 font-semibold text-sm">✅ Vente enregistrée !</p>
            <p className="text-xs text-green-600 mt-0.5">
              #{lastOrder.id.slice(-8).toUpperCase()} — {lastOrder.totalAmount.toLocaleString('fr-FR')} {currency}
            </p>
            {lastOrder.waveLaunchUrl && (
              <a
                href={lastOrder.waveLaunchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
              >
                💙 Ouvrir lien Wave
              </a>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Cliquez sur un produit pour l&apos;ajouter</p>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-2 py-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-tight truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400">
                    {currency === 'XOF'
                      ? `${item.product.priceXOF.toLocaleString('fr-FR')} FCFA`
                      : `${item.product.price}€`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.product.id, -1)}
                    className="w-6 h-6 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
                  >−</button>
                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.product.id, +1)}
                    className="w-6 h-6 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
                  >+</button>
                </div>
                <p className="text-xs font-semibold w-16 text-right">
                  {currency === 'XOF'
                    ? (item.product.priceXOF * item.quantity).toLocaleString('fr-FR')
                    : (item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <span className="font-semibold text-sm">Total</span>
            <span className="font-bold text-rose-deep text-lg">
              {currency === 'XOF' ? `${total.toLocaleString('fr-FR')} FCFA` : `${total.toFixed(2)}€`}
            </span>
          </div>

          {/* Client */}
          <input
            type="text"
            placeholder="Nom client *"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-rose-deep"
          />
          <input
            type="tel"
            placeholder="Téléphone (optionnel)"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-rose-deep"
          />

          {/* Paiement */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {(['cash', 'wave', 'orange_money'] as const).map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                  paymentMethod === m
                    ? 'bg-rose-deep text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m === 'cash' ? '💵 Cash' : m === 'wave' ? '💙 Wave' : '🟠 Orange'}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
            className="w-full bg-rose-deep text-white py-3 rounded-xl font-semibold text-sm hover:bg-rose-wine transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : `Encaisser ${currency === 'XOF' ? `${total.toLocaleString('fr-FR')} FCFA` : `${total.toFixed(2)}€`}`}
          </button>
        </div>
      </div>
    </div>
  )
}
