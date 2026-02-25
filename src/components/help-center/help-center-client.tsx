'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { HelpCircle, BookOpen, Shield, CreditCard, ChefHat } from 'lucide-react'

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
            "We'll send you a verification email after signup. Click the link in the email to verify your account and unlock all features.",
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
            "Search for experiences, select your preferred date and time, and complete the booking process. You'll receive instant confirmation and all details.",
        },
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept all major credit cards (Visa, MasterCard, American Express) and digital wallets like PayPal and Apple Pay.',
        },
        {
          question: 'Can I cancel my booking?',
          answer:
            'Yes! You can cancel bookings up to 24 hours in advance for a full refund. Cancellations within 24 hours may be subject to different policies.',
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
            'Sign up as a host, complete your profile with your culinary background, and create your first dining experience listing.',
        },
        {
          question: 'What are the requirements to host?',
          answer:
            "You need a safe kitchen space, food safety knowledge, and a passion for sharing your culinary skills. We'll guide you through the verification process.",
        },
        {
          question: 'How do I get paid?',
          answer:
            'Hosts receive payments within 24-48 hours after each completed dining experience, minus our service fee.',
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
            'All hosts undergo identity verification, background checks, and food safety assessments before they can start hosting.',
        },
        {
          question: 'What if I have a problem with my experience?',
          answer:
            'Contact our support team immediately. We have a dedicated team to resolve issues and ensure your safety and satisfaction.',
        },
        {
          question: 'Are the dining experiences safe?',
          answer:
            'Yes! All hosts are verified, and we have safety guidelines in place. You can also read reviews from other guests before booking.',
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
