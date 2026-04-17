'use client'
import { useState } from 'react'

type Item = { name: string; quantity: number; price: number }
type Props = { orderId: string; items: Item[]; currency: string }

export function OrderDetail({ orderId: _orderId, items, currency }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-rose-deep hover:underline"
      >
        {open ? '▲ Masquer' : '▼ Détails'}
      </button>
      {open && (
        <div className="mt-2 bg-rose-snow rounded-xl p-3 space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs text-rose-muted">
              <span>{item.name} ×{item.quantity}</span>
              <span className="font-medium text-rose-text">
                {(item.price * item.quantity).toLocaleString('fr-FR')} {currency}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
