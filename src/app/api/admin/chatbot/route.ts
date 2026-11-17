import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidateForModel } from '@/lib/revalidate'
import { logAction, ACTIONS } from '@/lib/audit'

export const runtime = 'nodejs'

// GET: list model configs + knowledge chunks
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'reindex') {
      await reindexKnowledge()
      await logAction(user.id, ACTIONS.CHATBOT_REINDEX, 'knowledge')
      return NextResponse.json({ ok: true, message: 'Base de connaissances réindexée.' })
    }

    const [configs, chunks] = await Promise.all([
      db.chatbotModelConfig.findMany({ orderBy: { order: 'asc' } }),
      db.chatbotKnowledge.findMany({ orderBy: { source: 'asc' } }),
    ])
    return NextResponse.json({ configs, chunks })
  } catch (e: any) {
     
    console.error('[admin/chatbot] GET error:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// POST: create or update model config
export async function POST(request: NextRequest) {
  try {
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
    await logAction(user.id, ACTIONS.CHATBOT_CONFIG_CREATE, `model=${item.model}`)
    return NextResponse.json({ item })
  } catch (e: any) {
     
    console.error('[admin/chatbot] POST error:', e)
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 })
  }
}

// PATCH: update config
export async function PATCH(request: NextRequest) {
  try {
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
    await logAction(user.id, ACTIONS.CHATBOT_CONFIG_UPDATE, `id=${body.id}`)
    return NextResponse.json({ item })
  } catch (e: any) {
     
    console.error('[admin/chatbot] PATCH error:', e)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 })
  }
}

// DELETE: remove config
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
    await db.chatbotModelConfig.delete({ where: { id } })
    revalidateForModel('ChatbotModelConfig')
    await logAction(user.id, ACTIONS.CHATBOT_CONFIG_DELETE, `id=${id}`)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
     
    console.error('[admin/chatbot] DELETE error:', e)
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 })
  }
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
