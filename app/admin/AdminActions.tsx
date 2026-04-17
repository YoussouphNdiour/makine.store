'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RefundButton({ orderId, adminKey }: { orderId: string; adminKey: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRefund() {
    if (!confirm(`Rembourser la commande #${orderId.slice(-8).toUpperCase()} via Wave ?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/payment/wave/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, adminKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      alert(`✅ Remboursement Wave envoyé ! Payout ID : ${data.payoutId}`)
      router.refresh()
    } catch (err) {
      alert(`❌ ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRefund}
      disabled={loading}
      className="w-full text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50"
    >
      {loading ? '...' : '💙 Rembourser'}
    </button>
  )
}

export function MarkDeliveredButton({
  orderId,
  adminKey,
}: {
  orderId: string
  adminKey: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDeliver() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'delivered', adminKey }),
      })
      if (!res.ok) throw new Error('Erreur')
      router.refresh()
    } catch (err) {
      alert(`❌ ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDeliver}
      disabled={loading}
      className="w-full text-xs bg-teal-50 text-teal-600 px-3 py-1 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200 disabled:opacity-50"
    >
      {loading ? '...' : '📬 Livré'}
    </button>
  )
}

export function ConfirmOrderButton({
  orderId,
  adminKey,
}: {
  orderId: string
  adminKey: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!confirm(`Confirmer la commande #${orderId.slice(-8).toUpperCase()} et notifier le client par WhatsApp ?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: 'confirmed',
          paymentStatus: 'paid',
          adminKey,
        }),
      })
      if (!res.ok) throw new Error('Erreur')
      router.refresh()
    } catch (err) {
      alert(`❌ ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="w-full text-xs bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors border border-green-300 disabled:opacity-50 font-medium"
    >
      {loading ? '...' : '✅ Confirmer + WA'}
    </button>
  )
}
