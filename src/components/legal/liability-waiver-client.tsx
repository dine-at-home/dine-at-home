'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertTriangle,
  Shield,
  ShieldOff,
  Users,
  FileWarning,
  ShieldX,
  FileCheck,
  Puzzle,
  Scale,
} from 'lucide-react'

export default function LiabilityWaiverClient() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Assumption of Risk & Liability Waiver
          </h1>
          <p className="text-xl text-muted-foreground">IMPORTANT – PLEASE READ CAREFULLY</p>
        </header>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-amber-800 text-center font-medium">
            By accessing or using datthome.com (the "Website"), and by hosting, booking, or
            attending any dining event listed on the Website, you expressly acknowledge, understand,
            and agree to the following:
          </p>
        </div>

        <main className="space-y-8">
          {/* 1. Assumption of All Risks */}
          <section aria-labelledby="assumption-of-risks">
            <Card>
              <CardHeader>
                <CardTitle id="assumption-of-risks" className="text-2xl flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  1. Assumption of All Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You acknowledge that participation in dining events involves inherent risks,
                  including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>foodborne illness, allergic reactions, and contamination</li>
                  <li>personal injury, accidents, or property damage</li>
                  <li>interactions with strangers in private or public spaces</li>
                </ul>
                <p className="mt-4 font-medium text-amber-700 bg-amber-50 p-3 rounded-lg">
                  You voluntarily and knowingly assume all risks, whether known or unknown, arising
                  from or related to any dining event.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 2. Full Release of Liability */}
          <section aria-labelledby="release-of-liability">
            <Card>
              <CardHeader>
                <CardTitle id="release-of-liability" className="text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  2. Full Release of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  To the maximum extent permitted by law, you hereby irrevocably release, waive,
                  discharge, and hold harmless:
                </p>
                <p className="font-medium">
                  datthome.com, its owners, operators, directors, employees, contractors, and
                  affiliates
                </p>
                <p>
                  from any and all claims, demands, damages, losses, liabilities, costs, or causes
                  of action of any kind, whether in contract, tort, negligence, strict liability, or
                  otherwise, arising out of or related to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>hosting, booking, attending, or participating in any dining event</li>
                  <li>food preparation, consumption, or allergens</li>
                  <li>acts or omissions of Hosts, Guests, or third parties</li>
                </ul>
                <p className="mt-4 font-medium text-red-700 bg-red-50 p-3 rounded-lg">
                  This release applies even if the claim arises from alleged negligence of the
                  Website.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 3. No Duty of Care */}
          <section aria-labelledby="no-duty-of-care">
            <Card>
              <CardHeader>
                <CardTitle id="no-duty-of-care" className="text-2xl flex items-center gap-2">
                  <ShieldOff className="w-6 h-6" />
                  3. No Duty of Care
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>You acknowledge and agree that the Website:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>owes no duty of care to Hosts or Guests</li>
                  <li>does not inspect, verify, approve, or supervise dining events</li>
                  <li>does not verify compliance with health, safety, or food regulations</li>
                </ul>
                <p className="mt-4">
                  The Website makes no representations or guarantees regarding any dining event or
                  user.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 4. Host and Guest Responsibility */}
          <section aria-labelledby="host-guest-responsibility">
            <Card>
              <CardHeader>
                <CardTitle
                  id="host-guest-responsibility"
                  className="text-2xl flex items-center gap-2"
                >
                  <Users className="w-6 h-6" />
                  4. Host and Guest Responsibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Hosts and Guests are solely and entirely responsible for:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>their own actions, omissions, health, and safety</li>
                  <li>compliance with all applicable laws and regulations</li>
                  <li>resolving disputes directly with each other</li>
                </ul>
                <p className="mt-4 font-medium">
                  The Website shall not be involved in dispute resolution or liability allocation.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 5. Indemnification */}
          <section aria-labelledby="indemnification">
            <Card>
              <CardHeader>
                <CardTitle id="indemnification" className="text-2xl flex items-center gap-2">
                  <FileWarning className="w-6 h-6" />
                  5. Indemnification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You agree to fully indemnify, defend, and hold harmless the Website from any
                  claims, damages, losses, fines, legal fees, or expenses arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>your participation in dining events</li>
                  <li>your breach of these Terms or any agreement</li>
                  <li>your violation of law or third-party rights</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 6. No Insurance Provided */}
          <section aria-labelledby="no-insurance">
            <Card>
              <CardHeader>
                <CardTitle id="no-insurance" className="text-2xl flex items-center gap-2">
                  <ShieldX className="w-6 h-6" />
                  6. No Insurance Provided
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  The Website does not provide insurance coverage of any kind for Hosts, Guests, or
                  events. You are solely responsible for obtaining any insurance you deem necessary.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 7. Binding Agreement */}
          <section aria-labelledby="binding-agreement">
            <Card>
              <CardHeader>
                <CardTitle id="binding-agreement" className="text-2xl flex items-center gap-2">
                  <FileCheck className="w-6 h-6" />
                  7. Binding Agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium text-amber-700 bg-amber-50 p-3 rounded-lg">
                  This Liability Waiver constitutes a legally binding agreement. If you do not
                  agree, you must not use the Website or participate in any dining event.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 8. Severability */}
          <section aria-labelledby="severability">
            <Card>
              <CardHeader>
                <CardTitle id="severability" className="text-2xl flex items-center gap-2">
                  <Puzzle className="w-6 h-6" />
                  8. Severability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If any portion of this Waiver is found unenforceable, the remaining provisions
                  shall remain in full force and effect.
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
                  This Waiver shall be governed by and interpreted in accordance with the laws of
                  Iceland, without regard to conflict of law principles.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}
