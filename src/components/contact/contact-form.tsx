/// <reference types="@types/cloudflare-turnstile" />
'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  sendContactEmail,
  type ContactFormData,
} from '@/app/actions/send-email'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [lastFocusedElement, setLastFocusedElement] = useState<string | null>(
    null
  )

  const form = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      message: '',
    },
  })

  async function onSubmit(data: ContactFormData) {
    if (!turnstileToken) {
      setSubmitStatus({
        type: 'error',
        message: 'Please complete the CAPTCHA verification.',
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const result = await sendContactEmail({
        ...data,
        turnstileToken,
      })

      if (result.error) {
        setSubmitStatus({
          type: 'error',
          message: result.error,
        })
      } else {
        setSubmitStatus({
          type: 'success',
          message: "Thank you for your message! We'll get back to you soon.",
        })
        form.reset()
        turnstileRef.current?.reset()
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  id={field.name}
                  placeholder="Your name"
                  {...field}
                  onFocus={() => setLastFocusedElement(field.name)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                  onFocus={() => setLastFocusedElement(field.name)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input
                  id={field.name}
                  placeholder="Your company"
                  {...field}
                  onFocus={() => setLastFocusedElement(field.name)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  id={field.name}
                  placeholder="Tell us how we can help..."
                  className="min-h-[120px]"
                  {...field}
                  onFocus={() => setLastFocusedElement(field.name)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitStatus.type && (
          <div
            className={`rounded-md p-4 ${
              submitStatus.type === 'success'
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <Turnstile
          className="absolute"
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(null)}
          onError={() => {
            setSubmitStatus({
              type: 'error',
              message: 'CAPTCHA verification failed. Please try again.',
            })
          }}
          onLoad={() => {
            if (lastFocusedElement) {
              document.getElementById(lastFocusedElement)?.focus()
            }
          }}
          options={{
            theme: 'auto',
            appearance: 'interaction-only',
          }}
        />
        <div>
          <Button type="submit" disabled={isSubmitting || !turnstileToken}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
