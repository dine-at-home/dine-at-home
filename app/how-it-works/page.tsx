'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Search,
  Users,
  CreditCard,
  Star,
  MapPin,
  Calendar,
  ChefHat,
  Heart,
  Shield,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How DineWithUs Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover authentic dining experiences and connect with local hosts for unforgettable
            meals
          </p>
        </div>

        {/* For Guests Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Users className="w-8 h-8 text-primary-600" />
              For Guests
            </h2>
            <p className="text-lg text-muted-foreground">
              Find and book unique dining experiences in your city
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">1. Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Browse dining experiences by location, date, and cuisine type. Find the perfect
                  meal for your taste and schedule.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">2. Choose</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View detailed information about each dining experience, including menu, host
                  profile, and location details.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">3. Book</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure your spot with our easy booking system. Pay safely and receive instant
                  confirmation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">4. Enjoy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join your host for an authentic dining experience. Share stories, try new flavors,
                  and make lasting memories.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* For Hosts Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <ChefHat className="w-8 h-8 text-primary-600" />
              For Hosts
            </h2>
            <p className="text-lg text-muted-foreground">
              Share your culinary passion and earn money by hosting dining experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">1. Sign Up</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create your host profile and tell us about your culinary skills, specialties, and
                  dining style.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">2. Create</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Design your dining experience with menu details, available dates, pricing, and
                  special touches.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">3. Host</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Welcome guests into your home and share your passion for food. Create memorable
                  experiences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl">4. Earn</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get paid for sharing your culinary talents. Build a reputation and grow your
                  hosting business.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safety & Trust Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Shield className="w-8 h-8 text-primary-600" />
              Safety & Trust
            </h2>
            <p className="text-lg text-muted-foreground">
              Your safety and security are our top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Verified Hosts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All hosts go through a verification process including identity checks and
                  background verification.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All payments are processed securely through our platform with fraud protection and
                  secure encryption.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Guest Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Read authentic reviews from other guests to help you choose the perfect dining
                  experience.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>How do I book a dining experience?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Simply search for experiences in your area, select your preferred date and time,
                  and complete the booking process. You'll receive instant confirmation and all the
                  details you need.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What if I need to cancel my booking?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  You can cancel your booking up to 24 hours before the experience for a full
                  refund. Cancellations within 24 hours may be subject to different policies
                  depending on the host.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How do I become a host?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sign up as a host, complete your profile, and create your first dining experience.
                  Our team will review your listing and help you get started.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Is it safe to dine in someone's home?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Yes! All hosts are verified through our safety process, and we provide safety
                  guidelines and support. You can also read reviews from other guests before
                  booking.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of food lovers and hosts creating amazing dining experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-700">
              <Link href="/auth/signup">Sign Up as Guest</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/host/onboarding">Become a Host</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
