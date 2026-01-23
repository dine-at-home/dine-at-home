'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  BookOpen,
  Shield,
  CreditCard,
  ChefHat,
  Star,
  Calendar,
  MapPin,
} from 'lucide-react'
import { useState } from 'react'

export default function HelpCenterClient() {
  const [searchQuery, setSearchQuery] = useState('')

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

  const contactMethods = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: <MessageCircle className="w-6 h-6" />,
      action: 'Start Chat',
      available: 'Available 24/7',
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Mail className="w-6 h-6" />,
      action: 'Send Email',
      available: 'Response within 24 hours',
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our team',
      icon: <Phone className="w-6 h-6" />,
      action: 'Call Now',
      available: 'Mon-Fri 9AM-6PM EST',
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
            Find answers to your questions or get in touch with our support team
          </p>
        </header>

        {/* Search Bar */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Links */}
        <nav className="mb-12" aria-label="Help Quick Links">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Calendar className="w-6 h-6" />
              <span className="font-medium">Booking Help</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <CreditCard className="w-6 h-6" />
              <span className="font-medium">Payment Issues</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <ChefHat className="w-6 h-6" />
              <span className="font-medium">Hosting Guide</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="w-6 h-6" />
              <span className="font-medium">Safety Info</span>
            </Button>
          </div>
        </nav>

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

        {/* Contact Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <article key={index}>
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {method.icon}
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full mb-2">{method.action}</Button>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      {method.available}
                    </p>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>
        </section>

        {/* Popular Topics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'How to Book',
                icon: <Calendar className="w-4 h-4 text-blue-600" />,
                bg: 'bg-blue-100',
                desc: 'Step-by-step booking guide',
              },
              {
                title: 'Hosting Tips',
                icon: <ChefHat className="w-4 h-4 text-green-600" />,
                bg: 'bg-green-100',
                desc: 'Everything for hosts',
              },
              {
                title: 'Refund Policy',
                icon: <CreditCard className="w-4 h-4 text-purple-600" />,
                bg: 'bg-purple-100',
                desc: 'Understanding refunds',
              },
              {
                title: 'Reviews',
                icon: <Star className="w-4 h-4 text-orange-600" />,
                bg: 'bg-orange-100',
                desc: 'Ratings guide',
              },
              {
                title: 'Safety',
                icon: <Shield className="w-4 h-4 text-red-600" />,
                bg: 'bg-red-100',
                desc: 'Stay safe',
              },
              {
                title: 'Find Food',
                icon: <MapPin className="w-4 h-4 text-teal-600" />,
                bg: 'bg-teal-100',
                desc: 'Discover experiences',
              },
            ].map((topic, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 ${topic.bg} rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      {topic.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground">{topic.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="bg-primary-50 rounded-xl">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Still Need Help?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                Contact Support
              </Button>
              <Button variant="outline" size="lg">
                Browse All Articles
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
