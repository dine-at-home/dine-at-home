import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Clock, AlertTriangle, CreditCard, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Dine at Home',
  description:
    'Learn about our refund and cancellation policies for dining experiences on Dine at Home.',
}

export default function RefundPolicyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xl text-muted-foreground">Last updated: April 24, 2026</p>
        </header>

        <main className="space-y-8">
          {/* How payment works */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  How Payment Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  When you book a dining experience, your card is <strong>authorized</strong> (pre-authorized)
                  for the full amount but not immediately charged. The charge is only captured once the
                  host confirms your reservation.
                </p>
                <p>
                  If the host does not confirm your booking within the allotted time, the authorization
                  is released automatically and no charge appears on your statement.
                </p>
                <p>
                  All amounts are in Icelandic Króna (ISK). Foreign cardholders will see the ISK amount
                  converted to their home currency at their bank&apos;s exchange rate.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Cancellation policies */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Guest Cancellation Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>
                  Each dining experience has a cancellation policy set by the host. The policy is shown
                  on the dinner listing and on your booking confirmation.
                </p>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-green-600 dark:text-green-400">Flexible</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>Full refund if cancelled <strong>24 or more hours</strong> before the dinner</li>
                      <li>No refund if cancelled less than 24 hours before the dinner</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-yellow-600 dark:text-yellow-400">Moderate</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>Full refund if cancelled <strong>5 or more days</strong> before the dinner</li>
                      <li>No refund if cancelled less than 5 days before the dinner</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-red-600 dark:text-red-400">Strict</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                      <li>50% refund if cancelled <strong>7 or more days</strong> before the dinner</li>
                      <li>No refund if cancelled less than 7 days before the dinner</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Host cancellations */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  Host Cancellations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  If a host cancels a confirmed booking or the event is cancelled for any reason
                  attributable to the host, you will receive a <strong>full refund</strong> of the
                  amount charged, regardless of the cancellation policy.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Refund processing */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <RefreshCw className="w-6 h-6" />
                  Refund Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Refunds are processed by Datthome as Merchant of Record via our payment provider,
                  Paystrax. Once issued, please allow <strong>5–10 business days</strong> for the
                  refund to appear on your card statement, depending on your bank.
                </p>
                <p>
                  Pre-authorization voids (where no charge was captured) are released immediately but
                  may take 1–7 days to clear depending on your card issuer.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Disputes */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Disputes & Chargebacks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Datthome acts as Merchant of Record for all transactions. If you have a payment
                  dispute, contact us first at{' '}
                  <a href="mailto:support@datthome.com" className="text-primary underline">
                    support@datthome.com
                  </a>{' '}
                  — we aim to resolve all disputes promptly without requiring a chargeback.
                </p>
                <p>
                  Chargebacks initiated without contacting us first may result in the temporary
                  suspension of your account while the dispute is investigated.
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}
