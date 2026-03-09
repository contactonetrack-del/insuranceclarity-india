/**
 * Email Service — InsuranceClarity India
 * 
 * Provides transactional email via SMTP (nodemailer).
 * 
 * Setup:
 *  1. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM in .env.local
 *  2. Supports Gmail (smtp.gmail.com:587), AWS SES, Mailgun, Brevo, etc.
 * 
 * Usage:
 *   await emailService.sendWelcome({ to: 'user@example.com', name: 'Rahul' })
 */

import type { Transporter } from 'nodemailer'

// ─── Transport configuration ─────────────────────────────────────────────────
async function getTransport(): Promise<Transporter | null> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
        return null
    }

    // Dynamic import avoids issues when nodemailer isn't installed yet
    const nodemailer = (await import('nodemailer')).default
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT ?? '587', 10),
        secure: SMTP_PORT === '465',
        auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
}


const FROM = process.env.SMTP_FROM ?? 'noreply@insuranceclarity.in'

// ─── Email Templates ─────────────────────────────────────────────────────────
function baseTemplate(title: string, body: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #34d399 100%); padding: 32px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
        .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
        .body { padding: 32px; }
        .body p { line-height: 1.7; color: #334155; margin: 0 0 16px; }
        .cta { display: inline-block; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 16px 0; }
        .footer { padding: 20px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.6; }
        .disclaimer { font-size: 11px; color: #cbd5e1; margin-top: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>InsuranceClarity India</h1>
            <p>India's Most Transparent Insurance Platform</p>
        </div>
        <div class="body">
            ${body}
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} InsuranceClarity India. All rights reserved.</p>
            <p class="disclaimer">
                InsuranceClarity is an educational platform and is not an IRDAI-licensed intermediary.
                We do not sell insurance products.
            </p>
        </div>
    </div>
</body>
</html>`
}

// ─── Email Service API ────────────────────────────────────────────────────────
export const emailService = {
    /**
     * Check if SMTP is configured.
     */
    isConfigured(): boolean {
        return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD)
    },

    /**
     * Send a welcome email to a new subscriber.
     */
    async sendWelcome({ to, name }: { to: string; name?: string }): Promise<boolean> {
        const transport = await getTransport()
        if (!transport) {
            console.warn('[emailService] SMTP not configured — skipping sendWelcome')
            return false
        }

        const displayName = name ?? 'there'
        await transport.sendMail({
            from: `InsuranceClarity India <${FROM}>`,
            to,
            subject: 'Welcome to InsuranceClarity India 🎉',
            html: baseTemplate(
                'Welcome to InsuranceClarity',
                `<p>Hi ${displayName},</p>
                 <p>Welcome to InsuranceClarity India — your go-to platform for understanding insurance without the jargon.</p>
                 <p>Here's what you can do:</p>
                 <ul>
                     <li>🔍 <strong>Reveal Hidden Facts</strong> — find what your policy hides</li>
                     <li>📊 <strong>Compare Policies</strong> — see which plan actually pays claims</li>
                     <li>🧮 <strong>Calculate Premiums</strong> — get fair estimates</li>
                 </ul>
                 <a href="https://insuranceclarity.in/tools/hidden-facts" class="cta">Explore Hidden Facts →</a>`
            ),
        })

        return true
    },

    /**
     * Send a newsletter to a subscriber.
     */
    async sendNewsletter({ to, subject, htmlBody }: { to: string; subject: string; htmlBody: string }): Promise<boolean> {
        const transport = await getTransport()
        if (!transport) {
            console.warn('[emailService] SMTP not configured — skipping sendNewsletter')
            return false
        }

        await transport.sendMail({
            from: `InsuranceClarity India <${FROM}>`,
            to,
            subject,
            html: baseTemplate(subject, htmlBody),
            headers: {
                'List-Unsubscribe': `<mailto:${FROM}?subject=unsubscribe>`,
            },
        })

        return true
    },

    /**
     * Notify user when quote processing is complete.
     */
    async sendQuoteReady({ to, jobId }: { to: string; jobId: string }): Promise<boolean> {
        const transport = await getTransport()
        if (!transport) {
            console.warn('[emailService] SMTP not configured — skipping sendQuoteReady')
            return false
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://insuranceclarity.in'
        await transport.sendMail({
            from: `InsuranceClarity India <${FROM}>`,
            to,
            subject: 'Your Insurance Quote Is Ready',
            html: baseTemplate(
                'Quote Ready',
                `<p>Great news! Your insurance quote request has been processed.</p>
                 <a href="${appUrl}/track?jobId=${jobId}" class="cta">View Your Quote →</a>
                 <p style="font-size:13px;color:#94a3b8;">Job reference: ${jobId}</p>`
            ),
        })

        return true
    },
}

export default emailService
