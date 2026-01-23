'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Scale, Users, CreditCard, AlertTriangle } from 'lucide-react'

export default function TermsOfUseClient() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Terms of Use</h1>
          <p className="text-xl text-muted-foreground">Last updated: October 23, 2024</p>
        </header>

        <main className="space-y-8">
          <section aria-labelledby="agreement">
            <Card>
              <CardHeader>
                <CardTitle id="agreement" className="text-2xl">
                  Agreement to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Welcome to Dine at Home! These Terms of Use ("Terms") govern your use of our
                  platform and services. By accessing or using our service, you agree to be bound by
                  these Terms and our Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="service-description">
            <Card>
              <CardHeader>
                <CardTitle id="service-description" className="text-2xl">
                  Service Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Dine at Home is a platform that connects guests with local hosts for authentic
                  dining experiences. We facilitate discovery, booking, and payment processing.
                </p>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="user-responsibilities">
            <Card>
              <CardHeader>
                <CardTitle id="user-responsibilities" className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  User Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2">General Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide accurate and up-to-date information</li>
                    <li>Maintain account security</li>
                  </ul>
                </article>
              </CardContent>
            </Card>
          </section>

          {/* Additional sections can be expanded here as needed from original content */}

          <section aria-labelledby="contact">
            <Card>
              <CardHeader>
                <CardTitle id="contact" className="text-2xl flex items-center gap-2">
                  <Scale className="w-6 h-6" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>For questions about these Terms, contact us at legal@datthome.com</p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}
