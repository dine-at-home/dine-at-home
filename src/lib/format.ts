export const formatIsk = (n: number): string =>
  new Intl.NumberFormat('is-IS', {
    style: 'currency',
    currency: 'ISK',
    maximumFractionDigits: 0,
  }).format(n || 0)

export const formatDate = (v: string | Date | null | undefined): string => {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return '—'
  }
}

export const formatShortDate = (v: string | Date | null | undefined): string => {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}
