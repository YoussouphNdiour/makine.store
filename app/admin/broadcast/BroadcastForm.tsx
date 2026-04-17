'use client'
import { useState } from 'react'

const TEMPLATES = [
  {
    label: '🎉 Nouvelle collection',
    text: '✨ Bonjour {nom} !\n\nMakiné lance sa nouvelle collection !\nDécouvrez nos gammes corporelles, soins et savons artisanaux.\n\n🛍️ Commander : https://makine.store\n📞 +221 71 058 17 11\n\n_Makiné — L\'élégance commence par une peau douce_ 🌸'
  },
  {
    label: '💰 Promo Flash',
    text: '🔥 PROMO FLASH {nom} !\n\nOffre limitée sur nos meilleures ventes.\n📦 Commandez maintenant sur WhatsApp ou notre site.\n\n👇 Répondez *1* pour voir le catalogue\n🌐 https://makine.store\n\n_Makiné_ 🌸'
  },
  {
    label: '📦 Nouveaux produits',
    text: '🌟 {nom}, découvrez nos nouveautés !\n\nCoffret Pearl Skin, Savon Wekh Tal et bien plus...\n\n👇 Tapez *1* pour voir le catalogue complet\n🌐 https://makine.store/v2/boutique\n\n_Makiné Cosmétiques_ ✨'
  },
  {
    label: '💼 Gros revendeurs',
    text: '💼 Bonjour {nom},\n\nNous proposons des tarifs revendeurs exclusifs !\nContactez-nous pour nos offres grossiste.\n\n📞 +221 71 058 17 11\n📧 fatimata6590@gmail.com\n\n_Makiné — Cosmétiques Naturels_ 🌸'
  },
]

export function BroadcastForm({ adminKey }: { adminKey: string }) {
  const [message, setMessage] = useState('')
  const [segment, setSegment] = useState<'all' | 'sn' | 'fr' | 'wholesale'>('all')
  const [preview, setPreview] = useState<{ count: number; recipients: Array<{phone:string;name:string}> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [error, setError] = useState('')

  async function handlePreview() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/broadcast?key=${adminKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, segment, preview: true }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setPreview(data)
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  async function handleSend() {
    if (!preview) return
    if (!confirm(`Envoyer à ${preview.count} destinataires ?`)) return
    setLoading(true)
    setError('')
    setPreview(null)
    try {
      const res = await fetch(`/api/admin/broadcast?key=${adminKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, segment, preview: false }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div>
        <p className="text-sm font-medium text-rose-text mb-3">Templates prêts à l&apos;emploi :</p>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.label}
              onClick={() => setMessage(t.text)}
              className="text-left p-3 rounded-xl border border-rose-blush hover:border-rose-deep hover:bg-rose-petal transition-colors text-sm"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Segment */}
      <div>
        <p className="text-sm font-medium text-rose-text mb-2">Destinataires :</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all',       label: '🌍 Tous les clients' },
            { value: 'sn',        label: '🇸🇳 Sénégal uniquement' },
            { value: 'fr',        label: '🇫🇷 France uniquement' },
            { value: 'wholesale', label: '💼 Grossistes' },
          ].map(s => (
            <button
              key={s.value}
              onClick={() => { setSegment(s.value as typeof segment); setPreview(null) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                segment === s.value
                  ? 'bg-rose-deep text-white border-rose-deep'
                  : 'bg-white text-rose-muted border-rose-blush hover:border-rose-deep'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-rose-text">Message :</p>
          <span className="text-xs text-rose-muted">Utilisez <code className="bg-rose-petal px-1 rounded">{'{nom}'}</code> pour personnaliser</span>
        </div>
        <textarea
          value={message}
          onChange={e => { setMessage(e.target.value); setPreview(null); setResult(null) }}
          placeholder="Bonjour {nom} ! ..."
          rows={8}
          className="w-full border border-rose-blush rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-rose-deep resize-none"
        />
        <p className="text-xs text-rose-muted mt-1">{message.length} caractères</p>
      </div>

      {/* Aperçu message */}
      {message && (
        <div className="bg-[#DCF8C6] rounded-2xl rounded-br-sm p-4 max-w-sm ml-auto border border-green-200">
          <p className="text-xs text-green-800 font-medium mb-1">Aperçu WhatsApp</p>
          <p className="text-sm whitespace-pre-line text-gray-800">
            {message.replace(/\{nom\}/gi, 'Fatou')}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      {/* Preview result */}
      {preview && (
        <div className="bg-rose-petal border border-rose-blush rounded-2xl p-4">
          <p className="font-semibold text-rose-wine mb-2">
            📊 {preview.count} destinataires trouvés
          </p>
          <div className="space-y-1 mb-3">
            {preview.recipients.map(r => (
              <p key={r.phone} className="text-xs text-rose-muted">
                👤 {r.name} — {r.phone}
                {preview.recipients.indexOf(r) === 4 && preview.count > 5 && (
                  <span className="ml-2 text-rose-medium">+{preview.count - 5} autres...</span>
                )}
              </p>
            ))}
          </div>
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full bg-rose-deep text-white py-3 rounded-xl font-semibold hover:bg-rose-wine transition-colors disabled:opacity-50"
          >
            {loading ? 'Envoi en cours...' : `✅ Confirmer l'envoi à ${preview.count} personnes`}
          </button>
        </div>
      )}

      {/* Send result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="font-semibold text-green-800 mb-1">✅ Envoi terminé !</p>
          <p className="text-sm text-green-700">
            {result.sent} messages envoyés • {result.failed} échec(s) • {result.total} total
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={loading || !message.trim()}
          className="flex-1 border border-rose-deep text-rose-deep py-3 rounded-xl font-medium hover:bg-rose-petal transition-colors disabled:opacity-40"
        >
          {loading && !preview ? '⏳ Chargement...' : '👁️ Prévisualiser les destinataires'}
        </button>
      </div>
    </div>
  )
}
