import { Button } from '@/components/ui/button'
import { Facebook, Instagram, Twitter, Globe } from 'lucide-react'
import Link from 'next/link'

function VisaLogo() {
  return (
    <div className="h-8 w-12 rounded bg-[#1A1F71] flex items-center justify-center" aria-label="Visa">
      <span className="text-white font-bold text-sm italic tracking-tight">VISA</span>
    </div>
  )
}

function MastercardLogo() {
  return (
    <div className="h-8 w-12 rounded bg-[#252525] flex items-center justify-center relative overflow-hidden" aria-label="Mastercard">
      <div className="absolute left-1.5 w-5 h-5 rounded-full bg-[#EB001B]" />
      <div className="absolute right-1.5 w-5 h-5 rounded-full bg-[#F79E1B]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-5 bg-[#FF5F00]" style={{ clipPath: 'none', opacity: 0.85 }} />
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-background-secondary py-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/help-center" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <a href="mailto:info@datthome.com" className="hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="hover:text-foreground transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-foreground transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/assumption-of-risk" className="hover:text-foreground transition-colors">
                  Assumption of Risk
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold mb-4">Hosting</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/host-payouts-info" className="hover:text-foreground transition-colors">
                  Host Payouts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border pt-8">
          {/* Company legal info */}
          <p className="text-xs text-muted-foreground mb-4 text-center">
            Payments processed by <strong>Esja Fjarskipti ehf</strong> (Datthome) · Stórikríki 17,
            270 Mosfellsbær, Iceland · Merchant of Record for all transactions on this platform.
          </p>

          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <img
                src="/datthome-logo.svg"
                alt="datthome.com — Eat Like a Local"
                className="h-8 w-auto"
              />

              <p className="text-sm text-muted-foreground">
                © 2026 datthome.com. All rights reserved.
              </p>
            </div>

            <div className="flex items-center space-x-6">
              {/* Payment logos */}
              <div className="flex items-center space-x-2" aria-label="Accepted payment methods">
                <VisaLogo />
                <MastercardLogo />
              </div>

              {/* Language/Currency */}
              <Button variant="ghost" size="sm" className="text-sm">
                <Globe className="w-4 h-4 mr-2" />
                English (US)
              </Button>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="p-2">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
