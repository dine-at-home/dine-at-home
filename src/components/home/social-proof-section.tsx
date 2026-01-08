import { Shield, CreditCard, Headphones } from 'lucide-react'

export function SocialProofSection() {
  return (
    <section className="py-12 lg:py-16 bg-background-secondary">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-8">
          Join 10,000+ diners discovering authentic home cooking
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold">Verified Hosts</h3>
            <p className="text-sm text-muted-foreground">
              All hosts are background checked and verified
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-semibold">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              Your payment is protected until your dining experience
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
              <Headphones className="w-8 h-8 text-warning" />
            </div>
            <h3 className="font-semibold">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">
              Get help whenever you need it, day or night
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
