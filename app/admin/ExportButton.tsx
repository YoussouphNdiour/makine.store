'use client'

export function ExportButton({ adminKey }: { adminKey: string }) {
  return (
    <a
      href={`/api/admin/export?key=${adminKey}`}
      download
      className="inline-flex items-center gap-2 bg-rose-deep text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-wine transition-colors"
    >
      ↓ Exporter CSV
    </a>
  )
}
