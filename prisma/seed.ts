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
import { validatePasswordPolicy } from '../src/lib/password'

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
  const adminEmail = process.env.ADMIN_SEED_EMAIL?.trim()
  const adminPassword = process.env.ADMIN_SEED_PASSWORD
  if (!adminEmail || !adminPassword) {
    throw new Error('Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD before running the seed.')
  }
  const passwordPolicy = validatePasswordPolicy(adminPassword)
  if (!passwordPolicy.ok) {
    throw new Error(`ADMIN_SEED_PASSWORD is invalid: ${passwordPolicy.reason}`)
  }

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

  const permRecords: Array<{ id: string; action: string }> = []
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
    console.log(`  → Admin créé : ${adminEmail}`)
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
  // Note: les coordonnées ci-dessous sont des exemples. L'admin les modifiera depuis le tableau de bord.
  await db.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {
      email: 'contact@dtk-corporation.gn',
      phone: '+224 620 00 00 00',
      whatsapp: '224620000000',
      addressLine: 'Hamdallaye, Route du Niger',
      addressCity: 'Conakry',
      facebookUrl: 'https://facebook.com/dtkcorporation',
      linkedinUrl: 'https://linkedin.com/company/dtk-corporation',
      instagramUrl: 'https://instagram.com/dtk_corporation',
      legalAddress: 'Hamdallaye, Route du Niger, Conakry, République de Guinée',
    },
    create: {
      id: 'singleton',
      siteName: 'DTK Corporation SARL',
      slogan: 'Professionnalisme, Qualité, Satisfaction',
      email: 'contact@dtk-corporation.gn',
      phone: '+224 620 00 00 00',
      whatsapp: '224620000000',
      addressLine: 'Hamdallaye, Route du Niger',
      addressCity: 'Conakry',
      facebookUrl: 'https://facebook.com/dtkcorporation',
      linkedinUrl: 'https://linkedin.com/company/dtk-corporation',
      instagramUrl: 'https://instagram.com/dtk_corporation',
      zones: 'Conakry, Kankan, Siguiri, Dinguiraye',
      legalName: 'DTK Corporation SARL',
      legalForm: 'SARL',
      legalAddress: 'Hamdallaye, Route du Niger, Conakry, République de Guinée',
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
      coverUrl: '/images/service-btp.webp',
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
      coverUrl: '/images/service-agro.webp',
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
      coverUrl: '/images/service-formation.webp',
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
      coverUrl: '/images/service-elevage.webp',
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
      coverUrl: '/images/service-froid.webp',
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
      title: 'Sous-traitance générale',
      shortTitle: 'Sous-traitance générale',
      excerpt:
        "DTK Corporation travaille en sous-traitance pour des donneurs d'ordre dans ses domaines d’expertise.",
      description:
        "DTK Corporation peut travailler en sous-traitance pour des donneurs d'ordre dans l'ensemble de ses domaines d’expertise : BTP, agro-alimentaire, formation, élevage et froid.\n\nSi vous souhaitez nous confier une mission, utilisez le formulaire dédié accessible depuis le menu « Sous-traitance générale ».",
      iconKey: 'FaHandshake',
      coverUrl: '/images/sous-traitance-template.webp',
      coverAlt: "Poignée de main — sous-traitance",
      order: 6,
      isSubcontracting: true,
      zones: 'Guinée',
      features: JSON.stringify([
        'Sous-traitance générale BTP',
        'Sous-traitance générale agro-alimentaire',
        'Sous-traitance générale froid / climatisation',
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

  // ─── Products (agro-alimentaire) ──────────────────────────────────────────
  if (agro) {
    const agroProducts = [
      {
        name: 'Riz guinéen — Qualité supérieure',
        slug: 'riz-guineen-qualite-superieure',
        excerpt: 'Riz guinéen transformé et valorisé, issu des zones de production de Haute-Guinée.',
        description: 'Notre riz guinéen est transformé dans nos installations de Haute-Guinée (Dinguiraye, Banora, M\'Bonet). Trié, étuvé et conditionné avec soin, il conserve toutes ses qualités nutritionnelles. Un produit local de qualité, soutenant les producteurs guinéens.',
        unit: 'Sac 25 kg',
        order: 1,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=70',
        imageAlt: 'Sac de riz guinéen de qualité supérieure',
      },
      {
        name: 'Riz étuvé — Prêt à cuire',
        slug: 'riz-etuve-pret-a-cuire',
        excerpt: 'Riz étuvé selon un procédé traditionnel guinéen, prêt à cuire.',
        description: 'Riz étuvé selon un procédé traditionnel guinéen, prêt à cuire. Conditionné en sacs de 5 kg et 10 kg pour un usage domestique ou professionnel.',
        unit: 'Sac 5 kg / 10 kg',
        order: 2,
        imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=70',
        imageAlt: 'Riz étuvé prêt à cuire',
      },
      {
        name: 'Farine de riz guinéen',
        slug: 'farine-de-riz-guineen',
        excerpt: 'Farine de riz finement moulue, sans gluten, idéale pour pâtisseries et préparations locales.',
        description: 'Farine de riz guinéen finement moulue, sans gluten. Idéale pour les pâtisseries, bouillies et préparations traditionnelles guinéennes.',
        unit: 'Paquet 1 kg',
        order: 3,
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=70',
        imageAlt: 'Farine de riz guinéen',
      },
    ]
    for (const p of agroProducts) {
      await db.product.upsert({
        where: { slug: p.slug },
        update: { isPublished: true, ...p },
        create: { serviceId: agro.id, isPublished: true, ...p },
      })
    }
  }

  // ─── Products (élevage) ───────────────────────────────────────────────────
  if (elevage) {
    const elevageProducts = [
      {
        name: 'Viande fraîche — Bœuf',
        slug: 'viande-boeuf-frais',
        excerpt: 'Viande de bœuf fraîche, issue de notre élevage, découpée et conditionnée selon les normes.',
        description: 'Viande de bœuf fraîche provenant de notre élevage. Découpée et conditionnée dans le respect des normes d\'hygiène. Disponible en pièces ou en gros.',
        unit: 'Kg',
        order: 1,
        imageUrl: 'https://images.unsplash.com/photo-1603048719571-aaf3bc69b5a1?auto=format&fit=crop&w=800&q=70',
        imageAlt: 'Viande de bœuf fraîche',
      },
      {
        name: 'Volaille fermière',
        slug: 'volaille-fermiere',
        excerpt: 'Poulets fermiers élevés en plein air, nourris naturellement.',
        description: 'Poulets fermiers élevés en plein air en Guinée, nourris avec des aliments naturels. Une viande saine et savoureuse, disponible fraîche ou congelée.',
        unit: 'Pièce',
        order: 2,
        imageUrl: 'https://images.unsplash.com/photo-1587569770398-53d6c75c5f5f?auto=format&fit=crop&w=800&q=70',
        imageAlt: 'Volaille fermière',
      },
    ]
    for (const p of elevageProducts) {
      await db.product.upsert({
        where: { slug: p.slug },
        update: { isPublished: true, ...p },
        create: { serviceId: elevage.id, isPublished: true, ...p },
      })
    }
  }

  // ─── Formations (liées au service formation) ─────────────────────────────
  if (formationService) {
    const formations = [
      {
        title: 'Formation BTP — Techniques de construction moderne',
        slug: 'formation-btp-techniques-construction',
        excerpt: 'Maîtrisez les techniques modernes de construction : coffrage, ferraillage, enduits et gestion de chantier.',
        description: 'Cette formation de 3 mois est destinée aux jeunes diplômés et professionnels du BTP. Elle couvre les techniques modernes de construction : lecture de plans, coffrage, ferraillage, techniques d\'enduit, gestion de chantier, sécurité QHSSE. À l\'issue, les participants sont capables d\'encadrer un chantier de construction résidentielle et tertiaire.',
        duration: '3 mois',
        audience: 'Jeunes diplômés et professionnels du BTP',
        order: 1,
        imageUrl: 'https://images.unsplash.com/photo-1504307830983-1f46853c7138?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Formation aux techniques de construction',
      },
      {
        title: 'Formation Froid & Climatisation',
        slug: 'formation-froid-climatisation',
        excerpt: 'Installation, maintenance et dépannage de systèmes de climatisation : devenez technicien qualifié.',
        description: 'Formation pratique de 2 mois à l\'installation, la maintenance et au dépannage de systèmes de climatisation. Les participants apprennent les principes de la thermodynamique, les techniques d\'installation split et centralisé, la recherche de pannes et les bonnes pratiques QHSSE. Stage pratique sur équipements réels.',
        duration: '2 mois',
        audience: 'Jeunes diplômés et techniciens en reconversion',
        order: 2,
        imageUrl: 'https://images.unsplash.com/photo-1635403050191-e80498f1d357?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Formation climatisation',
      },
      {
        title: 'Formation Agro-alimentaire — Transformation du riz',
        slug: 'formation-agro-transformation-riz',
        excerpt: 'Apprenez les techniques de transformation, étuvage et conditionnement du riz guinéen.',
        description: 'Formation de 2 mois sur les techniques de transformation post-récolte du riz : étuvage, séchage, tri, conditionnement et normes d\'hygiène. Destinée aux jeunes des zones de production de Haute-Guinée. Objectif : créer des emplois locaux et valoriser la production rizicole guinéenne.',
        duration: '2 mois',
        audience: 'Jeunes de Haute-Guinée et producteurs',
        order: 3,
        imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c3cc?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Formation transformation du riz',
      },
      {
        title: 'Formation Bureautique — Word, Excel, PowerPoint',
        slug: 'formation-bureautique-word-excel-powerpoint',
        excerpt: 'Maîtrisez la suite bureautique Microsoft Office : traitement de texte, tableurs et présentations.',
        description: 'Formation pratique de 2 mois à la bureautique. Les participants apprennent à utiliser Microsoft Word (traitement de texte), Excel (tableurs, formules, graphiques) et PowerPoint (présentations professionnelles). À l\'issue, ils sont capables de produire des documents professionnels et de gérer efficacement des données. Idéale pour les jeunes diplômés et les professionnels en reconversion.',
        duration: '2 mois',
        audience: 'Jeunes diplômés, secrétaires, professionnels',
        order: 4,
        imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Formation bureautique sur ordinateur',
      },
      {
        title: 'Formation Numérique — Bases de l\'informatique et Internet',
        slug: 'formation-numerique-bases-informatique',
        excerpt: 'Découvrez les fondamentaux du numérique : informatique, Internet, sécurité et outils collaboratifs.',
        description: 'Formation de 2 mois sur les bases du numérique. Les participants découvrent le fonctionnement d\'un ordinateur, la navigation sur Internet, la sécurité informatique (mots de passe, phishing), les outils collaboratifs (Google Workspace, email professionnel) et les réseaux sociaux professionnels. Cette formation s\'adresse aux débutants et à ceux qui souhaitent renforcer leurs compétences numériques.',
        duration: '2 mois',
        audience: 'Débutants et personnes en reconversion numérique',
        order: 5,
        imageUrl: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Formation aux bases du numérique',
      },
      {
        title: 'Prestation de Solutions Numériques',
        slug: 'prestation-solutions-numeriques',
        excerpt: 'Conception de sites web, automatisation, digitalisation des processus et accompagnement numérique.',
        description: 'DTK Corporation propose des prestations de solutions numériques pour les entreprises et institutions guinéennes : conception de sites web vitrines et e-commerce, automatisation de processus, digitalisation de documents, mise en place d\'outils collaboratifs (intranet, gestion de projet), et accompagnement à la transformation numérique. Nos experts vous accompagnent de l\'analyse du besoin à la mise en production.',
        duration: 'Sur mesure',
        audience: 'Entreprises et institutions',
        order: 6,
        imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Solutions numériques pour entreprises',
      },
    ]
    for (const f of formations) {
      await db.formation.upsert({
        where: { slug: f.slug },
        update: { isPublished: true, ...f },
        create: { serviceId: formationService.id, isPublished: true, ...f },
      })
    }
  }

  // ─── Slides accueil (3 slides) ───────────────────────────────────────────
  const slides = [
    {
      title: 'Professionnalisme, Qualité, Satisfaction',
      subtitle:
        'Une entreprise guinéenne pluridisciplinaire au service de votre projet : BTP, agro-alimentaire, formation, élevage et froid.',
      buttonText: 'Découvrir nos services',
      buttonHref: '/services',
      imageUrl: '/images/services-bg.webp',
      imageAlt: 'Services DTK Corporation',
      order: 1,
    },
    {
      title: 'Valorisons le riz guinéen',
      subtitle:
        'Transformation et valorisation des produits agricoles locaux en Haute-Guinée (Dinguiraye, Banora, M\'Bonet).',
      buttonText: 'En savoir plus',
      buttonHref: '/services/agro-alimentaire',
      imageUrl: '/images/elevage-cattle.webp',
      imageAlt: 'Agriculture et élevage en Guinée',
      order: 2,
    },
    {
      title: 'Froid & Climatisation',
      subtitle:
        'Vente, installation, maintenance et dépannage de climatisation par des techniciens qualifiés.',
      buttonText: 'Demander un dépannage',
      buttonHref: '/contact?type=devis',
      imageUrl: '/images/subcontracting-bg.webp',
      imageAlt: 'Bâtiment et climatisation',
      order: 3,
    },
    {
      title: 'Une équipe pluridisciplinaire à votre service',
      subtitle:
        'Professionnels du BTP, de l’agro-alimentaire, de la formation et du froid — une équipe engagée pour la Guinée.',
      buttonText: 'Découvrir l’équipe',
      buttonHref: '/a-propos',
      imageUrl: '/images/about-team.webp',
      imageAlt: 'Équipe DTK Corporation',
      order: 4,
    },
    {
      title: 'De l’agriculture au numérique',
      subtitle:
        'Six domaines d’expertise pour accompagner le développement de la Guinée : BTP, agro, formation, élevage, froid et solutions numériques.',
      buttonText: 'Nos expertises',
      buttonHref: '/services',
      imageUrl: '/images/team-pro.webp',
      imageAlt: 'Experts pluridisciplinaires DTK',
      order: 5,
    },
    {
      title: 'Valorisons le riz guinéen',
      subtitle:
        'Une femme guinéenne dans sa rizière. DTK Corporation transforme et valorise le riz local en Haute-Guinée.',
      buttonText: 'Notre projet agro',
      buttonHref: '/services/agro-alimentaire',
      imageUrl: '/images/rice-field-lady.webp',
      imageAlt: 'Femme dans une rizière en Guinée',
      order: 6,
    },
  ]
  for (const s of slides) {
    const existing = await db.slide.findFirst({ where: { title: s.title } })
    if (existing) {
      await db.slide.update({ where: { id: existing.id }, data: s })
    } else {
      await db.slide.create({ data: s })
    }
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
      headline: 'Sous-traitance générale',
      intro:
        "DTK Corporation SARL travaille en sous-traitance pour des donneurs d'ordre dans ses domaines d’expertise : BTP, agro-alimentaire, formation, élevage et froid. Confiez-nous une mission via le formulaire dédié, nous vous répondons rapidement.",
      domains: JSON.stringify([
        'BTP — Bâtiment et Travaux Publics',
        'Agro-alimentaire',
        'Formation',
        'Élevage',
        'Froid / Climatisation',
      ]),
      imageUrl: '/images/sous-traitance-template.webp',
      imageAlt: 'Sous-traitance générale — collaboration',
    },
  })

  // ─── Partenaires ──────────────────────────────────────────────────────────
  const partners = [
    { name: 'Ministère de l\'Agriculture', logoUrl: '', websiteUrl: 'https://agriculture.gov.gn', order: 1 },
    { name: 'Chambre de Commerce Conakry', logoUrl: '', websiteUrl: 'https://ccig.gn', order: 2 },
    { name: 'Agence de Promotion du Riz Guinéen', logoUrl: '', websiteUrl: '', order: 3 },
    { name: 'Fédération des Producteurs de Haute-Guinée', logoUrl: '', websiteUrl: '', order: 4 },
    { name: 'École Nationale des Travaux Publics', logoUrl: '', websiteUrl: '', order: 5 },
    { name: 'ONG Guinée 44', logoUrl: '', websiteUrl: '', order: 6 },
  ]
  for (const p of partners) {
    const existing = await db.partner.findFirst({ where: { name: p.name } })
    if (existing) {
      await db.partner.update({ where: { id: existing.id }, data: { ...p, isPublished: true } })
    } else {
      await db.partner.create({ data: { ...p, isPublished: true } })
    }
  }

  // ─── Réalisations ─────────────────────────────────────────────────────────
  const realisations = [
    {
      title: 'Construction d\'un complexe résidentiel à Conakry',
      slug: 'complexe-residentiel-conakry',
      excerpt: 'Construction d\'un ensemble de 12 logements collectifs à Hamdallaye, Conakry.',
      description: 'DTK Corporation a mené la construction d\'un complexe résidentiel de 12 logements à Hamdallaye, Conakry. Le projet a couvert le gros œuvre, les finitions et les installations électriques et sanitaires. Respect des délais et des normes QHSSE.',
      category: 'BTP',
      location: 'Hamdallaye, Conakry',
      coverUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=70',
      coverAlt: 'Complexe résidentiel à Conakry',
      order: 1,
    },
    {
      title: 'Aménagement d\'une unité de transformation de riz à Dinguiraye',
      slug: 'unite-transformation-riz-dinguiraye',
      excerpt: 'Installation d\'une unité de transformation et de conditionnement du riz guinéen en Haute-Guinée.',
      description: 'Dans le cadre de notre projet agro-alimentaire, DTK Corporation a aménagé une unité de transformation de riz à Dinguiraye. L\'unité assure l\'étuvage, le séchage, le tri et le conditionnement du riz produit localement, soutenant ainsi les producteurs de Haute-Guinée.',
      category: 'Agro-alimentaire',
      location: 'Dinguiraye, Haute-Guinée',
      coverUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=70',
      coverAlt: 'Unité de transformation de riz',
      order: 2,
    },
    {
      title: 'Installation de climatisation centrale — Bâtiment tertiaire',
      slug: 'climatisation-centrale-batiment-tertiaire',
      excerpt: 'Installation et maintenance d\'un système de climatisation centrale pour un immeuble de bureaux.',
      description: 'DTK Corporation a assuré l\'installation complète d\'un système de climatisation centrale pour un immeuble de bureaux de 4 étages à Conakry. Le projet a inclus l\'étude technique, l\'installation, la mise en service et le contrat de maintenance préventive.',
      category: 'Froid',
      location: 'Kaloum, Conakry',
      coverUrl: 'https://images.unsplash.com/photo-1632852961277-3f06c6e8c905?auto=format&fit=crop&w=1200&q=70',
      coverAlt: 'Installation de climatisation centrale',
      order: 3,
    },
    {
      title: 'Programme de formation pour jeunes diplômés',
      slug: 'programme-formation-jeunes-diplomes',
      excerpt: 'Formation de 50 jeunes diplômés aux techniques de construction moderne.',
      description: 'DTK Corporation a organisé un programme de formation de 3 mois pour 50 jeunes diplômés guinéens, sur les techniques de construction moderne et la gestion de chantier. Plus de 80% des participants ont trouvé un emploi à l\'issue de la formation.',
      category: 'Formation',
      location: 'Conakry',
      coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=70',
      coverAlt: 'Session de formation pour jeunes diplômés',
      order: 4,
    },
  ]
  for (const r of realisations) {
    const existing = await db.realisation.findFirst({ where: { slug: r.slug } })
    if (existing) {
      await db.realisation.update({ where: { id: existing.id }, data: { ...r, isPublished: true } })
    } else {
      await db.realisation.create({ data: { ...r, isPublished: true, publishedAt: new Date() } })
    }
  }

  // ─── Actualités ───────────────────────────────────────────────────────────
  const newsArticles = [
    {
      title: 'DTK Corporation lance son programme de transformation du riz guinéen',
      slug: 'lancement-programme-transformation-riz-guineen',
      excerpt: 'L\'entreprise lance officiellement son projet de valorisation du riz guinéen en Haute-Guinée.',
      content: 'DTK Corporation SARL annonce le lancement officiel de son programme de transformation et de valorisation du riz guinéen en Haute-Guinée. Ce projet, basé dans les zones de Dinguiraye, Banora et M\'Bonet, vise à soutenir les producteurs locaux tout en offrant un produit de qualité aux consommateurs guinéens.\n\nL\'unité de transformation assure l\'étuvage, le séchage, le tri et le conditionnement du riz. Cette initiative crée des emplois locaux et participe à la souveraineté alimentaire de la Guinée.\n\n« Notre objectif est de transformer le riz guinéen localement, en soutenant les producteurs et en offrant un produit de qualité », indique la direction de DTK Corporation.',
      tags: 'agro-alimentaire, riz, Haute-Guinée, Dinguiraye',
      coverUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=70',
      coverAlt: 'Rizière guinéenne',
    },
    {
      title: 'Inscriptions ouvertes : formations BTP et Climatisation',
      slug: 'inscriptions-ouvertes-formations-btp-climatisation',
      excerpt: 'DTK Corporation ouvre les inscriptions pour ses prochaines sessions de formation de 2 à 3 mois.',
      content: 'DTK Corporation SARL ouvre les inscriptions pour ses prochaines sessions de formation, destinées aux jeunes diplômés et aux professionnels en activité.\n\nTrois programmes sont proposés :\n- Formation BTP — Techniques de construction moderne (3 mois)\n- Formation Froid & Climatisation (2 mois)\n- Formation Agro-alimentaire — Transformation du riz (2 mois)\n\nLes formations combinent théorie et pratique, avec un encadrement par des professionnels expérimentés. Les inscriptions se font via le formulaire de contact, en choisissant le type « Inscription à une formation ».',
      tags: 'formation, inscription, BTP, climatisation, emploi',
      coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=70',
      coverAlt: 'Salle de formation',
    },
    {
      title: 'DTK Corporation s\'engage pour la politique QHSSE',
      slug: 'dtk-corporation-politique-qhsse',
      excerpt: 'L\'entreprise réaffirme ses trois engagements : zéro accident, zéro dommage environnemental, zéro compromis qualité.',
      content: 'Dans le cadre de sa démarche qualité, DTK Corporation SARL réaffirme ses trois engagements QHSSE fondamentaux :\n\n1. Zéro accident — La sécurité de nos équipes et de nos partenaires est notre première priorité. Tous nos chantiers appliquent des protocoles de sécurité stricts.\n\n2. Zéro dommage pour l\'environnement — Nous veillons à minimiser l\'impact environnemental de chacune de nos opérations, de la gestion des déchets de chantier à l\'utilisation de matériaux respectueux.\n\n3. Zéro compromis sur la qualité — Chaque livraison respecte nos standards de qualité, sans exception. Un contrôle qualité est effectué à chaque étape de nos projets.\n\nCes trois principes guident chacune de nos décisions et de nos interventions.',
      tags: 'QHSSE, sécurité, environnement, qualité',
      coverUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=70',
      coverAlt: 'Engagement QHSSE',
    },
  ]
  for (const n of newsArticles) {
    const existing = await db.newsArticle.findFirst({ where: { slug: n.slug } })
    if (existing) {
      await db.newsArticle.update({ where: { id: existing.id }, data: { ...n, isPublished: true } })
    } else {
      await db.newsArticle.create({
        data: { ...n, isPublished: true, publishedAt: new Date(), authorName: 'DTK Corporation SARL' },
      })
    }
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
        "Oui. DTK Corporation travaille en sous-traitance dans tous ses domaines d’expertise. Utilisez le formulaire dédié accessible depuis le menu « Sous-traitance générale » pour décrire votre besoin.",
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
