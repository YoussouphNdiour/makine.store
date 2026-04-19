'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import NavV3 from '@/components/NavV3'

const ACCENT     = '#d4607a'
const ACCENT_RGB = '212,96,122'
const WA         = '221710581711'

const CONTACTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
    label: 'WhatsApp',
    value: '+221 71 058 17 11',
    href: `https://wa.me/${WA}`,
    color: '#4ade80',
    colorRgb: '74,222,128',
    external: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: 'Téléphone',
    value: '+221 71 058 17 11',
    href: 'tel:+221710581711',
    color: ACCENT,
    colorRgb: ACCENT_RGB,
    external: false,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: 'E-mail',
    value: 'contact@makine.store',
    href: 'mailto:contact@makine.store',
    color: ACCENT,
    colorRgb: ACCENT_RGB,
    external: false,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: 'Localisation',
    value: 'Dakar, Sénégal · Livraison France',
    href: null,
    color: ACCENT,
    colorRgb: ACCENT_RGB,
    external: false,
  },
]

const HOURS = [
  { day: 'Lun – Ven', time: '09h00 – 18h00' },
  { day: 'Samedi',    time: '10h00 – 16h00' },
  { day: 'Dimanche',  time: 'WhatsApp seulement' },
]

const FAQS = [
  { q: 'Quels sont les délais de livraison ?', a: 'Dakar : 24–48h. Autres villes du Sénégal : 3–5 jours. France & Europe : 7–14 jours selon le transporteur.' },
  { q: 'Proposez-vous la vente en gros ?', a: 'Oui ! Contactez-nous via WhatsApp ou par e-mail pour obtenir nos tarifs revendeurs et les conditions de commande en gros.' },
  { q: 'Vos produits sont-ils naturels ?', a: 'Tous nos soins sont formulés à base d\'ingrédients naturels, sans sulfates ni parabènes. Composants listés sur chaque produit.' },
  { q: 'Puis-je retourner un produit ?', a: 'En cas de problème avec votre commande, contactez-nous dans les 7 jours. Nous trouverons ensemble la meilleure solution.' },
]

