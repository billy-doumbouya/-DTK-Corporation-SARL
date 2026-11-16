import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getStorage, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/storage'
import { db } from '@/lib/db'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const alt = (formData.get('alt') as string) || ''

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier.' }, { status: 400 })
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type non autorisé. Formats acceptés : ${ACCEPTED_IMAGE_TYPES.join(', ')}.` },
        { status: 400 }
      )
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${Math.round(MAX_IMAGE_SIZE / 1024 / 1024)} Mo).` },
        { status: 400 }
      )
    }

    if (!alt.trim()) {
      return NextResponse.json(
        { error: 'Le texte alternatif est obligatoire (accessibilité).' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const storage = getStorage()
    const result = await storage.save(buffer, file.type, file.name)

    const media = await db.media.create({
      data: {
        url: result.url,
        alt: alt.trim(),
        filename: result.filename,
        mimeType: result.mimeType,
        size: result.size,
        source: 'upload',
      },
    })

    await logAction(user.id, ACTIONS.MEDIA_UPLOAD, `file=${result.filename}`)
    return NextResponse.json({ media })
  } catch (e: any) {
     
    console.error('[upload] error:', e)
    return NextResponse.json({ error: 'Erreur lors de l’upload.' }, { status: 500 })
  }
}
