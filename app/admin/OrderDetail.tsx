'use client'
import { useState } from 'react'

type Item = { name: string; quantity: number; price: number }
type Props = { orderId: string; items: Item[]; currency: string }

export function OrderDetail({ orderId: _orderId, items, currency }: Props) {
  const [open, setOpen] = useState(false)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs transition-opacity hover:opacity-70"
        style={{ color: 'inherit', opacity: 0.7 }}
      >
        {items.length} article{items.length > 1 ? 's' : ''} {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-2 rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(128,128,128,0.1)' }}>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs gap-2">
              <span style={{ opacity: 0.8 }}>{item.name} ×{item.quantity}</span>
              <span className="font-medium whitespace-nowrap">
                {(item.price * item.quantity).toLocaleString('fr-FR')} {currency}
              </span>
            </div>
          ))}
          <div className="border-t pt-1.5 mt-1 flex justify-between text-xs font-semibold" style={{ borderColor: 'rgba(128,128,128,0.2)' }}>
            <span>Total</span>
            <span>{total.toLocaleString('fr-FR')} {currency}</span>
          </div>
        </div>
      )}
    </div>
  )
}
