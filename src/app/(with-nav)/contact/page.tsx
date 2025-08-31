import { Metadata } from 'next'
import { ContactForm } from '@/components/contact/contact-form'
import AnimationsInit from '@/components/AnimationsInit'

export const metadata: Metadata = {
  title: 'Contact Robo Inspo',
  description: 'Get in touch with our team',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto py-16 md:py-26 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl md:text-6xl font-bold font-brachial uppercase ">
            Say Hello
          </h1>
        </div>
        <ContactForm />
      </div>
    </div>
  )
}
