import fs from 'fs'; import path from 'path'
export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public/images/shooting')
    if (!fs.existsSync(dir)) return Response.json([])
    const files = fs.readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map(f => `/images/shooting/${f}`)
    return Response.json(files)
  } catch { return Response.json([]) }
}
