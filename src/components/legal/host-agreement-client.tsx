'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChefHat,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Scale,
  FileWarning,
  Banknote,
  Lock,
  RefreshCw,
  UserX,
  Receipt,
} from 'lucide-react'

export default function HostAgreementClient() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Host Agreement</h1>
          <p className="text-xl text-muted-foreground">
            The terms that govern your relationship with Datthome as a Host
          </p>
          <p className="text-sm text-muted-foreground mt-2">Last updated: May 8, 2026</p>
        </header>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-amber-800 text-center font-medium">
            This Host Agreement is a legally binding contract between you (the "Host") and Esja
            Fjarskipti ehf., operating as Datthome ("Datthome", "we", "us"). It applies in addition
            to the Terms of Use and Liability Waiver. By completing host onboarding or publishing a
            dinner you agree to be bound by it.
          </p>
        </div>

        <main className="space-y-8">
          {/* 1. Eligibility */}
          <section aria-labelledby="eligibility">
            <Card>
              <CardHeader>
                <CardTitle id="eligibility" className="text-2xl flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" />
                  1. Eligibility and Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>To act as a Host you must:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>be at least 18 years old and a resident of Iceland</li>
                  <li>
                    complete identity verification with Rafræn skilríki (Icelandic electronic ID)
                  </li>
                  <li>
                    register a Visa or Mastercard payout card in your own legal name before
                    receiving any payout
                  </li>
                  <li>
                    provide accurate personal, contact, and tax information and keep it up to date
                  </li>
                </ul>
                <p>
                  You authorise Datthome to verify your identity and to suspend, restrict, or
                  terminate your account if any information you provide is inaccurate, incomplete,
                  or cannot be verified.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 2. Merchant of Record */}
          <section aria-labelledby="mor">
            <Card>
              <CardHeader>
                <CardTitle id="mor" className="text-2xl flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  2. Merchant of Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Datthome acts as the Merchant of Record for all transactions on the platform. The
                  Guest's contract for payment is with Datthome, not with you. Datthome is the named
                  merchant on the Guest's card statement and is responsible to the card networks,
                  acquiring banks, and tax authorities for the transaction.
                </p>
                <p>
                  You acknowledge that, as Merchant of Record, Datthome is solely entitled to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>set the technical and commercial terms of the payment flow</li>
                  <li>
                    issue refunds, accept or contest chargebacks, and resolve payment-related
                    disputes at its sole discretion
                  </li>
                  <li>collect and remit taxes that Datthome is legally required to remit</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* 3. Host Responsibilities */}
          <section aria-labelledby="host-responsibilities">
            <Card>
              <CardHeader>
                <CardTitle id="host-responsibilities" className="text-2xl flex items-center gap-2">
                  <ChefHat className="w-6 h-6" />
                  3. Host Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>You are solely and fully responsible for:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>food preparation, sourcing, ingredients, hygiene, and food safety</li>
                  <li>accurate allergen, dietary, and ingredient disclosures on every listing</li>
                  <li>
                    compliance with all applicable laws, regulations, and health, safety, and food
                    standards in Iceland
                  </li>
                  <li>
                    the accuracy and completeness of your listings, including price, capacity,
                    location, and dietary information
                  </li>
                  <li>
                    showing up to and properly executing every confirmed dinner, or cancelling on
                    time if you cannot
                  </li>
                  <li>the safety of your premises and the conduct of the event</li>
                  <li>
                    declaring and paying any income tax, social-security, or other personal taxes on
                    amounts you receive from Datthome
                  </li>
                </ul>
                <p>
                  You warrant that you will not list illegal items, alcohol where prohibited,
                  unlicensed regulated services, or anything that violates Datthome's published
                  policies.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 4. Fees and Payouts */}
          <section aria-labelledby="fees-payouts">
            <Card>
              <CardHeader>
                <CardTitle id="fees-payouts" className="text-2xl flex items-center gap-2">
                  <Banknote className="w-6 h-6" />
                  4. Fees and Payouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Datthome charges a platform fee of <strong>20%</strong> of the total booking
                  price. The remainder is the Host's gross payout, before any deductions described
                  in Section 5 (Set-off and Claw-back).
                </p>
                <p>
                  Payouts are released to the Host's registered payout card after the dinner is
                  marked complete and the settlement window has elapsed. The settlement window may
                  vary and is set by Datthome to manage chargeback and dispute risk. Datthome may
                  extend the settlement window for individual bookings if it suspects fraud, abuse,
                  a chargeback risk, or a dispute.
                </p>
                <p>
                  Datthome may change the fee, the payout schedule, the supported payout methods, or
                  the settlement window with reasonable prior notice. Continued use of the platform
                  after a change is in effect constitutes acceptance of the change.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 5. Set-off and Claw-back — KEY PROTECTION */}
          <section aria-labelledby="setoff">
            <Card>
              <CardHeader>
                <CardTitle id="setoff" className="text-2xl flex items-center gap-2">
                  <RefreshCw className="w-6 h-6" />
                  5. Set-off, Claw-back, and Withholding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  As Merchant of Record, Datthome bears the financial risk of every transaction at
                  the card-network level. To allocate that risk fairly between Datthome and the
                  Host, you irrevocably authorise Datthome to deduct, withhold, or recover from any
                  amounts otherwise owed to you (or, where pending amounts are insufficient, to
                  invoice you directly) for the following:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    refunds issued to a Guest because of your act, omission, no-show, late
                    cancellation, food-safety failure, allergen mis-disclosure, listing
                    misrepresentation, or other breach of this Agreement
                  </li>
                  <li>
                    chargebacks, dispute losses, and representment fees assessed against Datthome
                    where the underlying cause is attributable in whole or in part to you
                  </li>
                  <li>
                    fines, penalties, scheme assessments, or fees imposed on Datthome by a card
                    network, acquirer, regulator, or tax authority that arise from your dinners or
                    your conduct
                  </li>
                  <li>
                    overpayments, duplicate payouts, or amounts paid in error by Datthome to you
                  </li>
                  <li>
                    amounts you owe Datthome under Section 7 (Indemnification)
                  </li>
                </ul>
                <p className="mt-4 font-medium bg-amber-50 border border-amber-200 rounded-lg p-3">
                  Datthome may withhold all or part of a pending payout while a chargeback, refund
                  request, dispute, or investigation is open. Where Datthome reasonably determines
                  the underlying cause is attributable to you, the withheld amount may be retained
                  permanently as a set-off without further consent.
                </p>
                <p>
                  If amounts you owe exceed your pending and future payouts, you agree to pay the
                  shortfall on demand. Datthome may also charge the shortfall to your registered
                  payout card or any other payment instrument you have on file.
                </p>
                <p>
                  Datthome will use reasonable efforts to give you notice of a deduction and the
                  reason for it, but prior notice is not a condition of Datthome's right of set-off.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 6. Cancellations and No-shows */}
          <section aria-labelledby="cancellations">
            <Card>
              <CardHeader>
                <CardTitle id="cancellations" className="text-2xl flex items-center gap-2">
                  <UserX className="w-6 h-6" />
                  6. Host Cancellations and No-shows
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If you cancel a confirmed booking, fail to appear, or fail to deliver the dinner
                  as listed, Datthome will issue a full refund to the Guest. The full refunded
                  amount, including the platform fee originally allocated to Datthome, will be
                  deducted from your pending or future payouts under Section 5.
                </p>
                <p>
                  Repeated host cancellations, no-shows, or material misrepresentations may result
                  in account suspension, removal of your listings, permanent termination, and
                  retention of the affected payouts pending investigation.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 7. Indemnification */}
          <section aria-labelledby="indemnification">
            <Card>
              <CardHeader>
                <CardTitle id="indemnification" className="text-2xl flex items-center gap-2">
                  <FileWarning className="w-6 h-6" />
                  7. Indemnification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You agree to indemnify, defend, and hold harmless Datthome, its owners, directors,
                  employees, contractors, and affiliates from and against any claims, damages,
                  losses, fines, penalties, refunds, chargebacks, scheme assessments, legal fees,
                  and expenses arising out of or related to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>your dinners, premises, or conduct as a Host</li>
                  <li>
                    illness, injury, or harm suffered by a Guest or third party at or in connection
                    with your dinner
                  </li>
                  <li>your breach of this Agreement, the Terms of Use, or the Liability Waiver</li>
                  <li>your violation of any law, regulation, or third-party right</li>
                  <li>any inaccuracy or misrepresentation in your listings or account</li>
                </ul>
                <p>
                  Amounts owed under this Section 7 may be set off under Section 5.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 8. Reserve and Risk Holds */}
          <section aria-labelledby="reserve">
            <Card>
              <CardHeader>
                <CardTitle id="reserve" className="text-2xl flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  8. Reserve, Risk Holds, and Account Freezes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Datthome may, at its sole discretion and without prior notice, place a reserve on
                  some or all of your pending payouts, freeze payouts, or restrict your account if
                  Datthome reasonably believes that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>your dinners present an elevated chargeback or fraud risk</li>
                  <li>
                    a regulatory, card-network, or banking enquiry concerning your activity is
                    underway
                  </li>
                  <li>you have breached, or are likely to breach, this Agreement</li>
                  <li>continued payouts could expose Datthome to financial or legal liability</li>
                </ul>
                <p>
                  Datthome will release any reserved amounts that are not applied as set-off once
                  the underlying risk has been resolved.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 9. Taxes */}
          <section aria-labelledby="taxes">
            <Card>
              <CardHeader>
                <CardTitle id="taxes" className="text-2xl flex items-center gap-2">
                  <Receipt className="w-6 h-6" />
                  9. Taxes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Datthome remits the taxes it is legally required to remit as Merchant of Record.
                  You are responsible for declaring and paying any income tax, VAT (where you are
                  registered or required to register), social-security contributions, and any other
                  personal taxes on amounts you receive from Datthome. Datthome may report your
                  earnings to Icelandic tax authorities where required by law and may request a
                  kennitala or VAT number from you for that purpose.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 10. Suspension and Termination */}
          <section aria-labelledby="termination">
            <Card>
              <CardHeader>
                <CardTitle id="termination" className="text-2xl flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  10. Suspension and Termination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Datthome may suspend, restrict, or terminate your account, remove your listings,
                  cancel pending bookings, and refund Guests at any time, with or without notice,
                  for any reason, including suspected fraud, breach of this Agreement, regulatory
                  concerns, or risk to the platform or its users.
                </p>
                <p>
                  On termination, Datthome's rights of set-off, claw-back, withholding, and
                  indemnification under this Agreement survive and continue to apply to amounts
                  owed for transactions that occurred before termination.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 11. Governing Law */}
          <section aria-labelledby="governing-law">
            <Card>
              <CardHeader>
                <CardTitle id="governing-law" className="text-2xl flex items-center gap-2">
                  <Scale className="w-6 h-6" />
                  11. Governing Law and Jurisdiction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  This Agreement is governed by the laws of Iceland. Any dispute arising out of or
                  in connection with this Agreement is subject to the exclusive jurisdiction of the
                  Icelandic courts. The relationship between you and Datthome is that of independent
                  contractors; this Agreement does not create an employment, partnership, joint
                  venture, or agency relationship.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}
