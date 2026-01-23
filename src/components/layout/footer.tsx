import { Button } from '@/components/ui/button'
import { Facebook, Instagram, Twitter, Globe } from 'lucide-react'
import Link from 'next/link'

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
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Newsroom
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Investors
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Hosts */}
          <div>
            <h3 className="font-semibold mb-4">Hosts</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Become a host
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Host resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Community forum
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Host insurance
                </a>
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
                <a href="#" className="hover:text-foreground transition-colors">
                  Safety information
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Cancellation options
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Report issue
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
                <a href="#" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="font-bold text-xl text-primary">Dine at Home</span>
              </div>

              <p className="text-sm text-muted-foreground">
                © 2026 Dine at Home. All rights reserved.
              </p>
            </div>

            <div className="flex items-center space-x-6">
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
