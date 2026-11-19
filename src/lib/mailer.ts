/**
 * Mailer abstraction. Two implementations:
 *  - ConsoleMailer (dev): logs to console, no real send.
 *  - NodemailerMailer (prod): SMTP via Gmail or professional domain.
 *
 * To switch to SMTP in production:
 *   1. `bun add nodemailer`
 *   2. Set MAIL_USER, MAIL_APP_PASSWORD, MAIL_SMTP_HOST (default smtp.gmail.com), MAIL_SMTP_PORT (465)
 *
 * The code stays identical; only env changes.
 */

export interface MailMessage {
  to: string
  subject: string
  text: string
  html?: string
}

export interface Mailer {
  send(msg: MailMessage): Promise<{ ok: boolean; error?: string }>
}

class ConsoleMailer implements Mailer {
  async send(msg: MailMessage): Promise<{ ok: boolean; error?: string }> {
     
    console.log('\n━━━ MAIL (dev console) ━━━')
     
    console.log(`To: ${msg.to}`)
     
    console.log(`Subject: ${msg.subject}`)
     
    console.log('---')
     
    console.log(msg.text)
     
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    return { ok: true }
  }
}

class NodemailerMailer implements Mailer {
  private transporter: Promise<any> | null = null

  private async getTransporter() {
    if (this.transporter) return this.transporter
    let nodemailer: any
    try {
      nodemailer = await import('nodemailer')
    } catch {
      throw new Error('nodemailer n\'est pas installé. Exécutez: bun add nodemailer')
    }
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    })
    this.transporter = Promise.resolve(transporter)
    return transporter
  }

  async send(msg: MailMessage): Promise<{ ok: boolean; error?: string }> {
    try {
      const transporter = await this.getTransporter()
      await transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || 'DTK Corporation'}" <${process.env.MAIL_USER}>`,
        ...msg,
      })
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Erreur d’envoi' }
    }
  }
}

let instance: Mailer | null = null

export function getMailer(): Mailer {
  if (instance) return instance
  const useSmtp =
    !!process.env.MAIL_USER &&
    !!process.env.MAIL_APP_PASSWORD &&
    process.env.MAIL_DRIVER !== 'console'
  instance = useSmtp ? new NodemailerMailer() : new ConsoleMailer()
  return instance
}

/**
 * Build a notification email to the admin when a new request arrives.
 */
export function buildAdminNotificationEmail(input: {
  type: string
  fullName: string
  phone: string
  email: string
  message: string
  extraData: Record<string, string>
  requestId: string
  adminUrl: string
}): MailMessage {
  const labelMap: Record<string, string> = {
    devis: 'Demande de devis',
    contact: 'Contact',
    formation: 'Inscription à une formation',
    'sous-traitance': 'Sous-traitance générale',
    renseignements: 'Renseignements',
  }
  const lines = [
    `Nouvelle demande reçue sur le site DTK Corporation.`,
    ``,
    `Type : ${labelMap[input.type] || input.type}`,
    `Nom : ${input.fullName}`,
    `Téléphone / WhatsApp : ${input.phone}`,
    `Email : ${input.email}`,
    ``,
    `Message :`,
    input.message,
    ``,
  ]
  for (const [k, v] of Object.entries(input.extraData)) {
    lines.push(`${k} : ${v}`)
  }
  lines.push(``)
  lines.push(`Voir / traiter : ${input.adminUrl}/dashboard/requests/${input.requestId}`)
  return {
    to: process.env.ADMIN_NOTIFY_EMAIL || process.env.MAIL_USER || 'admin@dtk.local',
    subject: `[DTK] ${labelMap[input.type] || input.type} — ${input.fullName}`,
    text: lines.join('\n'),
  }
}

export function buildVisitorConfirmationEmail(input: {
  fullName: string
  email: string
  type: string
}): MailMessage {
  const labelMap: Record<string, string> = {
    devis: 'demande de devis',
    contact: 'message de contact',
    formation: 'inscription à une formation',
    'sous-traitance': 'demande de sous-traitance',
    renseignements: 'demande de renseignements',
  }
  const text = [
    `Bonjour ${input.fullName},`,
    ``,
    `Nous accusons réception de votre ${labelMap[input.type] || input.type} envoyée via le site de DTK Corporation SARL.`,
    `Notre équipe vous recontactera dans les meilleurs délais.`,
    ``,
    `Cordialement,`,
    `DTK Corporation SARL`,
    `Professionnalisme, Qualité, Satisfaction`,
  ].join('\n')
  return {
    to: input.email,
    subject: 'Confirmation de réception — DTK Corporation SARL',
    text,
  }
}
