'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Shield,
  Database,
  Eye,
  Share2,
  Cookie,
  Lock,
  Clock,
  UserCheck,
  Globe,
  Mail,
  RefreshCw,
} from 'lucide-react'

export default function PrivacyPolicyClient() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">Last updated: February 2, 2026</p>
        </header>

        <main className="space-y-8">
          {/* 1. Introduction */}
          <section aria-labelledby="intro">
            <Card>
              <CardHeader>
                <CardTitle id="intro" className="text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  1. Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Welcome to datthome.com ("the Website", "we", "us", "our"). We are committed to
                  protecting your privacy and personal data. This Privacy Policy explains how we
                  collect, use, store, and protect your information when you use our platform.
                </p>
                <p>
                  By using the Website, you consent to the practices described in this Privacy
                  Policy. If you do not agree with this policy, please do not use our services.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 2. Information We Collect */}
          <section aria-labelledby="collection">
            <Card>
              <CardHeader>
                <CardTitle id="collection" className="text-2xl flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  2. Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <article>
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Name, email address, and phone number</li>
                    <li>Profile photo and biography</li>
                    <li>Address information (for Hosts)</li>
                    <li>Payment and billing information</li>
                    <li>Government-issued ID (for identity verification, if applicable)</li>
                  </ul>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2">Usage Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Browsing history and search queries on the Website</li>
                    <li>Booking history and dining preferences</li>
                    <li>Reviews, ratings, and feedback submitted</li>
                    <li>Communications with other users and support</li>
                  </ul>
                </article>

                <article>
                  <h3 className="text-lg font-semibold mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>IP address, browser type, and device information</li>
                    <li>Operating system and language preferences</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Location data (with your consent)</li>
                  </ul>
                </article>
              </CardContent>
            </Card>
          </section>

          {/* 3. How We Use Your Information */}
          <section aria-labelledby="usage">
            <Card>
              <CardHeader>
                <CardTitle id="usage" className="text-2xl flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  3. How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process bookings, payments, and payouts</li>
                  <li>Verify user identities and prevent fraud</li>
                  <li>Facilitate communication between Hosts and Guests</li>
                  <li>Send booking confirmations, reminders, and updates</li>
                  <li>Personalize your experience and show relevant content</li>
                  <li>Respond to customer support inquiries</li>
                  <li>Comply with legal obligations</li>
                  <li>Send promotional communications (with your consent)</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 4. Information Sharing */}
          <section aria-labelledby="sharing">
            <Card>
              <CardHeader>
                <CardTitle id="sharing" className="text-2xl flex items-center gap-2">
                  <Share2 className="w-6 h-6" />
                  4. Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Other Users:</strong> Hosts see Guest names, contact info, and dietary
                    preferences; Guests see Host profiles and addresses after booking
                  </li>
                  <li>
                    <strong>Payment Processors:</strong> Secure payment processing through
                    third-party providers
                  </li>
                  <li>
                    <strong>Service Providers:</strong> Hosting, analytics, email, and customer
                    support services
                  </li>
                  <li>
                    <strong>Legal Authorities:</strong> When required by law or to protect our
                    rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with mergers, acquisitions,
                    or asset sales
                  </li>
                </ul>
                <p className="mt-4 font-medium">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 5. Cookies and Tracking */}
          <section aria-labelledby="cookies">
            <Card>
              <CardHeader>
                <CardTitle id="cookies" className="text-2xl flex items-center gap-2">
                  <Cookie className="w-6 h-6" />
                  5. Cookies and Tracking Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Essential Cookies:</strong> Required for the Website to function
                    properly
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings and preferences
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Understand how users interact with our
                    Website
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Deliver relevant advertisements (with
                    consent)
                  </li>
                </ul>
                <p className="mt-4">
                  You can manage cookie preferences through your browser settings. Disabling certain
                  cookies may affect Website functionality.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 6. Data Security */}
          <section aria-labelledby="security">
            <Card>
              <CardHeader>
                <CardTitle id="security" className="text-2xl flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  6. Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We implement industry-standard security measures to protect your data, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>SSL/TLS encryption for all data transmissions</li>
                  <li>Secure payment processing (PCI-DSS compliant)</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Access controls and authentication systems</li>
                  <li>Encrypted storage for sensitive data</li>
                </ul>
                <p className="mt-4">
                  While we take reasonable precautions, no method of transmission over the Internet
                  is 100% secure. You use the Website at your own risk.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 7. Data Retention */}
          <section aria-labelledby="retention">
            <Card>
              <CardHeader>
                <CardTitle id="retention" className="text-2xl flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  7. Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We retain your personal data for as long as:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Your account remains active</li>
                  <li>Necessary to provide our services</li>
                  <li>Required to comply with legal obligations</li>
                  <li>Needed to resolve disputes or enforce agreements</li>
                </ul>
                <p className="mt-4">
                  After account deletion, we may retain certain data for legal, fraud prevention, or
                  legitimate business purposes for a limited period.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 8. Your Rights */}
          <section aria-labelledby="rights">
            <Card>
              <CardHeader>
                <CardTitle id="rights" className="text-2xl flex items-center gap-2">
                  <UserCheck className="w-6 h-6" />
                  8. Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal data
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of inaccurate data
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal data
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in a portable format
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain processing activities
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw consent for marketing communications
                  </li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact us at <strong>info@datthome.com</strong>. We
                  will respond within 30 days.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 9. International Transfers */}
          <section aria-labelledby="international">
            <Card>
              <CardHeader>
                <CardTitle id="international" className="text-2xl flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  9. International Data Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Your data may be transferred to and processed in countries outside Iceland or the
                  European Economic Area (EEA). We ensure appropriate safeguards are in place, such
                  as standard contractual clauses, to protect your data in accordance with
                  applicable data protection laws.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 10. Children's Privacy */}
          <section aria-labelledby="children">
            <Card>
              <CardHeader>
                <CardTitle id="children" className="text-2xl">
                  10. Children's Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our services are not intended for individuals under the age of 18. We do not
                  knowingly collect personal information from children. If we become aware that we
                  have collected data from a child, we will delete it promptly.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 11. Changes to This Policy */}
          <section aria-labelledby="changes">
            <Card>
              <CardHeader>
                <CardTitle id="changes" className="text-2xl flex items-center gap-2">
                  <RefreshCw className="w-6 h-6" />
                  11. Changes to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of
                  significant changes by posting a notice on the Website or sending you an email.
                  Continued use of the Website after changes constitutes acceptance of the updated
                  policy.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 12. Contact Us */}
          <section aria-labelledby="contact">
            <Card>
              <CardHeader>
                <CardTitle id="contact" className="text-2xl flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  12. Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If you have questions about this Privacy Policy or our data practices, please
                  contact us:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p>
                    <strong>Email:</strong> info@datthome.com
                  </p>
                  <p>
                    <strong>Website:</strong> datthome.com
                  </p>
                  <p>
                    <strong>Jurisdiction:</strong> Iceland
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
