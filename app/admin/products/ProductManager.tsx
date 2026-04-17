'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type BundleItem = {
  componentId: string
  qty: number
  component: { id: string; name: string; stockQty: number | null }
}

type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  priceXOF: number
  priceXOF2: number | null
  category: string
  badge: string | null
  imageUrl: string | null
  stockQty: number | null
  isBundle: boolean
  inStock: boolean
  wholesale: boolean
  bundleItems: BundleItem[]
}

const BADGES = ['', 'Nouveau', 'Bestseller', 'Pack', 'Promo']

const emptyForm = {
  name: '', slug: '', description: '',
  price: '', priceXOF: '', priceXOF2: '',
  category: '', badge: '',
  imageUrl: '',
  stockQty: '',
  isBundle: false,
  inStock: true, wholesale: false,
}

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function bundleStock(p: Product): number | null {
  if (!p.isBundle || p.bundleItems.length === 0) return p.stockQty
  const available = p.bundleItems
    .map(bi => bi.component.stockQty != null ? Math.floor(bi.component.stockQty / bi.qty) : Infinity)
    .filter(v => v !== Infinity)
  return available.length > 0 ? Math.min(...available) : null
}

export default function ProductManager({
  initialProducts,
  adminKey,
}: {
  initialProducts: Product[]
  adminKey: string
}) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [bundleItems, setBundleItems] = useState<Array<{ componentId: string; qty: number }>>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [newCategory, setNewCategory] = useState('')

  // Catégories extraites dynamiquement
  const existingCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setForm(emptyForm)
    setBundleItems([])
    setEditing(null)
    setModal('add')
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      price: String(p.price), priceXOF: String(p.priceXOF),
      priceXOF2: p.priceXOF2 ? String(p.priceXOF2) : '',
      category: p.category, badge: p.badge ?? '',
      imageUrl: p.imageUrl ?? '',
      stockQty: p.stockQty != null ? String(p.stockQty) : '',
      isBundle: p.isBundle,
      inStock: p.inStock, wholesale: p.wholesale,
    })
    setBundleItems(p.bundleItems.map(bi => ({ componentId: bi.componentId, qty: bi.qty })))
    setEditing(p)
    setModal('edit')
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: f.slug || slugify(name) }))
  }

  function addBundleComponent() {
    const available = products.filter(
      p => p.id !== editing?.id && !p.isBundle && !bundleItems.find(bi => bi.componentId === p.id)
    )
    if (!available.length) return
    setBundleItems(prev => [...prev, { componentId: available[0].id, qty: 1 }])
  }

  function updateBundleItem(index: number, field: 'componentId' | 'qty', value: string | number) {
    setBundleItems(prev => prev.map((bi, i) => i === index ? { ...bi, [field]: value } : bi))
  }

  function removeBundleItem(index: number) {
    setBundleItems(prev => prev.filter((_, i) => i !== index))
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({ ...f, imageUrl: data.url }))
    } catch (err) {
      alert(`❌ Upload échoué : ${String(err)}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        adminKey,
        bundleItems: form.isBundle ? bundleItems : [],
      }
      let res: Response
      if (modal === 'add') {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/products/${editing!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setModal(null)
      router.refresh()
      if (modal === 'add') {
        setProducts(prev => [data, ...prev])
      } else {
        setProducts(prev => prev.map(p => p.id === data.id ? data : p))
      }
    } catch (err) {
      alert(`❌ ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Supprimer "${p.name}" ?`)) return
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.archived) {
        alert('⚠️ Produit archivé (lié à des commandes) — marqué hors stock')
        setProducts(prev => prev.map(p2 => p2.id === p.id ? { ...p2, inStock: false } : p2))
      } else {
        setProducts(prev => prev.filter(p2 => p2.id !== p.id))
      }
    } catch (err) {
      alert(`❌ ${String(err)}`)
    }
  }

  async function toggleStock(p: Product) {
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey, inStock: !p.inStock }),
      })
      if (!res.ok) throw new Error('Erreur')
      setProducts(prev => prev.map(p2 => p2.id === p.id ? { ...p2, inStock: !p.inStock } : p2))
    } catch { alert('❌ Erreur mise à jour stock') }
  }

  const categoryColor: Record<string, string> = {
    gamme: 'bg-purple-100 text-purple-700',
    soins: 'bg-pink-100 text-pink-700',
    huile: 'bg-amber-100 text-amber-700',
    savon: 'bg-teal-100 text-teal-700',
    maquillage: 'bg-rose-100 text-rose-700',
  }

  function getCategoryColor(cat: string) {
    return categoryColor[cat] ?? 'bg-gray-100 text-gray-600'
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-makine-gold flex-1 min-w-[200px]"
        />
        <button
          onClick={openAdd}
          className="bg-makine-gold text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2"
        >
          + Nouveau produit
        </button>
        <span className="text-xs text-gray-400">{filtered.length} produit{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => {
          const stock = bundleStock(p)
          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${p.inStock ? 'border-transparent' : 'border-red-100 opacity-60'}`}
            >
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded-xl mb-3" />
              )}
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(p.category)}`}>
                  {p.category}
                </span>
                <div className="flex gap-1">
                  {p.isBundle && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Gamme</span>}
                  {p.badge && (
                    <span className="text-xs bg-makine-gold/10 text-makine-gold px-2 py-0.5 rounded-full font-medium">
                      {p.badge}
                    </span>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-sm leading-tight mb-1">{p.name}</h3>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{p.description}</p>
              {/* Stock */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-makine-gold">{p.priceXOF.toLocaleString('fr-FR')}</span>
                  <span className="text-xs text-gray-400 ml-1">FCFA</span>
                </div>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  stock === null ? 'bg-gray-100 text-gray-500' :
                  stock <= 0 ? 'bg-red-100 text-red-600' :
                  stock <= 5 ? 'bg-orange-100 text-orange-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {stock === null ? '∞ illimité' : `${stock} en stock`}
                </div>
              </div>
              {/* Bundle components */}
              {p.isBundle && p.bundleItems.length > 0 && (
                <div className="mb-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 space-y-0.5">
                  {p.bundleItems.map(bi => (
                    <div key={bi.componentId} className="flex justify-between">
                      <span>{bi.component.name}</span>
                      <span className="font-medium">×{bi.qty}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStock(p)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                    p.inStock
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                  }`}
                >
                  {p.inStock ? '✅ En stock' : '❌ Épuisé'}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>Aucun produit trouvé.</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-bold">
                {modal === 'add' ? 'Nouveau produit' : `Modifier — ${editing?.name}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">

                {/* Nom */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Nom *</label>
                  <input
                    required value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold"
                    placeholder="Gamme Teint Clair"
                  />
                </div>

                {/* Slug */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Slug (URL)</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold font-mono"
                    placeholder="gamme-teint-clair"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold resize-none"
                  />
                </div>

                {/* Image */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 block mb-1">Photo du produit</label>
                  <div className="flex gap-2 items-start">
                    {form.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.imageUrl} alt="aperçu" className="w-16 h-16 object-cover rounded-xl border border-gray-200 flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                      <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl py-3 cursor-pointer hover:border-makine-gold transition-colors text-sm text-gray-500 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploading ? '⏳ Upload…' : '📁 Choisir une photo'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
                        />
                      </label>
                      <input
                        type="text" value={form.imageUrl}
                        onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-makine-gold font-mono text-gray-500"
                        placeholder="/images/products/mon-produit.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Prix */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Prix (€) *</label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold"
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Prix FCFA *</label>
                  <input
                    required type="number" min="0"
                    value={form.priceXOF}
                    onChange={e => setForm(f => ({ ...f, priceXOF: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold"
                    placeholder="16500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Prix gros FCFA</label>
                  <input
                    type="number" min="0" value={form.priceXOF2}
                    onChange={e => setForm(f => ({ ...f, priceXOF2: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold"
                    placeholder="optionnel"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Quantité en stock</label>
                  <input
                    type="number" min="0" value={form.stockQty}
                    onChange={e => setForm(f => ({ ...f, stockQty: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold"
                    placeholder="vide = illimité"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Catégorie *</label>
                  <input
                    required list="categories-list" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold"
                    placeholder="gamme, soins, savon…"
                  />
                  <datalist id="categories-list">
                    {existingCategories.map(c => <option key={c} value={c} />)}
                    {['gamme', 'soins', 'huile', 'savon', 'maquillage'].filter(c => !existingCategories.includes(c)).map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                {/* Badge */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Badge</label>
                  <select
                    value={form.badge}
                    onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-makine-gold bg-white"
                  >
                    {BADGES.map(b => <option key={b} value={b}>{b || '— aucun —'}</option>)}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" checked={form.inStock}
                      onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))}
                      className="w-4 h-4 accent-makine-gold"
                    />
                    <span className="text-sm">En stock</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" checked={form.wholesale}
                      onChange={e => setForm(f => ({ ...f, wholesale: e.target.checked }))}
                      className="w-4 h-4 accent-makine-gold"
                    />
                    <span className="text-sm">Vente gros</span>
                  </label>
                </div>

                {/* Gamme (bundle) */}
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox" checked={form.isBundle}
                      onChange={e => setForm(f => ({ ...f, isBundle: e.target.checked }))}
                      className="w-4 h-4 accent-indigo-500"
                    />
                    <span className="text-sm font-medium">C&apos;est une gamme (composée de plusieurs produits)</span>
                  </label>

                  {form.isBundle && (
                    <div className="border border-indigo-100 rounded-xl p-3 bg-indigo-50/50 space-y-2">
                      <p className="text-xs text-indigo-600 font-medium mb-2">Produits composants de la gamme :</p>
                      {bundleItems.map((bi, idx) => {
                        const comp = products.find(p => p.id === bi.componentId)
                        return (
                          <div key={idx} className="flex gap-2 items-center">
                            <select
                              value={bi.componentId}
                              onChange={e => updateBundleItem(idx, 'componentId', e.target.value)}
                              className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none"
                            >
                              {products
                                .filter(p => !p.isBundle && (p.id === bi.componentId || !bundleItems.find((b, i) => i !== idx && b.componentId === p.id)))
                                .map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400">×</span>
                              <input
                                type="number" min="1" value={bi.qty}
                                onChange={e => updateBundleItem(idx, 'qty', parseInt(e.target.value) || 1)}
                                className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none"
                              />
                            </div>
                            {comp?.stockQty != null && (
                              <span className="text-xs text-gray-400 whitespace-nowrap">{comp.stockQty} dispo</span>
                            )}
                            <button type="button" onClick={() => removeBundleItem(idx)} className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0">×</button>
                          </div>
                        )
                      })}
                      <button
                        type="button"
                        onClick={addBundleComponent}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        + Ajouter un produit composant
                      </button>
                      {bundleItems.length > 0 && (
                        <p className="text-xs text-gray-400 pt-1">
                          Stock gamme = min(stock composant ÷ quantité composant)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setModal(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit" disabled={loading}
                  className="flex-1 bg-makine-gold text-white py-2.5 rounded-xl text-sm font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : modal === 'add' ? 'Créer le produit' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
