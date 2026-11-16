import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'

// List + delete media
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const items = await db.media.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    return NextResponse.json({ items })
  } catch (e: any) {
     
    console.error('[admin/media] GET error:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
    const media = await db.media.findUnique({ where: { id } })
    if (!media) return NextResponse.json({ error: 'Introuvable.' }, { status: 404 })
    if (media.url.startsWith('/uploads/')) {
      const { getStorage } = await import('@/lib/storage')
      const storage = getStorage()
      if (storage.delete) await storage.delete(media.url).catch(() => {})
    }
    await db.media.delete({ where: { id } })
    await logAction(user.id, ACTIONS.MEDIA_DELETE, `id=${id}`)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
     
    console.error('[admin/media] DELETE error:', e)
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
  }
}
