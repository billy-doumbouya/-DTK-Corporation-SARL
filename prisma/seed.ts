/**
 * DTK Corporation SARL — Seed script.
 * Honnête : seuls les faits connus du PRD sont insérés.
 * Tout ce qui est inconnu (chiffres, certifications, clients, prix, contacts réels)
 * est laissé vide ou marqué comme provisoire.
 *
 * Run: `bun run db:seed`
 */
import { PrismaClient } from '@prisma/client'
import { scrypt, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const db = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`

async function main() {
  console.log('→ Seeding DTK Corporation database…')

  // ─── Permissions & Roles ─────────────────────────────────────────────────
  const PERMISSIONS_LIST = [
    'dashboard.view',
    'requests.read', 'requests.update_status', 'requests.delete', 'requests.export', 'requests.add_note',
    'services.read', 'services.write', 'services.delete',
    'products.read', 'products.write', 'products.delete',
    'formations.read', 'formations.write', 'formations.delete',
    'realisations.read', 'realisations.write', 'realisations.delete',
    'news.read', 'news.write', 'news.delete',
    'slides.read', 'slides.write', 'slides.delete',
    'partners.read', 'partners.write', 'partners.delete',
    'stats.read', 'stats.write', 'stats.delete',
    'engagements.read', 'engagements.write', 'engagements.delete',
    'subcontracting.read', 'subcontracting.write',
    'faq.read', 'faq.write', 'faq.delete',
    'chatbot.read', 'chatbot.write',
    'media.read', 'media.write', 'media.delete',
    'settings.read', 'settings.write',
    'account.password.change',
    'audit.read',
  ]

  const permRecords = []
  for (const action of PERMISSIONS_LIST) {
    const p = await db.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    })
    permRecords.push(p)
  }

  const adminRole = await db.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrateur — tous les droits' },
  })

  // Attach all permissions to admin role
  for (const p of permRecords) {
    await db.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: p.id },
    })
  }

  // ─── Admin user ──────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@dtk.local'
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe123!'
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const u = await db.user.create({
      data: {
        email: adminEmail,
        name: 'Administrateur DTK',
        passwordHash: await hashPassword(adminPassword),
      },
    })
    await db.userRole.create({
      data: { userId: u.id, roleId: adminRole.id },
    })
    console.log(`  → Admin créé : ${adminEmail} (mot de passe : ${adminPassword})`)
  } else {
    // ensure role attached
    await db.userRole.upsert({
      where: { userId_roleId: { userId: existingAdmin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: existingAdmin.id, roleId: adminRole.id },
    })
    console.log(`  → Admin existant conservé : ${adminEmail}`)
  }

  // ─── Site settings ───────────────────────────────────────────────────────
  await db.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      siteName: 'DTK Corporation SARL',
      slogan: 'Professionnalisme, Qualité, Satisfaction',
      email: '',
      phone: '',
      whatsapp: '',
      addressLine: '',
      addressCity: '',
      facebookUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
      zones: 'Conakry, Kankan, Siguiri, Dinguiraye',
      legalName: 'DTK Corporation SARL',
      legalForm: 'SARL',
      legalId: '',
      legalCapital: '',
      legalAddress: '',
      defaultSeoTitle: 'DTK Corporation SARL — BTP, Agro, Formation, Froid',
      defaultSeoDescription:
        'Entreprise guinéenne pluridisciplinaire : BTP, agro-alimentaire, formation, élevage et froid. Professionnalisme, Qualité, Satisfaction.',
      chatbotEnabled: true,
      chatbotWelcome:
        "Bonjour, je suis l'assistant virtuel de DTK Corporation. Comment puis-je vous aider aujourd'hui ?",
      customCursorEnabled: false,
    },
  })

  // ─── Services (6 activités connues) ──────────────────────────────────────
  const services = [
    {
      slug: 'btp',
      title: 'BTP — Bâtiment et Travaux Publics',
      shortTitle: 'BTP',
      excerpt:
        "Construction et rénovation de bâtiments, infrastructures et travaux publics en Guinée, avec un engagement fort sur la qualité et la sécurité.",
      description:
        "DTK Corporation intervient dans le secteur du Bâtiment et des Travaux Publics en Guinée. De la construction neuve à la rénovation, nous accompagnons nos clients sur l'ensemble du cycle projet : étude, exécution, suivi de chantier et livraison.\n\nNos équipes appliquent une politique QHSSE stricte : zéro accident, zéro dommage pour l'environnement, zéro compromis sur la qualité.\n\nContenu provisoire — à compléter par l'administrateur.",
      iconKey: 'FaBuilding',
      coverUrl: UNSPLASH('photo-1503387762-592deb58ef4e'),
      coverAlt: 'Chantier de construction',
      order: 1,
      zones: 'Conakry, Kankan, Siguiri, Dinguiraye',
      features: JSON.stringify([
        'Construction neuve (résidentiel et tertiaire)',
        'Rénovation et réhabilitation',
        'Travaux publics et voirie',
        'Suivi de chantier et contrôle qualité',
      ]),
    },
    {
      slug: 'agro-alimentaire',
      title: 'Agro-alimentaire — Valorisation du riz guinéen',
      shortTitle: 'Agro-alimentaire',
      excerpt:
        "Transformation et valorisation du riz guinéen et des produits agricoles locaux en Haute-Guinée (Dinguiraye, Banora, M'Bonet).",
      description:
        "Notre projet agro-alimentaire vise à transformer et valoriser le riz guinéen ainsi que les produits agricoles locaux en Haute-Guinée, dans les zones de Dinguiraye, Banora et M'Bonet.\n\nL'objectif est de soutenir les producteurs locaux tout en offrant un produit de qualité aux consommateurs guinéens.\n\nContenu provisoire — à compléter par l'administrateur.",
      iconKey: 'FaSeedling',
      coverUrl: UNSPLASH('photo-1574323347407-f5e1ad6d020b'),
      coverAlt: 'Rizière et grains de riz',
      order: 2,
      zones: "Dinguiraye, Banora, M'Bonet (Haute-Guinée)",
      features: JSON.stringify([
        'Transformation du riz guinéen',
        'Valorisation des produits agricoles locaux',
        'Soutien aux producteurs de Haute-Guinée',
      ]),
    },
    {
      slug: 'formation',
      title: 'Formation — Jeunes diplômés et professionnels',
      shortTitle: 'Formation',
      excerpt:
        "Formations de deux à trois mois destinées aux jeunes diplômés et aux professionnels en activité.",
      description:
        "DTK Corporation propose des formations de deux à trois mois, destinées aux jeunes diplômés ainsi qu'aux professionnels en activité souhaitant renforcer leurs compétences.\n\nLes thématiques précises sont définies en fonction des besoins du marché guinéen et des domaines d'activité de l'entreprise.\n\nContenu provisoire — à compléter par l'administrateur.",
      iconKey: 'FaGraduationCap',
      coverUrl: UNSPLASH('photo-1523050854058-8df90110c9f1'),
      coverAlt: 'Session de formation',
      order: 3,
      zones: 'Conakry, Kankan',
      features: JSON.stringify([
        'Durée : 2 à 3 mois',
        'Public : jeunes diplômés et professionnels',
        'Pédagogie pratique',
      ]),
    },
    {
      slug: 'elevage',
      title: 'Élevage',
      shortTitle: 'Élevage',
      excerpt:
        "Activités d'élevage et de valorisation des produits de l'élevage, en soutien à l'économie agricole locale.",
      description:
        "DTK Corporation développe des activités d'élevage et de valorisation des produits qui en découlent, en soutenant l'économie agricole locale guinéenne.\n\nContenu provisoire — à compléter par l'administrateur.",
      iconKey: 'FaPaw',
      coverUrl: UNSPLASH('photo-1500595046743-cd271d694d30'),
      coverAlt: "Animaux d'élevage",
      order: 4,
      zones: 'Guinée',
      features: JSON.stringify([
        "Élevage et suivi sanitaire",
        "Valorisation des produits de l'élevage",
      ]),
    },
    {
      slug: 'froid',
      title: 'Froid — Climatisation : vente, installation, maintenance, dépannage',
      shortTitle: 'Froid & Climatisation',
      excerpt:
        "Vente, installation, maintenance et dépannage de climatisation pour particuliers et professionnels.",
      description:
        "DTK Corporation assure la vente, l'installation, la maintenance et le dépannage de systèmes de climatisation, pour les particuliers comme pour les professionnels.\n\nNos techniciens interviennent rapidement sur l'ensemble des zones d'intervention de l'entreprise.\n\nContenu provisoire — à compléter par l'administrateur.",
      iconKey: 'FaSnowflake',
      coverUrl: UNSPLASH('photo-1581094794329-c8112a89af12'),
      coverAlt: 'Unité de climatisation',
      order: 5,
      zones: 'Conakry, Kankan, Siguiri, Dinguiraye',
      features: JSON.stringify([
        'Vente de climatiseurs',
        'Installation par des techniciens qualifiés',
        'Maintenance préventive et corrective',
        'Dépannage rapide',
      ]),
    },
    {
      slug: 'sous-traitance',
      title: 'Sous-traitance',
      shortTitle: 'Sous-traitance',
      excerpt:
        "DTK Corporation travaille en sous-traitance pour des donneurs d'ordre dans ses domaines d'expertise.",
      description:
        "DTK Corporation peut travailler en sous-traitance pour des donneurs d'ordre dans l'ensemble de ses domaines d'expertise : BTP, agro-alimentaire, formation, élevage et froid.\n\nSi vous souhaitez nous confier une mission, utilisez le formulaire dédié accessible depuis le menu « Sous-traitance ».",
      iconKey: 'FaHandshake',
      coverUrl: UNSPLASH('photo-1521791136064-7986c2920216'),
      coverAlt: "Poignée de main — sous-traitance",
      order: 6,
      isSubcontracting: true,
      zones: 'Guinée',
      features: JSON.stringify([
        'Sous-traitance BTP',
        'Sous-traitance agro-alimentaire',
        'Sous-traitance froid / climatisation',
        'Disponible dans toute la Guinée',
      ]),
    },
  ]

  for (const s of services) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s as any,
    })
  }

  const agro = await db.service.findUnique({ where: { slug: 'agro-alimentaire' } })
  const elevage = await db.service.findUnique({ where: { slug: 'elevage' } })
  const formationService = await db.service.findUnique({ where: { slug: 'formation' } })

  // ─── Products (marqués provisoires) ──────────────────────────────────────
  if (agro) {
    await db.product.upsert({
      where: { slug: 'riz-guineen-transforme-provisoire' },
      update: {},
      create: {
        serviceId: agro.id,
        name: 'Riz guinéen transformé (provisoire)',
        slug: 'riz-guineen-transforme-provisoire',
        excerpt: 'Riz guinéen transformé et valorisé en Haute-Guinée. Contenu provisoire.',
        description:
          "Riz guinéen transformé et valorisé dans nos installations de Haute-Guinée. Détails produits (conditionnement, calibre, disponibilité) à renseigner par l'administrateur.",
        unit: '',
        isPublished: false,
        order: 1,
        imageUrl: UNSPLASH('photo-1516469846512-82362340c1d5', 800),
        imageAlt: 'Sac de riz',
      },
    })
  }

  if (elevage) {
    await db.product.upsert({
      where: { slug: 'produits-elevage-provisoire' },
      update: {},
      create: {
        serviceId: elevage.id,
        name: 'Produits de l’élevage (provisoire)',
        slug: 'produits-elevage-provisoire',
        excerpt: 'Produits issus de l’élevage. Contenu provisoire.',
        description:
          "Produits issus de notre activité d'élevage. Détails à renseigner par l'administrateur.",
        unit: '',
        isPublished: false,
        order: 1,
        imageUrl: UNSPLASH('photo-1546969703-9230a8a9a4c1', 800),
        imageAlt: "Produits de l'élevage",
      },
    })
  }

  // ─── Formations (liées au service formation) ─────────────────────────────
  if (formationService) {
    await db.formation.upsert({
      where: { slug: 'formation-provisoire-btp-agro' },
      update: {},
      create: {
        serviceId: formationService.id,
        title: 'Formation professionnelle (provisoire)',
        slug: 'formation-provisoire-btp-agro',
        excerpt:
          "Formation de 2 à 3 mois pour jeunes diplômés et professionnels. Thématique précise à confirmer.",
        description:
          "Programme de formation de 2 à 3 mois conçu pour les jeunes diplômés et les professionnels en activité. Le contenu détaillé du programme sera publié après validation par l'entreprise.",
        duration: '2 à 3 mois',
        audience: 'Jeunes diplômés et professionnels',
        isPublished: false,
        order: 1,
        imageUrl: UNSPLASH('photo-1524178232363-1e53b884a7d5', 1200),
        imageAlt: 'Salle de formation',
      },
    })
  }

  // ─── Slides accueil (3 slides) ───────────────────────────────────────────
  const slides = [
    {
      title: 'Professionnalisme, Qualité, Satisfaction',
      subtitle:
        'Une entreprise guinéenne pluridisciplinaire au service de votre projet : BTP, agro-alimentaire, formation, élevage et froid.',
      buttonText: 'Découvrir nos services',
      buttonHref: '/services',
      imageUrl: UNSPLASH('photo-1503387762-592deb58ef4e'),
      imageAlt: 'Chantier de construction',
      order: 1,
    },
    {
      title: 'Valorisons le riz guinéen',
      subtitle:
        'Transformation et valorisation des produits agricoles locaux en Haute-Guinée (Dinguiraye, Banora, M\'Bonet).',
      buttonText: 'En savoir plus',
      buttonHref: '/services/agro-alimentaire',
      imageUrl: UNSPLASH('photo-1574323347407-f5e1ad6d020b'),
      imageAlt: 'Rizière',
      order: 2,
    },
    {
      title: 'Froid & Climatisation',
      subtitle:
        'Vente, installation, maintenance et dépannage de climatisation par des techniciens qualifiés.',
      buttonText: 'Demander un dépannage',
      buttonHref: '/contact?type=devis',
      imageUrl: UNSPLASH('photo-1581094794329-c8112a89af12'),
      imageAlt: 'Unité de climatisation',
      order: 3,
    },
  ]
  for (const s of slides) {
    const existing = await db.slide.findFirst({ where: { title: s.title } })
    if (!existing) await db.slide.create({ data: s })
  }

  // ─── Engagements QHSSE ───────────────────────────────────────────────────
  const engagements = [
    {
      title: 'Zéro accident',
      description: "La sécurité de nos équipes et de nos partenaires est notre première priorité.",
      iconKey: 'FaShieldAlt',
      order: 1,
    },
    {
      title: "Zéro dommage pour l'environnement",
      description: "Nous veillons à minimiser l'impact environnemental de chacune de nos opérations.",
      iconKey: 'FaLeaf',
      order: 2,
    },
    {
      title: 'Zéro compromis sur la qualité',
      description: "Chaque livraison respecte nos standards de qualité, sans exception.",
      iconKey: 'FaAward',
      order: 3,
    },
  ]
  for (const e of engagements) {
    const existing = await db.engagement.findFirst({ where: { title: e.title } })
    if (!existing) await db.engagement.create({ data: e })
  }

  // ─── Subcontracting page ─────────────────────────────────────────────────
  await db.subcontractingPage.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      headline: 'Sous-traitance',
      intro:
        "DTK Corporation SARL travaille en sous-traitance pour des donneurs d'ordre dans ses domaines d'expertise : BTP, agro-alimentaire, formation, élevage et froid. Confiez-nous une mission via le formulaire dédié, nous vous répondons rapidement.",
      domains: JSON.stringify([
        'BTP — Bâtiment et Travaux Publics',
        'Agro-alimentaire',
        'Formation',
        'Élevage',
        'Froid / Climatisation',
      ]),
      imageUrl: UNSPLASH('photo-1521791136064-7986c2920216'),
      imageAlt: 'Sous-traitance — collaboration',
    },
  })

  // ─── Partenaires (vides / exemples marqués provisoires) ──────────────────
  // Pas de logos inventés. Table vide, l'admin ajoutera les siens.
  const existingPartners = await db.partner.count()
  if (existingPartners === 0) {
    await db.partner.create({
      data: {
        name: 'Partenaire (à renseigner)',
        logoUrl: '',
        websiteUrl: '',
        isPublished: false,
        order: 1,
      },
    })
  }

  // ─── FAQ ─────────────────────────────────────────────────────────────────
  const faqs = [
    {
      question: "Quels sont les domaines d'intervention de DTK Corporation ?",
      answer:
        "DTK Corporation intervient dans six domaines : BTP (bâtiment et travaux publics), agro-alimentaire (transformation et valorisation du riz guinéen et des produits agricoles locaux en Haute-Guinée), formation, élevage, froid (vente, installation, maintenance et dépannage de climatisation) et sous-traitance.",
      keywords: 'domaines, intervention, services, activités, BTP, agro, formation, élevage, froid',
      order: 1,
    },
    {
      question: "Où DTK Corporation intervient-elle en Guinée ?",
      answer:
        "DTK Corporation intervient principalement à Conakry, Kankan, Siguiri et Dinguiraye. Le projet agro-alimentaire se concentre sur la Haute-Guinée (Dinguiraye, Banora, M'Bonet).",
      keywords: 'zone, ville, Conakry, Kankan, Siguiri, Dinguiraye, Haute-Guinée, Banora, M\'Bonet',
      order: 2,
    },
    {
      question: "Comment faire une demande de devis ?",
      answer:
        "Rendez-vous sur la page Contact, choisissez « Demande de devis » comme type de demande, puis remplissez le formulaire. Vous préciserez l'activité concernée, la description du besoin, le lieu et le délai souhaité. Notre équipe vous recontactera.",
      keywords: 'devis, demande, formulaire, contact, prix, tarif',
      order: 3,
    },
    {
      question: "Combien de temps dure une formation ?",
      answer:
        "Nos formations durent généralement de deux à trois mois. Elles s'adressent aux jeunes diplômés et aux professionnels en activité. Pour connaître le programme détaillé et les prochaines sessions, utilisez le formulaire de contact avec le type « Inscription à une formation ».",
      keywords: 'formation, durée, mois, inscription, jeune diplômé, professionnel',
      order: 4,
    },
    {
      question: "Proposez-vous la sous-traitance ?",
      answer:
        "Oui. DTK Corporation travaille en sous-traitance dans tous ses domaines d'expertise. Utilisez le formulaire dédié accessible depuis le menu « Sous-traitance » pour décrire votre besoin.",
      keywords: 'sous-traitance, collaboration, donneur d\'ordre, mission',
      order: 5,
    },
    {
      question: "Comment vous contacter par WhatsApp ?",
      answer:
        "Si le numéro WhatsApp est renseigné par l'entreprise, un bouton WhatsApp apparaît sur le site. Vous pouvez aussi utiliser le formulaire de contact : nous vous répondrons par email ou par téléphone.",
      keywords: 'whatsapp, contact, téléphone, message',
      order: 6,
    },
  ]
  for (const f of faqs) {
    const existing = await db.faqItem.findFirst({ where: { question: f.question } })
    if (!existing) await db.faqItem.create({ data: f })
  }

  // ─── ChatbotKnowledge (chunks RAG) ───────────────────────────────────────
  // Build chunks from services + FAQ + settings so the chatbot has context.
  const allServices = await db.service.findMany()
  const knowledgeChunks: { source: string; title: string; content: string; keywords: string }[] = []
  for (const s of allServices) {
    knowledgeChunks.push({
      source: `service:${s.slug}`,
      title: s.title,
      content: `${s.title}. ${s.excerpt} Zones d'intervention : ${s.zones || 'non précisées'}.`,
      keywords: `${s.title} ${s.shortTitle || ''} ${s.slug} ${s.zones}`.toLowerCase(),
    })
  }
  const allFaqs = await db.faqItem.findMany()
  for (const f of allFaqs) {
    knowledgeChunks.push({
      source: `faq:${f.id}`,
      title: f.question,
      content: `${f.question} ${f.answer}`,
      keywords: f.keywords || '',
    })
  }
  const settings = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
  if (settings) {
    knowledgeChunks.push({
      source: 'settings',
      title: 'Identité DTK Corporation',
      content: `DTK Corporation SARL, slogan « ${settings.slogan} ». Zones d'intervention : ${settings.zones}. Domaines : BTP, agro-alimentaire, formation, élevage, froid et sous-traitance.`,
      keywords: 'dtk corporation, slogan, professionnalisme, qualité, satisfaction, guinée',
    })
  }

  for (const c of knowledgeChunks) {
    const existing = await db.chatbotKnowledge.findFirst({ where: { source: c.source } })
    if (existing) {
      await db.chatbotKnowledge.update({ where: { id: existing.id }, data: c })
    } else {
      await db.chatbotKnowledge.create({ data: c })
    }
  }

  // ─── Chatbot model config ────────────────────────────────────────────────
  await db.chatbotModelConfig.upsert({
    where: { id: 'zai-default' },
    update: {},
    create: {
      id: 'zai-default',
      provider: 'zai',
      model: 'default',
      order: 1,
      enabled: true,
    },
  })

  console.log('✓ Seed terminé.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
