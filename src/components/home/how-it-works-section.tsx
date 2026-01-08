import { Search, Calendar, ChefHat, Star } from 'lucide-react'

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-24 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-semibold mb-6">How DineWithUs Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From discovery to dining, we've made it simple to connect with amazing hosts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">Search</h3>
            <p className="text-muted-foreground">
              Find dinner experiences by location, date, cuisine, and more
            </p>
          </div>

          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">Book</h3>
            <p className="text-muted-foreground">
              Reserve your spot with instant booking or send a request to the host
            </p>
          </div>

          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">Experience</h3>
            <p className="text-muted-foreground">
              Enjoy authentic home cooking and meet fellow food lovers
            </p>
          </div>

          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Star className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">Review</h3>
            <p className="text-muted-foreground">
              Share your experience and help others discover great dining
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
