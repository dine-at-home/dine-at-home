'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Settings, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COOKIE_CONSENT_KEY = 'cookie-consent'

type CookiePreferences = {
  essential: boolean // Always true
  preferences: boolean
  analytics: boolean
  marketing: boolean
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  preferences: false,
  analytics: false,
  marketing: false,
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay to prevent flash
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs))
    setIsVisible(false)
  }

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      preferences: true,
      analytics: true,
      marketing: true,
    }
    saveConsent(allAccepted)
  }

  const handleRejectAll = () => {
    saveConsent(defaultPreferences)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {}} // Prevent dismiss on backdrop click
      />

      {/* Cookie Banner */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Cookie className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Cookie Settings</h2>
            <p className="text-sm text-white/80">We value your privacy</p>
          </div>
        </div>

        <div className="p-6">
          {!showSettings ? (
            <>
              <p className="text-muted-foreground text-sm mb-4">
                We use cookies to enhance your browsing experience, provide personalized content,
                and analyze our traffic. By clicking "Accept All", you consent to our use of
                cookies.
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                Read our{' '}
                <Link
                  href="/cookie-policy"
                  className="text-primary-600 underline hover:no-underline"
                >
                  Cookie Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy-policy"
                  className="text-primary-600 underline hover:no-underline"
                >
                  Privacy Policy
                </Link>{' '}
                to learn more.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" onClick={handleRejectAll}>
                  Reject All
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowSettings(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                <Button
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                  onClick={handleAcceptAll}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept All
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {/* Essential - Always on */}
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-foreground">Essential Cookies</p>
                    <p className="text-sm text-muted-foreground">
                      Required for the website to function
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    Always On
                  </div>
                </div>

                {/* Preference Cookies */}
                <label className="flex items-center justify-between py-3 border-b cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Preference Cookies</p>
                    <p className="text-sm text-muted-foreground">
                      Remember your settings and preferences
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={(e) =>
                      setPreferences({ ...preferences, preferences: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>

                {/* Analytics Cookies */}
                <label className="flex items-center justify-between py-3 border-b cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Analytics Cookies</p>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how visitors use the site
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>

                {/* Marketing Cookies */}
                <label className="flex items-center justify-between py-3 cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Marketing Cookies</p>
                    <p className="text-sm text-muted-foreground">
                      Used to deliver relevant advertisements
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences({ ...preferences, marketing: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowSettings(false)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                  onClick={handleSavePreferences}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
