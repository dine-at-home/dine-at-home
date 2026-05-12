// Mirror of backend/src/config/legalDocumentVersions.ts — keep the date strings in sync.
// Bumping a version forces hosts to re-accept on /host/onboarding before their next payout.

export const CURRENT_LEGAL_VERSIONS = {
  termsOfUse: '2026-05-08',
  hostAgreement: '2026-05-08',
  liabilityWaiver: '2026-05-08',
} as const

export type LegalVersionKey = keyof typeof CURRENT_LEGAL_VERSIONS
