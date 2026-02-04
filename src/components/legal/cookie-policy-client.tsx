'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cookie, Settings, BarChart3, Target, Shield, Trash2, Mail } from 'lucide-react'

export default function CookiePolicyClient() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Cookie Policy</h1>
          <p className="text-xl text-muted-foreground">Last updated: February 2, 2026</p>
        </header>

        <main className="space-y-8">
          {/* 1. What Are Cookies */}
          <section aria-labelledby="what-are-cookies">
            <Card>
              <CardHeader>
                <CardTitle id="what-are-cookies" className="text-2xl flex items-center gap-2">
                  <Cookie className="w-6 h-6" />
                  1. What Are Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Cookies are small text files that are placed on your device when you visit a
                  website. They help websites remember your preferences, keep you logged in, and
                  understand how you use the site.
                </p>
                <p>
                  We use cookies and similar technologies (such as local storage and pixels) to
                  provide, protect, and improve datthome.com ("the Website").
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 2. Types of Cookies We Use */}
          <section aria-labelledby="types-of-cookies">
            <Card>
              <CardHeader>
                <CardTitle id="types-of-cookies" className="text-2xl flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  2. Types of Cookies We Use
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Essential Cookies
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies are necessary for the Website to function properly. They enable
                    core features such as:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>User authentication and login sessions</li>
                    <li>Shopping cart and booking functionality</li>
                    <li>Security features and fraud prevention</li>
                    <li>Load balancing and server requests</li>
                  </ul>
                  <p className="mt-2 text-sm font-medium text-green-700">
                    These cookies cannot be disabled as they are essential for the Website to work.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Preference Cookies
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies remember your settings and preferences:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Language and region preferences</li>
                    <li>Display settings (e.g., dark/light mode)</li>
                    <li>Recently viewed dinners and searches</li>
                  </ul>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Analytics Cookies
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies help us understand how visitors use the Website:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Pages visited and time spent on pages</li>
                    <li>Click patterns and navigation paths</li>
                    <li>Error reports and performance metrics</li>
                    <li>Traffic sources and referral data</li>
                  </ul>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We use analytics services such as Google Analytics to collect this information.
                  </p>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Marketing Cookies
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies are used to deliver relevant advertisements:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Personalized ads based on your interests</li>
                    <li>Remarketing across other websites</li>
                    <li>Social media integration and sharing</li>
                    <li>Measuring advertising effectiveness</li>
                  </ul>
                  <p className="mt-2 text-sm text-muted-foreground">
                    These cookies are only set with your consent.
                  </p>
                </article>
              </CardContent>
            </Card>
          </section>

          {/* 3. Third-Party Cookies */}
          <section aria-labelledby="third-party">
            <Card>
              <CardHeader>
                <CardTitle id="third-party" className="text-2xl">
                  3. Third-Party Cookies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Some cookies are placed by third-party services that appear on our pages. These
                  include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Google Analytics:</strong> Website traffic analysis
                  </li>
                  <li>
                    <strong>Payment Providers:</strong> Secure payment processing
                  </li>
                  <li>
                    <strong>Social Media:</strong> Share buttons and embedded content
                  </li>
                  <li>
                    <strong>Maps:</strong> Location and address services
                  </li>
                </ul>
                <p className="mt-4">
                  These third parties have their own privacy and cookie policies, which we encourage
                  you to review.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 4. Managing Cookies */}
          <section aria-labelledby="managing">
            <Card>
              <CardHeader>
                <CardTitle id="managing" className="text-2xl flex items-center gap-2">
                  <Trash2 className="w-6 h-6" />
                  4. Managing Your Cookie Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>You can manage cookies in several ways:</p>

                <article className="space-y-2">
                  <h3 className="font-semibold">Cookie Banner</h3>
                  <p className="text-muted-foreground">
                    When you first visit our Website, you will see a cookie consent banner where you
                    can accept or customize your preferences.
                  </p>
                </article>

                <article className="space-y-2">
                  <h3 className="font-semibold">Browser Settings</h3>
                  <p className="text-muted-foreground">
                    Most browsers allow you to block or delete cookies through their settings:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Chrome: Settings → Privacy and Security → Cookies</li>
                    <li>Firefox: Settings → Privacy & Security → Cookies</li>
                    <li>Safari: Preferences → Privacy → Cookies</li>
                    <li>Edge: Settings → Cookies and Site Permissions</li>
                  </ul>
                </article>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <p className="text-amber-800 text-sm">
                    <strong>Note:</strong> Blocking essential cookies may prevent parts of the
                    Website from functioning properly, including login and booking features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 5. Data Retention */}
          <section aria-labelledby="retention">
            <Card>
              <CardHeader>
                <CardTitle id="retention" className="text-2xl">
                  5. Cookie Retention Periods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Cookies have different lifespans:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Session cookies:</strong> Deleted when you close your browser
                  </li>
                  <li>
                    <strong>Persistent cookies:</strong> Remain for a set period (e.g., 30 days to 2
                    years)
                  </li>
                </ul>
                <p className="mt-4">
                  You can delete cookies at any time through your browser settings.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 6. Updates to This Policy */}
          <section aria-labelledby="updates">
            <Card>
              <CardHeader>
                <CardTitle id="updates" className="text-2xl">
                  6. Updates to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We may update this Cookie Policy from time to time. Changes will be posted on this
                  page with an updated revision date. Continued use of the Website after changes
                  constitutes acceptance of the updated policy.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 7. Contact Us */}
          <section aria-labelledby="contact">
            <Card>
              <CardHeader>
                <CardTitle id="contact" className="text-2xl flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  7. Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>If you have questions about our use of cookies, please contact us:</p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Email:</strong> info@datthome.com
                  </p>
                  <p>
                    <strong>Website:</strong> datthome.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}
