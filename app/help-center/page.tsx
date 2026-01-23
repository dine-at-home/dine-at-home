import { Metadata } from 'next'
import HelpCenterClient from '@/components/help-center/help-center-client'
import { JsonLd, getFaqSchema } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Help Center | FAQ & Support | Dine at Home',
  description:
    'Find answers to frequently asked questions about booking, hosting, payments, and safety at Dine at Home.',
  keywords: ['help center', 'faq', 'customer support', 'dining safety', 'refund policy'],
}

const faqData = [
  {
    question: 'How do I create an account?',
    answer:
      "Click 'Sign Up' on our homepage and choose to register as either a guest or host. Fill in your details and verify your email address to get started.",
  },
  {
    question: "What's the difference between a guest and host account?",
    answer:
      'Guests can browse and book dining experiences, while hosts can create and manage their own dining experiences to share with guests.',
  },
  {
    question: 'How do I book a dining experience?',
    answer:
      'Search for experiences, select your preferred date and time, and complete the booking process.',
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes! You can cancel bookings up to 24 hours in advance for a full refund.',
  },
]

export default function HelpCenterPage() {
  return (
    <>
      <JsonLd data={getFaqSchema(faqData)} />
      <HelpCenterClient />
    </>
  )
}
