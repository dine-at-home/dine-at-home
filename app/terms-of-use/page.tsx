'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Scale, Users, CreditCard, AlertTriangle, Shield } from 'lucide-react'

export default function TermsOfUsePage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Terms of Use</h1>
          <p className="text-xl text-muted-foreground">Last updated: October 23, 2024</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to DineWithUs! These Terms of Use ("Terms") govern your use of our platform
              and services. By accessing or using our service, you agree to be bound by these Terms
              and our Privacy Policy.
            </p>
            <p>
              If you do not agree to these Terms, please do not use our service. We reserve the
              right to modify these Terms at any time, and your continued use of the service
              constitutes acceptance of any changes.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Service Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              DineWithUs is a platform that connects guests with local hosts for authentic dining
              experiences. We facilitate:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Discovery and booking of dining experiences</li>
              <li>Communication between guests and hosts</li>
              <li>Payment processing for bookings</li>
              <li>Reviews and ratings system</li>
              <li>Customer support and assistance</li>
            </ul>
            <p>
              We act as an intermediary between guests and hosts and are not responsible for the
              actual dining experiences provided by hosts.
            </p>
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">General Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate and up-to-date information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service in compliance with applicable laws</li>
                <li>Respect other users and their property</li>
                <li>Report any violations or safety concerns</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Guest Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Arrive on time for scheduled dining experiences</li>
                <li>Respect the host's home and property</li>
                <li>Follow any dietary restrictions or requirements</li>
                <li>Provide honest and constructive feedback</li>
                <li>Cancel bookings in accordance with our cancellation policy</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Host Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide accurate information about dining experiences</li>
                <li>Maintain food safety and hygiene standards</li>
                <li>Honor confirmed bookings and commitments</li>
                <li>Provide a safe and welcoming environment</li>
                <li>Comply with local health and safety regulations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>The following activities are strictly prohibited:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Providing false or misleading information</li>
              <li>Harassment, discrimination, or inappropriate behavior</li>
              <li>Attempting to circumvent our payment system</li>
              <li>Using the platform for illegal activities</li>
              <li>Violating intellectual property rights</li>
              <li>Spamming or sending unsolicited communications</li>
              <li>Creating multiple accounts to avoid restrictions</li>
              <li>Interfering with the platform's functionality</li>
            </ul>
          </CardContent>
        </Card>

        {/* Payments and Fees */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Payments and Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Payment Processing</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All payments are processed securely through our platform</li>
                <li>Payment is required at the time of booking confirmation</li>
                <li>We may charge service fees in addition to the host's price</li>
                <li>Payment methods accepted include major credit cards and digital wallets</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Refunds and Cancellations</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Cancellations made 24+ hours in advance receive full refunds</li>
                <li>Cancellations within 24 hours may be subject to partial refunds</li>
                <li>No-shows are not eligible for refunds</li>
                <li>Refunds are processed within 5-10 business days</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Disclaimers and Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>DineWithUs provides the platform "as is" and makes no warranties regarding:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>The quality or safety of dining experiences</li>
              <li>The accuracy of host information or listings</li>
              <li>The availability or reliability of our service</li>
              <li>The conduct of other users on the platform</li>
            </ul>
            <p>
              We are not liable for any damages arising from your use of the service, including but
              not limited to food allergies, illness, property damage, or personal injury.
            </p>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The DineWithUs platform, including its design, functionality, and content, is
              protected by intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Copy, modify, or distribute our platform or content</li>
              <li>Use our trademarks or logos without permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Create derivative works based on our platform</li>
            </ul>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Account Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We reserve the right to suspend or terminate your account at any time for:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Violation of these Terms of Use</li>
              <li>Fraudulent or illegal activity</li>
              <li>Misrepresentation or false information</li>
              <li>Abuse of other users or the platform</li>
            </ul>
            <p>You may also terminate your account at any time by contacting our support team.</p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Scale className="w-6 h-6" />
              Governing Law and Disputes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These Terms are governed by the laws of [Your Jurisdiction]. Any disputes arising from
              these Terms or your use of the service will be resolved through binding arbitration.
            </p>
            <p>
              We encourage users to resolve disputes amicably through our customer support team
              before pursuing legal action.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>If you have any questions about these Terms of Use, please contact us:</p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong> legal@dinewithus.com
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
      </div>
    </MainLayout>
  )
}
