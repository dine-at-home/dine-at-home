import { Metadata } from 'next'
import HowItWorksClient from '@/components/home/how-it-works-client'

export const metadata: Metadata = {
  title: 'How It Works | Dine at Home',
  description:
    'Learn how to discover, book, and enjoy unique social dining experiences with local hosts. Share meals and make memories.',
  keywords: ['how it works', 'guide', 'social dining info', 'become a host'],
}

export default function HowItWorksPage() {
  return <HowItWorksClient />
}
