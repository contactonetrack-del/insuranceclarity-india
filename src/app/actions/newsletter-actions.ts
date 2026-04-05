'use server'

import { prisma }           from '@/lib/prisma'
import { sendWelcomeEmail } from '@/services/email.service'
import { z }                from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function subscribeToNewsletter(formData: FormData) {
  try {
    const email = formData.get('email')

    // Validate input
    const validatedData = subscribeSchema.safeParse({ email })
    if (!validatedData.success) {
      return {
        success: false,
        message: 'Invalid email address',
      }
    }

    // Check if already subscribed
    const existing = await prisma.newsletter.findUnique({
      where: { email: validatedData.data.email },
    })

    if (existing) {
      return {
        success: false,
        message: 'This email is already subscribed.',
      }
    }

    // Save to database
    await prisma.newsletter.create({
      data: { email: validatedData.data.email },
    })

    // Send welcome email (fire & forget — non-critical)
    sendWelcomeEmail(validatedData.data.email, { userName: 'Subscriber' })
      .catch(() => { /* non-fatal */ })

    return {
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    }
  } catch {
    return {
      success: false,
      message: 'An error occurred while subscribing. Please try again later.',
    }
  }
}
