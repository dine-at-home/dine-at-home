import { Dinner } from '@/types'
import moment from 'moment-timezone'

/**
 * Check if a dinner date/time has passed
 * A dinner is considered "past" if the current time is at or after the dinner start time
 * This ensures bookings are allowed until the start time
 * Uses timezone-aware comparison: parses UTC date/time and compares in user's local timezone
 */
export function isDinnerPast(dinner: Dinner): boolean {
  // The date field is now a full ISO string (e.g., "2026-01-11T23:00:00.000Z")
  // Parse it directly as UTC
  const dinnerMoment = moment.utc(dinner.date)
  
  // Get current time in UTC for comparison
  const nowMoment = moment.utc()
  
  // Compare in UTC (both moments are in UTC, so comparison is timezone-independent)
  return dinnerMoment.isSameOrBefore(nowMoment)
}

/**
 * Check if a dinner is fully booked (available === 0)
 */
export function isDinnerBooked(dinner: Dinner): boolean {
  return dinner.available <= 0
}

/**
 * Check if a dinner should be shown in public listings (home page, search)
 * Returns false if dinner is booked or past its time
 */
export function shouldShowInListings(dinner: Dinner): boolean {
  // Don't show if fully booked
  if (isDinnerBooked(dinner)) {
    return false
  }

  // Don't show if date/time has passed
  if (isDinnerPast(dinner)) {
    return false
  }

  return true
}

/**
 * Determine dinner status for host dashboard
 * Returns: 'upcoming', 'completed', or 'draft'
 */
export function getDinnerStatus(
  dinner: Dinner,
  isActive: boolean = true
): 'upcoming' | 'completed' | 'draft' {
  // Draft dinners (not active)
  if (!isActive) {
    return 'draft'
  }

  // Completed if booked or past time
  if (isDinnerBooked(dinner) || isDinnerPast(dinner)) {
    return 'completed'
  }

  // Otherwise it's upcoming
  return 'upcoming'
}
