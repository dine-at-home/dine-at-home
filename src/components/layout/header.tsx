'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Search,
  Menu,
  Globe,
  User,
  Calendar,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  ChefHat,
  AlertTriangle,
  Wallet,
} from 'lucide-react'
import { SearchParams } from '@/types'
import { payoutService } from '@/lib/payout-service'

interface HeaderProps {
  onSearch?: (params: SearchParams) => void
}

export function Header({ onSearch }: HeaderProps = {}) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [kycStatus, setKycStatus] = useState<
    'UNVERIFIED' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED' | null
  >(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (user?.role !== 'host') {
      setKycStatus(null)
      return
    }
    let cancelled = false
    payoutService.getEarnings().then((res) => {
      if (cancelled) return
      if (res.success && res.data) setKycStatus(res.data.kycStatus)
    })
    return () => {
      cancelled = true
    }
  }, [user?.role, user?.id])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background shadow-sm border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="hidden sm:block font-bold text-xl text-primary">Dine at Home</span>
            </a>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 border border-border rounded-full px-2 py-1 hover:shadow-card transition-shadow"
                >
                  <Menu className="w-4 h-4" />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.image || ''} alt={user?.name || 'User avatar'} />
                    <AvatarFallback>
                      {user?.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                {user ? (
                  <>
                    <DropdownMenuItem className="font-semibold">
                      {user?.name || user?.email}
                    </DropdownMenuItem>
                    {user?.role === 'host' ? (
                      <>
                        {kycStatus && kycStatus !== 'VERIFIED' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => router.push('/host/payouts/settings')}
                              className="text-amber-700 focus:bg-amber-50 focus:text-amber-800"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Complete payout setup
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => router.push('/host/dashboard')}>
                          <ChefHat className="w-4 h-4 mr-2" />
                          Host Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push('/host/dashboard?tab=dinners')}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          My Dinners
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push('/host/dashboard?tab=bookings')}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push('/host/dashboard?tab=earnings')}
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Earnings
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => router.push('/profile')}>
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/profile?tab=bookings')}>
                          <Calendar className="w-4 h-4 mr-2" />
                          My bookings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/profile?tab=reviews')}>
                          <Heart className="w-4 h-4 mr-2" />
                          My reviews
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/favorites')}>
                          <Heart className="w-4 h-4 mr-2" />
                          My Favorites
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/help-center')}>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help Center
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          user?.role === 'host'
                            ? '/host/dashboard?tab=account'
                            : '/profile?tab=settings'
                        )
                      }
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      className="font-semibold"
                      onClick={() => router.push('/auth/signup')}
                    >
                      Sign up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/auth/signin')}>
                      Log in
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/help-center')}>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help Center
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
