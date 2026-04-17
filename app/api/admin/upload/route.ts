import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key')
    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return Response.json({ error: 'Aucun fichier' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif']
    if (!allowed.includes(ext)) {
      return Response.json({ error: 'Format non autorisé' }, { status: 400 })
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'images', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const bytes = await file.arrayBuffer()
    await writeFile(join(uploadDir, filename), Buffer.from(bytes))

    return Response.json({ url: `/images/uploads/${filename}` })
  } catch (err) {
    console.error('[API Upload]', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
