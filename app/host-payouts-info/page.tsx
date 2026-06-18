import { Metadata } from 'next'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Banknote, Clock, CreditCard, CheckCircle, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Host Payouts',
  description:
    'Learn how and when hosts receive payment for their dining experiences on Dine at Home.',
  alternates: { canonical: 'https://datthome.com/host-payouts-info' },
}

export default function HostPayoutsInfoPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Banknote className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">Host Payouts</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about getting paid as a host
          </p>
        </header>

        <main className="space-y-8">
          {/* Earnings */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Banknote className="w-6 h-6" />
                  How Much You Earn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  As a host, you receive <strong>80% of the total booking price</strong>. Datthome
                  retains a 20% platform fee which covers payment processing, platform maintenance,
                  guest support, and dispute handling.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Booking price (e.g. 5,000 kr × 2 guests)</span>
                    <span className="font-medium">10,000 kr</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform fee (20%)</span>
                    <span>− 2,000 kr</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Your payout</span>
                    <span className="text-green-600 dark:text-green-400">8,000 kr</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  All amounts are in Icelandic Króna (ISK). The fee is deducted automatically —
                  guests are not charged any extra fees on top of the listed price.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Payout schedule */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  When You Get Paid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Payouts are released <strong>72 hours after your dining event is completed</strong>.
                  This settlement window allows time to handle any guest disputes or cancellation
                  claims before funds are disbursed.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>Event completes → 72-hour settlement window begins</li>
                  <li>After 72 hours → payout is queued automatically</li>
                  <li>Bank transfer arrives within 1–3 business days after disbursement</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  A minimum balance of <strong>10,000 kr</strong> is required before a payout is
                  processed. Smaller balances accumulate until the threshold is reached.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Payment method */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  How You Receive Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Payouts are paid directly to the Icelandic bank account (IBAN) you register during
                  host onboarding. Datthome sends a bank transfer to your account after each
                  completed dinner; funds typically arrive within 1–3 business days.
                </p>
                <p>
                  You can update your bank account (IBAN) at any time from your host payout settings.
                  Payouts are processed in ISK.
                </p>
                <p>
                  Guest payments are handled via our payment provider, Paystrax (Esja Fjarskipti
                  ehf), which is regulated in Iceland.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Requirements */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Requirements to Receive Payouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm list-disc list-inside">
                  <li>Completed identity verification (Rafræn skilríki / Icelandic eID)</li>
                  <li>A registered Icelandic bank account (IBAN) on your host profile</li>
                  <li>Account in good standing (no active disputes or policy violations)</li>
                  <li>Minimum payout balance of 10,000 kr</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Questions */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <HelpCircle className="w-6 h-6" />
                  Questions?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  If you have questions about your payouts, contact us at{' '}
                  <a href="mailto:info@datthome.com" className="text-primary underline">
                    info@datthome.com
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  )
}
