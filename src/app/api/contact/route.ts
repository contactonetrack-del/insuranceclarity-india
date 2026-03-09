import { NextResponse } from 'next/server'
import emailService from '@/services/email.service'
import { z } from 'zod'

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    message: z.string().min(10, "Message must be at least 10 characters").max(2000),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const parsed = contactSchema.parse(body)

        if (!emailService.isConfigured()) {
            console.warn('[Contact API] Received submission, but email service is not configured. Returning 200 with warning.')
            // We return 200 to the client so form submissions succeed in dev/environments 
            // without SMTP, but we log the warning.
            return NextResponse.json({ success: true, warning: 'Email service inactive' })
        }

        // Send welcome/confirmation to user
        await emailService.sendWelcome({ to: parsed.email, name: parsed.name })

        // Optionally send alert to admin (using same template engine for now)
        const adminEmail = process.env.SMTP_FROM ?? 'contact@insuranceclarity.in'
        await emailService.sendNewsletter({
            to: adminEmail,
            subject: `New Contact Message from ${parsed.name}`,
            htmlBody: `
                <p><strong>Name:</strong> ${parsed.name}</p>
                <p><strong>Email:</strong> ${parsed.email}</p>
                <p><strong>Message:</strong></p>
                <blockquote style="border-left: 4px solid #cbd5e1; padding-left: 16px; color: #475569; font-style: italic;">
                    ${parsed.message.replace(/\n/g, '<br>')}
                </blockquote>
            `
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            const err = error as any
            return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal server error processing contact form' }, { status: 500 })
    }
}
