'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Lock, Database, Mail, Phone } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">Last updated: October 23, 2024</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to DineWithUs ("we," "our," or "us"). We are committed to protecting your
              privacy and ensuring the security of your personal information. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use
              our platform.
            </p>
            <p>
              By using our service, you agree to the collection and use of information in accordance
              with this policy. If you do not agree with our policies and practices, please do not
              use our service.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Database className="w-6 h-6" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Name, email address, and phone number</li>
                <li>Profile information including bio, preferences, and profile pictures</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Location information to help you find nearby dining experiences</li>
                <li>Communication preferences and marketing consent</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Usage Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Booking history and dining preferences</li>
                <li>Reviews and ratings you provide</li>
                <li>Search history and saved favorites</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Host Information</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Business information and verification documents</li>
                <li>Bank account details for payments (encrypted and secure)</li>
                <li>Listing information and photos</li>
                <li>Performance metrics and host statistics</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Eye className="w-6 h-6" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Service Provision</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Facilitate bookings and dining experiences</li>
                <li>Process payments and handle transactions</li>
                <li>Provide customer support and assistance</li>
                <li>Send booking confirmations and updates</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Platform Improvement</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Analyze usage patterns to improve our service</li>
                <li>Develop new features and functionality</li>
                <li>Personalize your experience and recommendations</li>
                <li>Conduct research and analytics</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Communication</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Send important service updates and notifications</li>
                <li>Provide marketing communications (with your consent)</li>
                <li>Share promotional offers and new features</li>
                <li>Send surveys and feedback requests</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Information Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>With Hosts/Guest:</strong> Essential information to facilitate bookings and
                dining experiences
              </li>
              <li>
                <strong>Service Providers:</strong> Trusted third parties who assist in operating
                our platform
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect our rights
                and safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with mergers, acquisitions, or
                asset sales
              </li>
              <li>
                <strong>With Consent:</strong> When you explicitly agree to share your information
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. These measures
              include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>SSL encryption for data transmission</li>
              <li>Secure data storage and access controls</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Access:</strong> Request access to your personal information
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal information
              </li>
              <li>
                <strong>Portability:</strong> Request a copy of your data in a portable format
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing communications
              </li>
              <li>
                <strong>Restriction:</strong> Request limitation of processing in certain
                circumstances
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Cookies and Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our
              platform. These technologies help us:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Remember your preferences and settings</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Provide personalized content and recommendations</li>
              <li>Improve site functionality and performance</li>
            </ul>
            <p>
              You can control cookie settings through your browser preferences, though this may
              affect some functionality.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about this Privacy Policy or our data practices, please
              contact us:
            </p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> privacy@dinewithus.com
              </p>
              <p>
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
              <p>
                <strong>Address:</strong> 123 Food Street, Culinary City, CC 12345
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
