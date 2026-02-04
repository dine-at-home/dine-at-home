'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Globe,
  ChefHat,
  Users,
  AlertTriangle,
  Shield,
  UserX,
  RefreshCw,
  Scale,
} from 'lucide-react'

export default function TermsOfUseClient() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Terms of Use</h1>
          <p className="text-xl text-muted-foreground">Last updated: February 2, 2026</p>
        </header>

        <main className="space-y-8">
          {/* 1. General */}
          <section aria-labelledby="general">
            <Card>
              <CardHeader>
                <CardTitle id="general" className="text-2xl flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  1. General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  These Terms of Use govern the use of datthome.com ("the Website", "we", "us"). By
                  accessing, registering on, or using the Website in any manner, you agree to be
                  bound by these Terms.
                </p>
                <p>
                  The Website acts solely as an online platform connecting individuals who host
                  dining events ("Hosts") and individuals who attend dining events ("Guests").
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 2. Role of the Website */}
          <section aria-labelledby="role">
            <Card>
              <CardHeader>
                <CardTitle id="role" className="text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  2. Role of the Website
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>The Website:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>provides a technical platform for listing and booking dining events</li>
                  <li>does not organize, supervise, prepare, or control any dining events</li>
                  <li>is not a party to any agreement between Hosts and Guests</li>
                </ul>
                <p className="mt-4">
                  All arrangements, agreements, and interactions occur exclusively between Hosts and
                  Guests.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 3. Responsibility of Hosts */}
          <section aria-labelledby="host-responsibility">
            <Card>
              <CardHeader>
                <CardTitle id="host-responsibility" className="text-2xl flex items-center gap-2">
                  <ChefHat className="w-6 h-6" />
                  3. Responsibility of Hosts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Hosts are solely and fully responsible for:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>food preparation, ingredients, hygiene, and food safety</li>
                  <li>providing accurate allergen and dietary information</li>
                  <li>compliance with all applicable laws, regulations, and health standards</li>
                  <li>the accuracy and completeness of information published on the Website</li>
                </ul>
                <p className="mt-4 font-medium">
                  The Website assumes no responsibility for food quality, safety, or outcomes of
                  dining events.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 4. Responsibility of Guests */}
          <section aria-labelledby="guest-responsibility">
            <Card>
              <CardHeader>
                <CardTitle id="guest-responsibility" className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  4. Responsibility of Guests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Guests participate in dining events at their own risk and are solely responsible
                  for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>their own health, allergies, and dietary choices</li>
                  <li>informing Hosts of allergies or special requirements</li>
                  <li>their conduct during dining events</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 5. Disclaimer of Liability */}
          <section aria-labelledby="disclaimer">
            <Card>
              <CardHeader>
                <CardTitle id="disclaimer" className="text-2xl flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  5. Disclaimer of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>The Website and its owners:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    assume no liability for any dining event listed or booked through the Website
                  </li>
                  <li>
                    assume no liability for illness, injury, allergic reactions, accidents, damages,
                    losses, or disputes
                  </li>
                  <li>
                    make no warranties regarding the quality, safety, legality, or suitability of
                    any dining event
                  </li>
                </ul>
                <p className="mt-4 font-medium">
                  Use of the Website is entirely at the user's own risk.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 6. Indemnification */}
          <section aria-labelledby="indemnification">
            <Card>
              <CardHeader>
                <CardTitle id="indemnification" className="text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  6. Indemnification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You agree to indemnify and hold harmless the Website, its owners, operators, and
                  affiliates from any claims, damages, losses, liabilities, or expenses arising
                  from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>your participation in dining events</li>
                  <li>your breach of these Terms</li>
                  <li>your violation of any law or third-party rights</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 7. Account Suspension and Termination */}
          <section aria-labelledby="termination">
            <Card>
              <CardHeader>
                <CardTitle id="termination" className="text-2xl flex items-center gap-2">
                  <UserX className="w-6 h-6" />
                  7. Account Suspension and Termination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We reserve the right to suspend or terminate user accounts and remove content at
                  any time, without prior notice, if we believe these Terms have been violated or
                  the Website is misused.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 8. Changes to Terms */}
          <section aria-labelledby="changes">
            <Card>
              <CardHeader>
                <CardTitle id="changes" className="text-2xl flex items-center gap-2">
                  <RefreshCw className="w-6 h-6" />
                  8. Changes to Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We may update these Terms at any time. Continued use of the Website constitutes
                  acceptance of the updated Terms.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 9. Governing Law */}
          <section aria-labelledby="governing-law">
            <Card>
              <CardHeader>
                <CardTitle id="governing-law" className="text-2xl flex items-center gap-2">
                  <Scale className="w-6 h-6" />
                  9. Governing Law
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of
                  Iceland. Any disputes shall be subject to the exclusive jurisdiction of Icelandic
                  courts.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}
