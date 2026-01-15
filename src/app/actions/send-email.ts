'use server'

import { Resend } from 'resend'
import { z } from 'zod'
import { ContactEmailTemplate } from '@/components/email/contact-email-template'

const resend = new Resend(process.env.RESEND_API_KEY)
const toEmails = ['hi@tcd.io']

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const contactFormWithTurnstileSchema = contactFormSchema.extend({
  turnstileToken: z.string().min(1, 'CAPTCHA verification required'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>
export type ContactFormWithTurnstileData = z.infer<
  typeof contactFormWithTurnstileSchema
>

async function verifyTurnstileToken(token: string, ip?: string) {
  const verifyFormData = new FormData()
  verifyFormData.append(
    'secret',
    process.env.NEXT_PRIVATE_TURNSTILE_SECRET_KEY!
  )
  verifyFormData.append('response', token)
  if (ip) {
    verifyFormData.append('remoteip', ip)
  }

  try {
    const result = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: verifyFormData,
      }
    )

    const outcome = await result.json()
    return outcome.success === true
  } catch (error) {
    console.error('Turnstile verification failed:', error)
    return false
  }
}

export async function sendContactEmail(data: ContactFormWithTurnstileData) {
  const validatedFields = contactFormWithTurnstileSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data',
      details: z.treeifyError(validatedFields.error),
    }
  }

  const { name, email, company, message, turnstileToken } = validatedFields.data

  // Verify Turnstile token
  const isTokenValid = await verifyTurnstileToken(turnstileToken)
  if (!isTokenValid) {
    return {
      error: 'CAPTCHA verification failed. Please try again.',
    }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Generative Learning <noreply@web.version47.com>',
      to: toEmails,
      subject: `New message from ${name} (${company})`,
      replyTo: email,
      react: ContactEmailTemplate({ name, email, company, message }),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, id: emailData?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { error: 'Failed to send email. Please try again later.' }
  }
}
