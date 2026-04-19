'use client'

import { useState, useEffect, useRef } from 'react'

const ACCENT = '#9e3d58'

async function callVerify(orderId: string): Promise<string | null> {
  try {
    const res = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
    const data = await res.json()
    return data.paymentStatus ?? null
  } catch {
    return null
  }
}

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
  const [checking, setChecking] = useState(false)
  const [pollStopped, setPollStopped] = useState(false)
  const attemptsRef = useRef(0)

  const isDigital = paymentMethod === 'wave' || paymentMethod === 'orange_money'

  useEffect(() => {
    if (!isDigital || initialStatus === 'paid') return

    // Poll /api/payment/verify (actively checks Wave/OM API) every 5s, up to 12 times (~60s)
    const interval = setInterval(async () => {
      attemptsRef.current++
      const newStatus = await callVerify(orderId)
      if (newStatus === 'paid') {
        setStatus('paid')
        clearInterval(interval)
        return
      }
      if (attemptsRef.current >= 12) {
        clearInterval(interval)
        setPollStopped(true)
      }
    }, 5000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function manualCheck() {
    if (checking) return
    setChecking(true)
    const newStatus = await callVerify(orderId)
    if (newStatus) setStatus(newStatus)
    setChecking(false)
  }

  if (status === 'paid') {
    return (
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
        ✓ Payé
      </span>
    )
  }

  if (paymentMethod === 'whatsapp') {
    return (
      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        ✓ Commande reçue
      </span>
    )
  }

  if (!isDigital) return null

  return (
    <span className="ml-auto flex items-center gap-2">
      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
        {!pollStopped && <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
        {pollStopped ? 'En attente' : 'Vérification…'}
      </span>
      {pollStopped && (
        <button
          onClick={manualCheck}
          disabled={checking}
          className="text-xs underline transition-opacity"
          style={{ color: ACCENT, opacity: checking ? 0.5 : 1 }}
        >
          {checking ? 'Vérification…' : 'Revérifier'}
        </button>
      )}
    </span>
  )
}
