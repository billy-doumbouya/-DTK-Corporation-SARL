import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'

export const runtime = 'nodejs'

// GET: list model configs + knowledge chunks
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'reindex') {
    await reindexKnowledge()
    return NextResponse.json({ ok: true, message: 'Base de connaissances réindexée.' })
  }

  const [configs, chunks] = await Promise.all([
    db.chatbotModelConfig.findMany({ orderBy: { order: 'asc' } }),
    db.chatbotKnowledge.findMany({ orderBy: { source: 'asc' } }),
  ])
  return NextResponse.json({ configs, chunks })
}

// POST: create or update model config
export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const data: any = {
    provider: String(body.provider || 'zai'),
    model: String(body.model || 'default'),
    order: Number(body.order) || 0,
    enabled: body.enabled !== false,
  }
  const item = await db.chatbotModelConfig.create({ data })
  revalidateForModel('ChatbotModelConfig')
  return NextResponse.json({ item })
}

// PATCH: update config
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  if (!body.id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
  const data: any = {}
  for (const k of ['provider','model']) {
    if (body[k] !== undefined) data[k] = String(body[k])
  }
  if (body.order !== undefined) data.order = Number(body.order) || 0
  if (body.enabled !== undefined) data.enabled = !!body.enabled
  const item = await db.chatbotModelConfig.update({ where: { id: body.id }, data })
  revalidateForModel('ChatbotModelConfig')
  return NextResponse.json({ item })
}

// DELETE: remove config
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
  await db.chatbotModelConfig.delete({ where: { id } })
  revalidateForModel('ChatbotModelConfig')
  return NextResponse.json({ ok: true })
}

/**
 * Rebuild the ChatbotKnowledge table from current services + FAQ + settings.
 */
async function reindexKnowledge() {
  const [services, faqs, settings] = await Promise.all([
    db.service.findMany(),
    db.faqItem.findMany(),
    db.siteSettings.findUnique({ where: { id: 'singleton' } }),
  ])

  // Clear existing
  await db.chatbotKnowledge.deleteMany()

  // Service chunks
  for (const s of services) {
    await db.chatbotKnowledge.create({
      data: {
        source: `service:${s.slug}`,
        title: s.title,
        content: `${s.title}. ${s.excerpt} Zones d'intervention : ${s.zones || 'non précisées'}.`,
        keywords: `${s.title} ${s.shortTitle || ''} ${s.slug} ${s.zones}`.toLowerCase(),
      },
    })
  }

  // FAQ chunks
  for (const f of faqs) {
    await db.chatbotKnowledge.create({
      data: {
        source: `faq:${f.id}`,
        title: f.question,
        content: `${f.question} ${f.answer}`,
        keywords: f.keywords || '',
      },
    })
  }

  // Settings chunk
  if (settings) {
    await db.chatbotKnowledge.create({
      data: {
        source: 'settings',
        title: 'Identité DTK Corporation',
        content: `DTK Corporation SARL, slogan « ${settings.slogan} ». Zones d'intervention : ${settings.zones}. Domaines : BTP, agro-alimentaire, formation, élevage, froid et sous-traitance.`,
        keywords: 'dtk corporation, slogan, professionnalisme, qualité, satisfaction, guinée',
      },
    })
  }

  revalidateForModel('ChatbotKnowledge')
}
