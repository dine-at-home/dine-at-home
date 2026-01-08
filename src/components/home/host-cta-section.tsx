import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function HostCTASection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-10 lg:p-16">
              <h2 className="text-3xl lg:text-4xl font-semibold leading-tight mb-8">
                Earn up to $500/week hosting dinners
              </h2>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Share your passion for cooking with others</span>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Set your own schedule and menu</span>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Meet interesting people from around the world</span>
                </li>
                <li className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Get paid within 24 hours after each dinner</span>
                </li>
              </ul>
              <Button
                size="lg"
                className="px-10 py-4 rounded-xl bg-primary-600 hover:bg-primary-700"
              >
                Start Hosting Today
              </Button>
            </div>

            <div className="h-64 lg:h-96 relative">
              <Image
                src="https://images.unsplash.com/photo-1569435998017-abb5d562dedf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwdG9nZXRoZXIlMjBraXRjaGVuJTIwZnJpZW5kc3xlbnwxfHx8fDE3NTg1NDgyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Cooking together"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