export default function ContactV3() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = encodeURIComponent(
      `Nom: ${form.name}\nEmail: ${form.email}\nObjet: ${form.subject}\n\n${form.message}`
    )
    window.open(`https://wa.me/${WA}?text=${msg}`, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div style={{ background: '#06060e', color: '#f0ede8', minHeight: '100vh' }}>
      <NavV3 />

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ paddingTop: '120px', paddingBottom: '64px' }}>
        {/* bg glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: '40%', height: '60%',
            background: `radial-gradient(ellipse, rgba(${ACCENT_RGB},0.07) 0%, transparent 70%)` }} />
          <div style={{ position: 'absolute', bottom: '0%', right: '10%', width: '35%', height: '50%',
            background: `radial-gradient(ellipse, rgba(${ACCENT_RGB},0.04) 0%, transparent 70%)` }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <div className="flex items-end gap-3 mb-4">
              <span className="w-8 h-px block" style={{ background: ACCENT }} />
              <p className="text-xs font-semibold tracking-[0.25em] uppercase" style={{ color: ACCENT }}>Contact</p>
            </div>
            <h1 className="font-serif font-bold mb-4"
              style={{ fontSize: 'clamp(2.8rem,8vw,5.5rem)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Parlons-nous
            </h1>
            <p className="text-base max-w-xl" style={{ color: 'rgba(240,237,232,0.45)', lineHeight: 1.7 }}>
              Une question, une commande, ou simplement l&rsquo;envie d&rsquo;en savoir plus sur nos soins naturels —
              notre équipe vous répond rapidement.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">

        {/* ── TOP ROW: contacts + hours ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

          {/* Contact cards */}
          {CONTACTS.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              {c.href ? (
                <a
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noopener noreferrer' : undefined}
                  className="group flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 block"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid rgba(${c.colorRgb},0.15)`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = `rgba(${c.colorRgb},0.06)`
                    ;(e.currentTarget as HTMLElement).style.borderColor = `rgba(${c.colorRgb},0.3)`
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = `rgba(${c.colorRgb},0.15)`
                  }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `rgba(${c.colorRgb},0.12)`, color: c.color }}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'rgba(240,237,232,0.35)' }}>{c.label}</p>
                    <p className="text-sm font-semibold" style={{ color: c.color }}>{c.value}</p>
                  </div>
                </a>
              ) : (
                <div className="flex items-start gap-4 p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${c.colorRgb},0.15)` }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `rgba(${c.colorRgb},0.12)`, color: c.color }}>
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'rgba(240,237,232,0.35)' }}>{c.label}</p>
                    <p className="text-sm font-semibold" style={{ color: 'rgba(240,237,232,0.7)' }}>{c.value}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="p-5 rounded-2xl lg:col-span-3"
            style={{ background: `rgba(${ACCENT_RGB},0.04)`, border: `1px solid rgba(${ACCENT_RGB},0.12)` }}
          >
            <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: `rgba(${ACCENT_RGB},0.6)` }}>
              Horaires de disponibilité
            </p>
            <div className="flex flex-wrap gap-x-12 gap-y-3">
              {HOURS.map(h => (
                <div key={h.day} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ACCENT }} />
                  <span className="text-sm" style={{ color: 'rgba(240,237,232,0.5)' }}>{h.day}</span>
                  <span className="text-sm font-semibold" style={{ color: '#f0ede8' }}>{h.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── MAIN CONTENT: form + FAQ ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── FORM ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-px block" style={{ background: ACCENT }} />
              <h2 className="font-serif font-bold text-2xl" style={{ letterSpacing: '-0.02em' }}>Nous écrire</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'rgba(240,237,232,0.35)' }}>
                    Nom
                  </label>
                  <input
                    type="text" required placeholder="Votre nom"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid rgba(255,255,255,0.08)`,
                      color: '#f0ede8',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = `rgba(${ACCENT_RGB},0.4)`)}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'rgba(240,237,232,0.35)' }}>
                    E-mail
                  </label>
                  <input
                    type="email" required placeholder="Votre e-mail"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#f0ede8',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = `rgba(${ACCENT_RGB},0.4)`)}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'rgba(240,237,232,0.35)' }}>
                  Objet
                </label>
                <input
                  type="text" placeholder="Objet de votre message"
                  value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f0ede8',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = `rgba(${ACCENT_RGB},0.4)`)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: 'rgba(240,237,232,0.35)' }}>
                  Message
                </label>
                <textarea
                  required rows={6} placeholder="Décrivez votre demande…"
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f0ede8',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = `rgba(${ACCENT_RGB},0.4)`)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-sm font-bold transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                style={sent
                  ? { background: '#22c55e', color: '#fff' }
                  : { background: ACCENT, color: '#fff' }}
              >
                {sent ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Message envoyé !</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5" /></svg> Envoyer via WhatsApp</>
                )}
              </button>

              <p className="text-xs text-center" style={{ color: 'rgba(240,237,232,0.25)' }}>
                Votre message sera transmis directement sur WhatsApp
              </p>
            </form>
          </motion.div>

          {/* ── FAQ ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-px block" style={{ background: ACCENT }} />
              <h2 className="font-serif font-bold text-2xl" style={{ letterSpacing: '-0.02em' }}>Questions fréquentes</h2>
            </div>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: openFaq === i ? `rgba(${ACCENT_RGB},0.05)` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${openFaq === i ? `rgba(${ACCENT_RGB},0.2)` : 'rgba(255,255,255,0.07)'}`,
                  }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold pr-4" style={{ color: openFaq === i ? ACCENT : '#f0ede8' }}>
                      {faq.q}
                    </span>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        background: openFaq === i ? `rgba(${ACCENT_RGB},0.15)` : 'rgba(255,255,255,0.05)',
                        color: openFaq === i ? ACCENT : 'rgba(240,237,232,0.4)',
                        transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      }}>
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,237,232,0.55)' }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-8 p-6 rounded-2xl" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#4ade80' }}>Réponse rapide garantie</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(240,237,232,0.4)' }}>
                Pour une réponse immédiate, écrivez-nous directement sur WhatsApp.
              </p>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Ouvrir WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 flex items-center justify-between"
        style={{ borderTop: `1px solid rgba(${ACCENT_RGB},0.1)` }}>
        <Link href="/v3" className="text-sm transition-colors hover:text-[#d4607a]"
          style={{ color: 'rgba(240,237,232,0.3)' }}>← Makiné</Link>
        <p className="text-xs" style={{ color: 'rgba(240,237,232,0.15)' }}>© {new Date().getFullYear()} Makiné</p>
        <Link href="/v3/boutique" className="text-sm transition-colors hover:text-[#d4607a]"
          style={{ color: 'rgba(240,237,232,0.3)' }}>Boutique →</Link>
      </footer>
    </div>
  )
}
