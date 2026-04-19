'use client'

import { Suspense, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { products as staticProducts } from '@/data/products'
import { getProductImageUrl } from '@/data/productImages'
import { getCart, clearCart } from '@/lib/cart'

type AnyProduct = {
  id: string; slug: string; name: string; category: string
  price: number; priceXOF: number; priceXOF2?: number | null
  badge?: string | null; description: string
  inStock: boolean; wholesale: boolean; imageUrl?: string | null
}
type CartItem = { productId: string; quantity: number }

// ── Theme tokens ─────────────────────────────────────────────
const THEMES = {
  dark: {
    page:         '#06060e',
    header:       'rgba(6,6,14,0.92)',
    headerBorder: 'rgba(255,255,255,0.08)',
    headerText:   '#f0ede8',
    headerMuted:  'rgba(240,237,232,0.45)',
    card:         'rgba(255,255,255,0.04)',
    cardBorder:   '1px solid rgba(255,255,255,0.08)',
    cardShadow:   'none',
    text:         '#f0ede8',
    textMuted:    'rgba(240,237,232,0.5)',
    textFaint:    'rgba(240,237,232,0.25)',
    accent:       '#d4607a',
    accentRgb:    '212,96,122',
    accentBtn:    '#d4607a',
    accentBtnText:'#fff',
    stepActive:   '#d4607a',
    stepDone:     'rgba(212,96,122,0.7)',
    stepInactive: 'rgba(255,255,255,0.08)',
    stepTextAct:  '#f0ede8',
    stepTextIn:   'rgba(240,237,232,0.3)',
    cartItem:     'rgba(255,255,255,0.03)',
    cartBorder:   '1px solid rgba(255,255,255,0.07)',
    qtyBtn:       'rgba(255,255,255,0.07)',
    qtyBtnBorder: 'rgba(255,255,255,0.12)',
    input:        'rgba(255,255,255,0.05)',
    inputBorder:  'rgba(255,255,255,0.1)',
    inputFocus:   'rgba(212,96,122,0.4)',
    divider:      'rgba(255,255,255,0.06)',
    backBtn:      'rgba(255,255,255,0.06)',
    backBtnBorder:'rgba(255,255,255,0.1)',
    smallCard:    'rgba(255,255,255,0.03)',
    smallBorder:  'rgba(255,255,255,0.07)',
    smallHover:   'rgba(212,96,122,0.07)',
    payCard:      'rgba(255,255,255,0.03)',
    payBorder:    'rgba(255,255,255,0.08)',
    summary:      'rgba(255,255,255,0.03)',
    summaryBorder:'rgba(255,255,255,0.08)',
    error:        'rgba(239,68,68,0.12)',
    errorText:    '#f87171',
    waveActive:   'rgba(37,99,235,0.15)',
    waveBorder:   '#3b82f6',
    omActive:     'rgba(234,88,12,0.15)',
    omBorder:     '#f97316',
    waActive:     'rgba(34,197,94,0.12)',
    waBorder:     '#22c55e',
  },
  light: {
    page:         '#fdfaf7',
    header:       '#9e3d58',
    headerBorder: 'transparent',
    headerText:   '#fff',
    headerMuted:  'rgba(255,255,255,0.7)',
    card:         '#fff',
    cardBorder:   '1px solid rgba(0,0,0,0.06)',
    cardShadow:   '0 1px 6px rgba(0,0,0,0.06)',
    text:         '#1a0a12',
    textMuted:    '#6b7280',
    textFaint:    '#9ca3af',
    accent:       '#9e3d58',
    accentRgb:    '158,61,88',
    accentBtn:    '#9e3d58',
    accentBtnText:'#fff',
    stepActive:   '#9e3d58',
    stepDone:     'rgba(158,61,88,0.7)',
    stepInactive: '#e5e7eb',
    stepTextAct:  '#1a0a12',
    stepTextIn:   '#9ca3af',
    cartItem:     '#f7f2f4',
    cartBorder:   '1px solid transparent',
    qtyBtn:       '#fff',
    qtyBtnBorder: '#e5e7eb',
    input:        '#fff',
    inputBorder:  '#e5e7eb',
    inputFocus:   '#9e3d58',
    divider:      '#f3f4f6',
    backBtn:      '#fff',
    backBtnBorder:'#e5e7eb',
    smallCard:    '#fff',
    smallBorder:  '#f3f4f6',
    smallHover:   'rgba(158,61,88,0.06)',
    payCard:      '#fff',
    payBorder:    '#f3f4f6',
    summary:      '#fff',
    summaryBorder:'rgba(0,0,0,0.06)',
    error:        '#fef2f2',
    errorText:    '#ef4444',
    waveActive:   '#eff6ff',
    waveBorder:   '#3b82f6',
    omActive:     '#fff7ed',
    omBorder:     '#f97316',
    waActive:     '#f0fdf4',
    waBorder:     '#22c55e',
  },
}

function getImgUrl(p: AnyProduct) {
  return p.imageUrl || getProductImageUrl(p.slug)
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productIdFromUrl = searchParams.get('product')
  const isDark = searchParams.get('theme') === 'dark'
  const t = isDark ? THEMES.dark : THEMES.light
  const otherTheme = isDark ? 'light' : 'dark'

  const [allProducts, setAllProducts] = useState<AnyProduct[]>(staticProducts as AnyProduct[])
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [country, setCountry] = useState<'SN' | 'FR'>('SN')
  const [step, setStep] = useState<'cart' | 'info' | 'payment'>('cart')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'whatsapp'>('wave')

  const currency = country === 'SN' ? 'FCFA' : '€'

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((dbProducts: AnyProduct[]) => {
        if (!Array.isArray(dbProducts)) return
        const merged = [...dbProducts]
        for (const sp of staticProducts as AnyProduct[]) {
          if (!merged.some(p => p.id === sp.id || p.slug === sp.slug)) merged.push(sp)
        }
        setAllProducts(merged)
        setProductsLoaded(true)
        if (productIdFromUrl) {
          const found = merged.find(p => p.id === productIdFromUrl || p.slug === productIdFromUrl)
          if (found) setCart([{ productId: found.id, quantity: 1 }])
        } else {
          const saved = getCart()
          if (saved.length > 0) setCart(saved)
        }
      })
      .catch(() => {
        if (productIdFromUrl) {
          const found = (staticProducts as AnyProduct[]).find(p => p.id === productIdFromUrl || p.slug === productIdFromUrl)
          if (found) setCart([{ productId: found.id, quantity: 1 }])
        } else {
          const saved = getCart()
          if (saved.length > 0) setCart(saved)
        }
        setProductsLoaded(true)
      })
  }, [productIdFromUrl])

  function findProduct(id: string) { return allProducts.find(p => p.id === id) }
  function getItemPrice(p: AnyProduct) { return country === 'SN' ? p.priceXOF : p.price }
  function calcTotal() {
    return cart.reduce((acc, item) => {
      const p = findProduct(item.productId)
      return p ? acc + getItemPrice(p) * item.quantity : acc
    }, 0)
  }
  function addProduct(productId: string) {
    setCart(prev => {
      const ex = prev.find(i => i.productId === productId)
      return ex ? prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { productId, quantity: 1 }]
    })
  }
  function removeProduct(id: string) { setCart(prev => prev.filter(i => i.productId !== id)) }
  function updateQuantity(id: string, qty: number) {
    if (qty <= 0) { removeProduct(id); return }
    setCart(prev => prev.map(i => i.productId === id ? { ...i, quantity: qty } : i))
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) { setError('Veuillez remplir votre nom et numéro de téléphone.'); return }
    const phoneRegex = /^[+]?[\d\s\-().]{8,15}$/
    if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) { setError('Numéro de téléphone invalide (ex: +221 77 000 00 00)'); return }
    if (cart.length === 0) { setError('Votre panier est vide.'); return }
    setLoading(true); setError('')
    try {
      const itemsPayload = cart.map(item => {
        const p = findProduct(item.productId)
        return { productId: item.productId, quantity: item.quantity, price: country === 'SN' ? (p?.priceXOF ?? 0) : (p?.price ?? 0) }
      })
      const orderRes = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: form.name, customerPhone: form.phone, customerEmail: form.email || undefined, address: form.address || undefined, country, currency: country === 'SN' ? 'XOF' : 'EUR', paymentMethod, items: itemsPayload }),
      })
      if (!orderRes.ok) throw new Error('Erreur création commande')
      const { orderId } = await orderRes.json()
      clearCart()
      if (paymentMethod === 'wave') {
        const waveRes = await fetch('/api/payment/wave/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) })
        if (!waveRes.ok) throw new Error('Erreur Wave')
        const { wave_launch_url } = await waveRes.json()
        window.location.href = wave_launch_url
      } else if (paymentMethod === 'orange_money') {
        const omRes = await fetch('/api/payment/orange-money/initiate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, phone: form.phone }) })
        const omData = await omRes.json().catch(() => ({}))
        if (!omRes.ok) throw new Error(omData?.error ? `Orange Money : ${omData.error}` : 'Erreur Orange Money. Vérifiez votre numéro et réessayez.')
        router.push(`/order/${orderId}/success`)
      } else {
        await fetch('/api/payment/whatsapp/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) })
        router.push(`/order/${orderId}/success`)
      }
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter.')
    } finally { setLoading(false) }
  }

  const total = calcTotal()
  const availableProducts = allProducts.filter(p => p.inStock && !cart.some(i => i.productId === p.id))
  const displayedProducts = showAllProducts ? availableProducts : availableProducts.slice(0, 6)
  const themeParam = isDark ? '?theme=dark' : ''

  // ── Helper: input style ──
  const inputStyle = {
    background: t.input,
    border: `1px solid ${t.inputBorder}`,
    color: t.text,
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  }

  return (
    <main style={{ minHeight: '100vh', background: t.page, color: t.text }}>

      {/* ── HEADER ──────────────────────────────────────── */}
      <header style={{ background: t.header, borderBottom: `1px solid ${t.headerBorder}`, backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={isDark ? '/v3' : '/v2'} className="font-serif text-xl font-bold"
            style={{ color: t.headerText }}>Makiné</Link>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <Link
              href={isDark ? `/checkout` : `/checkout?theme=dark`}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)', color: t.headerText }}
            >
              {isDark ? '☀️ Clair' : '🌙 Sombre'}
            </Link>
            <Link href={isDark ? `/v3/boutique` : `/v2/boutique`}
              className="text-sm transition-colors"
              style={{ color: t.headerMuted }}>
              ← Boutique
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold text-center mb-8" style={{ color: t.text }}>
          Commander
        </h1>

        {/* ── STEPS ───────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {(['cart', 'info', 'payment'] as const).map((s, i) => {
            const idx = ['cart', 'info', 'payment'].indexOf(step)
            const isActive = step === s
            const isDone = i < idx
            return (
              <div key={s} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: isActive ? t.stepActive : isDone ? t.stepDone : t.stepInactive,
                    color: isActive || isDone ? '#fff' : t.stepTextIn,
                  }}>
                  {i + 1}
                </div>
                <span className="text-sm hidden sm:block"
                  style={{ color: isActive ? t.text : t.stepTextIn, fontWeight: isActive ? 600 : 400 }}>
                  {s === 'cart' ? 'Panier' : s === 'info' ? 'Informations' : 'Paiement'}
                </span>
                {i < 2 && <div className="w-8 h-px" style={{ background: t.divider }} />}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* ── ÉTAPE 1 — PANIER ──────────────────────────── */}
            {step === 'cart' && (
              <div className="rounded-2xl p-6" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold" style={{ color: t.text }}>Votre panier</h2>
                  <div className="flex rounded-full overflow-hidden" style={{ border: `1px solid ${t.qtyBtnBorder}` }}>
                    {(['SN', 'FR'] as const).map(c => (
                      <button key={c} onClick={() => setCountry(c)}
                        className="px-4 py-1.5 text-sm font-medium transition-colors"
                        style={country === c
                          ? { background: t.accentBtn, color: t.accentBtnText }
                          : { background: 'transparent', color: t.textMuted }}>
                        {c === 'SN' ? '🇸🇳 FCFA' : '🇫🇷 EUR'}
                      </button>
                    ))}
                  </div>
                </div>

                {!productsLoaded && cart.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
                      style={{ borderColor: t.accent, borderTopColor: 'transparent' }} />
                    <p className="text-sm" style={{ color: t.textMuted }}>Chargement du panier…</p>
                  </div>
                )}

                {productsLoaded && cart.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-lg mb-4" style={{ color: t.textMuted }}>Votre panier est vide</p>
                    <Link href={isDark ? '/v3/boutique' : '/v2/boutique'}
                      style={{ color: t.accent }} className="hover:underline">
                      Voir la boutique →
                    </Link>
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="space-y-3">
                    {cart.map(item => {
                      const p = findProduct(item.productId)
                      if (!p) return null
                      const price = getItemPrice(p)
                      return (
                        <div key={item.productId} className="flex items-center gap-4 p-4 rounded-xl"
                          style={{ background: t.cartItem, border: t.cartBorder }}>
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f5e8ed' }}>
                            <Image src={getImgUrl(p)} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate" style={{ color: t.text }}>{p.name}</p>
                            <p className="text-sm" style={{ color: t.accent }}>
                              {price === 0 ? 'Prix sur demande' : `${price.toLocaleString('fr-FR')} ${currency}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {[item.quantity - 1, item.quantity, item.quantity + 1].map((v, vi) => vi === 1 ? (
                              <span key="qty" className="w-6 text-center text-sm font-semibold" style={{ color: t.text }}>{item.quantity}</span>
                            ) : (
                              <button key={vi === 0 ? 'minus' : 'plus'}
                                onClick={() => updateQuantity(item.productId, v)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                                style={{ background: t.qtyBtn, border: `1px solid ${t.qtyBtnBorder}`, color: t.textMuted }}>
                                {vi === 0 ? '−' : '+'}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => removeProduct(item.productId)}
                            className="text-lg transition-colors"
                            style={{ color: t.textFaint }}>×</button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Ajouter d'autres produits */}
                {productsLoaded && availableProducts.length > 0 && (
                  <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${t.divider}` }}>
                    <p className="text-sm font-medium mb-3" style={{ color: t.textMuted }}>
                      Ajouter un produit à votre commande :
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {displayedProducts.map(p => (
                        <button key={p.id} onClick={() => addProduct(p.id)}
                          className="text-left p-3 rounded-xl transition-all group"
                          style={{ background: t.smallCard, border: `1px solid ${t.smallBorder}` }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(${t.accentRgb},0.4)`)}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = t.smallBorder)}
                        >
                          <div className="relative w-full h-20 rounded-lg overflow-hidden mb-2"
                            style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f5e8ed' }}>
                            <Image src={getImgUrl(p)} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <p className="text-xs font-medium truncate" style={{ color: t.text }}>{p.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: t.accent }}>
                            {getItemPrice(p) === 0 ? 'Sur demande' : `${getItemPrice(p).toLocaleString('fr-FR')} ${currency}`}
                          </p>
                          <p className="text-xs font-semibold mt-1" style={{ color: t.accent }}>+ Ajouter</p>
                        </button>
                      ))}
                    </div>
                    {availableProducts.length > 6 && (
                      <button onClick={() => setShowAllProducts(!showAllProducts)}
                        className="mt-3 text-xs w-full text-center hover:underline"
                        style={{ color: t.accent }}>
                        {showAllProducts ? 'Voir moins' : `Voir tous les produits (${availableProducts.length})`}
                      </button>
                    )}
                  </div>
                )}

                <button disabled={cart.length === 0} onClick={() => setStep('info')}
                  className="mt-6 w-full py-3 rounded-xl font-medium transition-all disabled:opacity-40"
                  style={{ background: t.accentBtn, color: t.accentBtnText }}>
                  Continuer →
                </button>
              </div>
            )}

            {/* ── ÉTAPE 2 — INFORMATIONS ────────────────────── */}
            {step === 'info' && (
              <div className="rounded-2xl p-6" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
                <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: t.text }}>Vos informations</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Nom complet', key: 'name', type: 'text', placeholder: 'Prénom Nom', required: true },
                    { label: 'Téléphone', key: 'phone', type: 'tel', placeholder: '+221 70 000 00 00', required: true },
                    { label: 'Email (optionnel)', key: 'email', type: 'email', placeholder: 'votre@email.com', required: false },
                  ].map(({ label, key, type, placeholder, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: t.textMuted }}>
                        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      <input type={type} value={form[key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = t.inputFocus)}
                        onBlur={e => (e.currentTarget.style.borderColor = t.inputBorder)}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: t.textMuted }}>
                      Adresse de livraison (optionnel)
                    </label>
                    <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                      placeholder="Quartier, ville..." rows={2}
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={e => (e.currentTarget.style.borderColor = t.inputFocus)}
                      onBlur={e => (e.currentTarget.style.borderColor = t.inputBorder)}
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-4 text-sm rounded-lg px-4 py-2" style={{ background: t.error, color: t.errorText }}>{error}</p>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep('cart')}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ background: t.backBtn, border: `1px solid ${t.backBtnBorder}`, color: t.textMuted }}>
                    ← Retour
                  </button>
                  <button onClick={() => {
                    if (!form.name || !form.phone) { setError('Veuillez remplir votre nom et numéro de téléphone.'); return }
                    setError(''); setStep('payment')
                  }}
                    className="flex-1 py-3 rounded-xl font-medium transition-all"
                    style={{ background: t.accentBtn, color: t.accentBtnText }}>
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 3 — PAIEMENT ────────────────────────── */}
            {step === 'payment' && (
              <div className="rounded-2xl p-6" style={{ background: t.card, border: t.cardBorder, boxShadow: t.cardShadow }}>
                <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: t.text }}>Mode de paiement</h2>

                <div className="space-y-3 mb-6">
                  {/* Wave */}
                  <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: paymentMethod === 'wave' ? t.waveActive : t.payCard,
                      border: `2px solid ${paymentMethod === 'wave' ? t.waveBorder : t.payBorder}`,
                    }}>
                    <input type="radio" value="wave" checked={paymentMethod === 'wave'} onChange={() => setPaymentMethod('wave')} className="sr-only" />
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">W</div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: t.text }}>Wave 💙</p>
                      <p className="text-xs" style={{ color: t.textMuted }}>Paiement sécurisé par Wave Mobile Money</p>
                    </div>
                    {paymentMethod === 'wave' && <span className="text-blue-500">✓</span>}
                  </label>

                  {/* Orange Money */}
                  <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: paymentMethod === 'orange_money' ? t.omActive : t.payCard,
                      border: `2px solid ${paymentMethod === 'orange_money' ? t.omBorder : t.payBorder}`,
                    }}>
                    <input type="radio" value="orange_money" checked={paymentMethod === 'orange_money'} onChange={() => setPaymentMethod('orange_money')} className="sr-only" />
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">OM</div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: t.text }}>Orange Money 🟠</p>
                      <p className="text-xs" style={{ color: t.textMuted }}>Paiement via Orange Money Sénégal</p>
                    </div>
                    {paymentMethod === 'orange_money' && <span className="text-orange-500">✓</span>}
                  </label>

                  {/* WhatsApp */}
                  <label className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: paymentMethod === 'whatsapp' ? t.waActive : t.payCard,
                      border: `2px solid ${paymentMethod === 'whatsapp' ? t.waBorder : t.payBorder}`,
                    }}>
                    <input type="radio" value="whatsapp" checked={paymentMethod === 'whatsapp'} onChange={() => setPaymentMethod('whatsapp')} className="sr-only" />
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: t.text }}>WhatsApp 💬</p>
                      <p className="text-xs" style={{ color: t.textMuted }}>Commandez et payez via WhatsApp</p>
                    </div>
                    {paymentMethod === 'whatsapp' && <span className="text-green-500">✓</span>}
                  </label>
                </div>

                {error && (
                  <p className="mb-4 text-sm rounded-lg px-4 py-2" style={{ background: t.error, color: t.errorText }}>{error}</p>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep('info')}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ background: t.backBtn, border: `1px solid ${t.backBtnBorder}`, color: t.textMuted }}>
                    ← Retour
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: t.accentBtn, color: t.accentBtnText }}>
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Traitement...
                      </>
                    ) : 'Payer maintenant'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RÉSUMÉ ──────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 sticky top-24"
              style={{ background: t.summary, border: `1px solid ${t.summaryBorder}`, boxShadow: t.cardShadow }}>
              <h3 className="font-serif text-lg font-bold mb-4" style={{ color: t.text }}>Résumé</h3>

              {cart.length === 0 ? (
                <p className="text-sm" style={{ color: t.textMuted }}>Panier vide</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => {
                    const p = findProduct(item.productId)
                    if (!p) return null
                    const price = getItemPrice(p)
                    return (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="truncate mr-2" style={{ color: t.textMuted }}>{p.name} ×{item.quantity}</span>
                        <span className="font-medium whitespace-nowrap" style={{ color: t.text }}>
                          {price === 0 ? '—' : `${(price * item.quantity).toLocaleString('fr-FR')} ${currency}`}
                        </span>
                      </div>
                    )
                  })}
                  <div className="pt-3" style={{ borderTop: `1px solid ${t.divider}` }}>
                    <div className="flex justify-between font-bold">
                      <span style={{ color: t.text }}>Total</span>
                      <span style={{ color: t.accent }}>
                        {total === 0 ? 'Sur demande' : `${total.toLocaleString('fr-FR')} ${currency}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 space-y-2 text-xs" style={{ borderTop: `1px solid ${t.divider}`, color: t.textMuted }}>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fdfaf7' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#9e3d58', borderTopColor: 'transparent' }} />
          <p style={{ color: '#9ca3af' }}>Chargement...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
