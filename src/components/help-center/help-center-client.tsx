'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpCircle, BookOpen, Shield, CreditCard, ChefHat, Mail } from 'lucide-react'

export default function HelpCenterClient() {
  const faqCategories = [
    {
      title: 'Getting Started',
      icon: <BookOpen className="w-5 h-5" />,
      questions: [
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
          question: 'How do I verify my account?',
          answer:
            "After signup we send a 6-digit verification code to your email. Enter the code on the verification screen to confirm your address and unlock all features.",
        },
      ],
    },
    {
      title: 'Booking & Payments',
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          question: 'How do I book a dining experience?',
          answer:
            "Search for experiences and submit a booking request for the dinner you want. Your card is pre-authorized for the full amount but only charged once the host confirms your reservation. If the host doesn't confirm, the authorization is released automatically and no charge appears on your statement. A phone number on your profile is required to submit a booking.",
        },
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept Visa and Mastercard. All amounts are charged in Icelandic Króna (ISK). Foreign cardholders will see the ISK amount converted to their home currency at their bank\'s exchange rate.',
        },
        {
          question: 'Can I cancel my booking?',
          answer:
            'Yes. Refunds depend on the cancellation policy set by the host (Flexible, Moderate, or Strict), which is shown on the dinner listing and on your booking confirmation. See our Refund & Cancellation Policy for the rules and refund timing.',
        },
      ],
    },
    {
      title: 'Hosting',
      icon: <ChefHat className="w-5 h-5" />,
      questions: [
        {
          question: 'How do I become a host?',
          answer:
            'Sign up as a host (currently available to Icelandic residents only), complete identity verification with Rafræn skilríki (Icelandic eID), add your Icelandic bank account (IBAN), and create your first dining experience listing.',
        },
        {
          question: 'What are the requirements to host?',
          answer:
            'You must be an Icelandic resident, complete identity verification via Rafræn skilríki, and add your Icelandic bank account (IBAN). Hosts are responsible for the food they prepare, including hygiene, allergen disclosure, and compliance with local food and health regulations.',
        },
        {
          question: 'How do I get paid?',
          answer:
            'Hosts receive 80% of the booking price in ISK, paid by bank transfer to your registered Icelandic bank account (IBAN), after the dining event completes. A minimum balance of 10,000 kr is required before a payout is sent. See our Host Payouts page for full details.',
        },
      ],
    },
    {
      title: 'Safety & Trust',
      icon: <Shield className="w-5 h-5" />,
      questions: [
        {
          question: 'How do you verify hosts?',
          answer:
            'All hosts complete identity verification using Rafræn skilríki (Icelandic eID) before they can publish a dinner or receive payouts. Datthome does not perform background checks or food safety inspections — hosts are solely responsible for food preparation, hygiene, and compliance with local regulations.',
        },
        {
          question: 'What if I have a problem with my experience?',
          answer:
            'Contact us at info@datthome.com. As Merchant of Record, Datthome handles payment-related issues, refunds, and disputes. Issues regarding the food or the conduct of the event are the responsibility of the host.',
        },
        {
          question: 'Are the dining experiences safe?',
          answer:
            'Hosts complete identity verification, but Datthome does not inspect kitchens, food, or events. You participate at your own risk — please read the listing, check reviews, and disclose any allergies to the host before the dinner. See our Assumption of Risk & Liability Waiver for full details.',
        },
      ],
    },
  ]

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to your questions
          </p>
        </header>

        {/* Contact */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <p>
                Email:{' '}
                <a
                  href="mailto:info@datthome.com"
                  className="text-primary underline hover:no-underline font-medium"
                >
                  info@datthome.com
                </a>
              </p>
              <p className="text-sm text-muted-foreground">
                We aim to respond within 1 business day.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqCategories.map((category, categoryIndex) => (
              <article key={categoryIndex}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => (
                        <div key={faqIndex} className="border-l-4 border-primary-100 pl-4">
                          <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
