'use client'

import { useState, useEffect } from 'react'

export default function PaymentStatus({
  orderId,
  initialStatus,
  paymentMethod,
}: {
  orderId: string
  initialStatus: string
  paymentMethod: string
}) {
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    // Only poll if payment is still pending (Wave and Orange Money)
    if (status === 'paid' || !['wave', 'orange_money'].includes(paymentMethod)) return

    let attempts = 0
    const MAX = 20 // poll up to ~60s

    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.paymentStatus === 'paid') {
            setStatus('paid')
            clearInterval(interval)
          }
        }
      } catch {
        // ignore
      }
      if (attempts >= MAX) clearInterval(interval)
    }, 3000)

    return () => clearInterval(interval)
  }, [orderId, paymentMethod, status])

  if (status === 'paid') {
    return (
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        ✓ Payé
      </span>
    )
  }

  // WhatsApp orders are confirmed manually by admin
  if (paymentMethod === 'whatsapp') {
    return (
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        ✓ Commande reçue
      </span>
    )
  }

  return (
    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
      <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
      En attente de confirmation...
    </span>
  )
}
