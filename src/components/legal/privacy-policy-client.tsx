'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Lock, Database, Mail } from 'lucide-react'

export default function PrivacyPolicyClient() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">Last updated: October 23, 2024</p>
        </header>

        <main className="space-y-8">
          <section aria-labelledby="intro">
            <Card>
              <CardHeader>
                <CardTitle id="intro" className="text-2xl">
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Welcome to Dine at Home! We are committed to protecting your privacy.</p>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="collection">
            <Card>
              <CardHeader>
                <CardTitle id="collection" className="text-2xl flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Name, email, and contact details</li>
                  <li>Profile and preference information</li>
                  <li>Secure payment data</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Expanded sections can be added here */}

          <section aria-labelledby="contact">
            <Card>
              <CardHeader>
                <CardTitle id="contact" className="text-2xl flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Questions? Contact us at privacy@dineathome.com</p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}
