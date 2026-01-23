'use client'

import React from 'react'

interface JsonLdProps {
  data: any
}

/**
 * Knowledge Graph and Structured Data Component
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}

/**
 * Organization Schema
 */
export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dine at Home',
  url: 'https://datthome.com',
  logo: 'https://datthome.com/logo.png',
  description: 'Authentic social dining experiences with local hosts.',
  sameAs: [
    'https://twitter.com/datthome',
    'https://facebook.com/datthome',
    'https://instagram.com/datthome',
    'https://linkedin.com/company/datthome',
  ],
}

/**
 * WebSite Schema (Searchbox)
 */
export const WebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dine at Home',
  url: 'https://datthome.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://datthome.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

/**
 * Person Schema (Founders/Leadership for E-E-A-T)
 */
export const PersonSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Founder Name', // User should replace with actual name
  jobTitle: 'Founder',
  url: 'https://dineathome.com/about',
  sameAs: ['https://linkedin.com/in/founder-profile', 'https://twitter.com/founder-profile'],
}

/**
 * Linked Knowledge Graph (Combines multiple schemas)
 */
export const KnowledgeGraphSchema = [OrganizationSchema, WebSiteSchema, PersonSchema]

/**
 * FAQ Schema
 */
export const getFaqSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})
