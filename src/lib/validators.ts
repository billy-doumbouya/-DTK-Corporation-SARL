import { z } from 'zod'

/**
 * Shared Zod schemas for the dynamic request form.
 * Used on BOTH client and server (single source of truth).
 */

export const REQUEST_TYPES = [
  'devis',
  'contact',
  'formation',
  'sous-traitance',
  'renseignements',
] as const
export type RequestType = (typeof REQUEST_TYPES)[number]

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  devis: 'Demande de devis',
  contact: 'Contact',
  formation: 'Inscription à une formation',
  'sous-traitance': 'Sous-traitance générale',
  renseignements: 'Renseignements',
}

const phoneRegex = /^[+\d\s().-]{6,20}$/

const commonFields = {
  fullName: z.string().min(2, 'Votre nom doit comporter au moins 2 caractères.').max(100),
  phone: z
    .string()
    .min(6, 'Numéro de téléphone invalide.')
    .max(20)
    .regex(phoneRegex, 'Numéro de téléphone invalide.'),
  email: z.string().email('Adresse email invalide.').max(150),
  message: z
    .string()
    .min(10, 'Votre message doit comporter au moins 10 caractères.')
    .max(3000, 'Votre message est trop long (3000 caractères maximum).'),
  // honeypot: must be empty
  website: z.string().max(0, 'Champ invalide.').optional().or(z.literal('')),
}

export const devisSchema = z.object({
  ...commonFields,
  activity: z.string().min(1, 'Sélectionnez une activité.'),
  needDescription: z.string().min(5, 'Décrivez votre besoin.').max(1000),
  location: z.string().max(200).optional().or(z.literal('')),
  desiredDelay: z.string().max(200).optional().or(z.literal('')),
})

export const contactSchema = z.object({
  ...commonFields,
  subject: z.string().min(2, 'Indiquez un sujet.').max(200),
})

export const formationSchema = z.object({
  ...commonFields,
  formationChoice: z.string().min(1, 'Sélectionnez une formation.'),
  levelOrProfession: z.string().min(2, 'Indiquez votre niveau ou profession.').max(200),
  city: z.string().min(2, 'Indiquez votre ville.').max(100),
})

export const subcontractingSchema = z.object({
  ...commonFields,
  companyName: z.string().min(2, 'Nom de l’entreprise requis.').max(200),
  domain: z.string().min(2, 'Indiquez le domaine.').max(200),
  workDescription: z.string().min(10, 'Décrivez le travail à confier.').max(2000),
  location: z.string().max(200).optional().or(z.literal('')),
  delay: z.string().max(200).optional().or(z.literal('')),
})

export const renseignementsSchema = z.object({
  ...commonFields,
  subject: z.string().min(2, 'Indiquez un sujet.').max(200),
})

export type DevisInput = z.infer<typeof devisSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type FormationInput = z.infer<typeof formationSchema>
export type SubcontractingInput = z.infer<typeof subcontractingSchema>
export type RenseignementsInput = z.infer<typeof renseignementsSchema>

export function getSchemaForType(type: string) {
  switch (type) {
    case 'devis':
      return devisSchema
    case 'contact':
      return contactSchema
    case 'formation':
      return formationSchema
    case 'sous-traitance':
      return subcontractingSchema
    case 'renseignements':
      return renseignementsSchema
    default:
      return null
  }
}

// ─── Auth schemas ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Email invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis.'),
    newPassword: z.string().min(8, 'Au moins 8 caractères.'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirm'],
  })
