import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

// List + delete media
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const items = await db.media.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  return NextResponse.json({ items })
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
  const media = await db.media.findUnique({ where: { id } })
  if (!media) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })
  // Delete from storage if local
  if (media.url.startsWith('/uploads/')) {
    const { getStorage } = await import('@/lib/storage')
    const storage = getStorage()
    if (storage.delete) await storage.delete(media.url).catch(() => {})
  }
  await db.media.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
