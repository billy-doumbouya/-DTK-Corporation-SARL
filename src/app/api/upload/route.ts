import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { getStorage, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/storage'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const form = await request.formData()
    const file = form.get('file')
    const alt = String(form.get('alt') || '').trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier requis.' }, { status: 400 })
    }
    if (!alt) {
      return NextResponse.json({ error: 'Le texte alternatif est obligatoire.' }, { status: 400 })
    }
    if (alt.length > 300) {
      return NextResponse.json({ error: 'Le texte alternatif est trop long.' }, { status: 400 })
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.type === 'image/svg+xml') {
      return NextResponse.json({ error: 'Format accepté : JPG, PNG ou WebP.' }, { status: 400 })
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'La taille maximale est de 5 Mo.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const webp = await sharp(buffer)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const storage = getStorage()
    const result = await storage.save(webp, 'image/webp', file.name.replace(/\.[^.]+$/, '.webp'))
    const media = await db.media.create({
      data: {
        url: result.url,
        alt,
        filename: result.filename,
        mimeType: 'image/webp',
        size: result.size,
        source: process.env.BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN ? 'vercel' : 'upload',
      },
    })
    await logAction(user.id, ACTIONS.MEDIA_UPLOAD, `id=${media.id}`)

    return NextResponse.json({ ok: true, item: media })
  } catch (error: any) {
    console.error('[upload] error:', error)
    return NextResponse.json({ error: 'Téléversement impossible.' }, { status: 500 })
  }
}
