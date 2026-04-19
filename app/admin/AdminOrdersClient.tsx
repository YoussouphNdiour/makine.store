'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { RefundButton, MarkDeliveredButton, ConfirmOrderButton, VerifyPaymentButton } from './AdminActions'
import { OrderDetail } from './OrderDetail'

// ── Theme tokens (mirrors AdminShell) ─────────────────────────────────────────
const THEMES = {
  dark: {
    card:        'rgba(255,255,255,0.04)',
    cardBorder:  'rgba(255,255,255,0.08)',
    text:        '#f0ede8',
    textMuted:   '#8a8498',
    accent:      '#d4607a',
    accentRgb:   '212,96,122',
    tabActive:   'rgba(212,96,122,0.18)',
    tabBorder:   '#d4607a',
    tabInactive: 'rgba(255,255,255,0.04)',
    row:         'rgba(255,255,255,0.02)',
    rowHover:    'rgba(255,255,255,0.05)',
    divider:     'rgba(255,255,255,0.06)',
    inputBg:     'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.12)',
    codeBg:      'rgba(255,255,255,0.08)',
    badge: {
      paid:      { bg: 'rgba(74,222,128,0.15)',  text: '#4ade80' },
      pending:   { bg: 'rgba(250,204,21,0.15)',  text: '#fbbf24' },
      confirmed: { bg: 'rgba(96,165,250,0.15)',  text: '#60a5fa' },
      refunded:  { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
      failed:    { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
      new:       { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' },
      shipped:   { bg: 'rgba(129,140,248,0.15)', text: '#818cf8' },
      delivered: { bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
      cancelled: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
    },
  },
  light: {
    card:        '#fff',
    cardBorder:  'rgba(0,0,0,0.06)',
    text:        '#1a0a12',
    textMuted:   '#9a7080',
    accent:      '#9e3d58',
    accentRgb:   '158,61,88',
    tabActive:   'rgba(158,61,88,0.1)',
    tabBorder:   '#9e3d58',
    tabInactive: 'rgba(0,0,0,0.03)',
    row:         'transparent',
    rowHover:    'rgba(158,61,88,0.03)',
    divider:     'rgba(0,0,0,0.06)',
    inputBg:     '#fff',
    inputBorder: 'rgba(158,61,88,0.2)',
    codeBg:      'rgba(158,61,88,0.06)',
    badge: {
      paid:      { bg: '#dcfce7', text: '#166534' },
      pending:   { bg: '#fef9c3', text: '#854d0e' },
      confirmed: { bg: '#dbeafe', text: '#1e40af' },
      refunded:  { bg: '#f3e8ff', text: '#6b21a8' },
      failed:    { bg: '#fee2e2', text: '#991b1b' },
      new:       { bg: '#f3f4f6', text: '#374151' },
      shipped:   { bg: '#e0e7ff', text: '#3730a3' },
      delivered: { bg: '#d1fae5', text: '#065f46' },
      cancelled: { bg: '#fee2e2', text: '#991b1b' },
    },
  },
}

type Order = {
  id: string
  customerName: string
  customerPhone: string
  address?: string | null
  totalAmount: number
  currency: string
  paymentMethod: string
  paymentStatus: string
  status: string
  whatsappSent: boolean
  createdAt: string
  items: { id: string; quantity: number; price: number; product: { name: string } }[]
}

const PAYMENT_TABS = [
  { key: 'all',       label: 'Toutes',              icon: '◉' },
  { key: 'pending',   label: 'En attente',           icon: '⏳' },
  { key: 'paid',      label: 'Payées',               icon: '✅' },
  { key: 'confirmed', label: 'Confirmées',            icon: '📦' },
  { key: 'wave',      label: 'Wave',                 icon: '💙' },
]

const STATUS_TABS = [
  { key: 'all',       label: 'Tous' },
  { key: 'new',       label: 'Nouveau' },
  { key: 'confirmed', label: 'Confirmé' },
  { key: 'shipped',   label: 'Expédié' },
  { key: 'delivered', label: 'Livré' },
  { key: 'cancelled', label: 'Annulé' },
]

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function paymentMethodLabel(method: string) {
  if (method === 'wave')         return { label: 'Wave',          color: '#60a5fa', dot: '#3b82f6' }
  if (method === 'orange_money') return { label: 'Orange Money',  color: '#fb923c', dot: '#f97316' }
  if (method === 'whatsapp')     return { label: 'WhatsApp',      color: '#4ade80', dot: '#22c55e' }
  return                                { label: 'Espèces',       color: '#a3a3a3', dot: '#737373' }
}

export default function AdminOrdersClient({
  orders,
  theme,
  adminKey,
  paymentFilter,
  statusFilter,
  adminPassword,
}: {
  orders: Order[]
  theme: 'dark' | 'light'
  adminKey: string
  paymentFilter: string
  statusFilter: string
  adminPassword: string
}) {
  const t = THEMES[theme]
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter(o =>
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.id.slice(-8).toLowerCase().includes(q) ||
      String(Math.round(o.totalAmount)).includes(q)
    )
  }, [orders, search])

  return (
    <div>
      {/* ── Filter tabs: Payment ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-3">
        {PAYMENT_TABS.map(({ key, label, icon }) => {
          const active = paymentFilter === key
          return (
            <Link
              key={key}
              href={`/admin?key=${adminPassword}&filter=${key}&status=${statusFilter}&_theme=${theme}`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={active ? {
                background: t.tabActive,
                color: t.accent,
                border: `1px solid ${t.tabBorder}`,
              } : {
                background: t.tabInactive,
                color: t.textMuted,
                border: `1px solid ${t.cardBorder}`,
              }}
            >
              <span className="text-xs">{icon}</span>
              {label}
            </Link>
          )
        })}
      </div>

      {/* ── Filter tabs: Status + Search ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {STATUS_TABS.map(({ key, label }) => {
            const active = statusFilter === key
            return (
              <Link
                key={key}
                href={`/admin?key=${adminPassword}&filter=${paymentFilter}&status=${key}&_theme=${theme}`}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={active ? {
                  background: t.text,
                  color: theme === 'dark' ? '#06060e' : '#fdfaf7',
                } : {
                  background: t.tabInactive,
                  color: t.textMuted,
                  border: `1px solid ${t.cardBorder}`,
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: t.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher nom, tél, réf…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 rounded-xl text-sm focus:outline-none transition-all w-52"
            style={{
              background: t.inputBg,
              border: `1px solid ${t.inputBorder}`,
              color: t.text,
            }}
          />
        </div>

        <span className="text-xs" style={{ color: t.textMuted }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Orders table ─────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.cardBorder}` }}>
        {/* Table header */}
        <div
          className="grid text-xs font-semibold uppercase tracking-wider px-4 py-3"
          style={{
            gridTemplateColumns: '100px 1fr 160px 120px 130px 110px 40px 90px 130px',
            background: `rgba(${t.accentRgb},0.06)`,
            borderBottom: `1px solid ${t.divider}`,
            color: t.textMuted,
          }}
        >
          <div>Réf</div>
          <div>Client</div>
          <div>Articles</div>
          <div>Montant</div>
          <div>Paiement</div>
          <div>Statut</div>
          <div className="text-center">WA</div>
          <div>Date</div>
          <div>Actions</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: t.textMuted }}>
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">{search ? `Aucun résultat pour « ${search} »` : 'Aucune commande pour ce filtre.'}</p>
          </div>
        ) : filtered.map((order, idx) => {
          const pm = paymentMethodLabel(order.paymentMethod)
          const payBadge = (t.badge as Record<string, { bg: string; text: string }>)[order.paymentStatus] ?? { bg: t.tabInactive, text: t.textMuted }
          const staBadge = (t.badge as Record<string, { bg: string; text: string }>)[order.status] ?? { bg: t.tabInactive, text: t.textMuted }
          const ref = order.id.slice(-8).toUpperCase()
          const ini = initials(order.customerName)

          return (
            <div
              key={order.id}
              className="grid items-center px-4 py-3 transition-colors"
              style={{
                gridTemplateColumns: '100px 1fr 160px 120px 130px 110px 40px 90px 130px',
                background: idx % 2 === 0 ? t.row : 'transparent',
                borderBottom: `1px solid ${t.divider}`,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = t.rowHover)}
              onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? t.row : 'transparent')}
            >
              {/* Ref */}
              <div>
                <code
                  className="text-xs px-2 py-0.5 rounded font-mono tracking-wider"
                  style={{ background: t.codeBg, color: t.accent }}
                >
                  {ref}
                </code>
              </div>

              {/* Client */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: `rgba(${t.accentRgb},0.15)`, color: t.accent }}
                >
                  {ini}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: t.text }}>{order.customerName}</p>
                  <a href={`tel:${order.customerPhone}`} className="text-xs hover:underline" style={{ color: t.textMuted }}>
                    {order.customerPhone}
                  </a>
                </div>
              </div>

              {/* Articles */}
              <div>
                <OrderDetail
                  orderId={order.id}
                  currency={order.currency === 'XOF' ? 'FCFA' : '€'}
                  items={order.items.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.price,
                  }))}
                />
              </div>

              {/* Montant */}
              <div>
                <span className="font-bold text-sm" style={{ color: t.text }}>
                  {order.totalAmount.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs ml-1" style={{ color: t.textMuted }}>
                  {order.currency === 'XOF' ? 'FCFA' : '€'}
                </span>
              </div>

              {/* Paiement */}
              <div className="flex flex-col gap-1.5">
                <span
                  className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium w-fit"
                  style={{ background: payBadge.bg, color: payBadge.text }}
                >
                  {order.paymentStatus}
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: pm.color }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: pm.dot }} />
                  {pm.label}
                </span>
              </div>

              {/* Statut */}
              <div>
                <span
                  className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{ background: staBadge.bg, color: staBadge.text }}
                >
                  {order.status}
                </span>
              </div>

              {/* WA sent */}
              <div className="text-center text-sm">
                {order.whatsappSent
                  ? <span title="WA envoyé">✅</span>
                  : <span title="WA non envoyé" style={{ opacity: 0.3 }}>○</span>}
              </div>

              {/* Date */}
              <div className="text-xs" style={{ color: t.textMuted }}>
                {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                <br />
                <span style={{ color: `rgba(${t.accentRgb},0.7)` }}>
                  {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 min-w-[120px]">
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Bonjour ${order.customerName}, concernant votre commande Makiné #${ref} 🌸`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-xs px-3 py-1 rounded-lg transition-colors font-medium"
                  style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
                >
                  📱 WhatsApp
                </a>

                {order.status === 'new' && (
                  <ConfirmOrderButton orderId={order.id} adminKey={adminKey} />
                )}

                {['wave', 'orange_money'].includes(order.paymentMethod) && order.paymentStatus === 'pending' && (
                  <VerifyPaymentButton orderId={order.id} adminKey={adminKey} />
                )}

                {order.paymentMethod === 'wave' && order.paymentStatus === 'paid' && (
                  <RefundButton orderId={order.id} adminKey={adminKey} />
                )}

                {['confirmed', 'shipped'].includes(order.status) && (
                  <MarkDeliveredButton orderId={order.id} adminKey={adminKey} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
