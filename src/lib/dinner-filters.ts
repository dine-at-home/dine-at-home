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
 * Check if a dinner is currently ongoing
 * A dinner is ongoing if it has started but hasn't ended yet (within its duration)
 */
export function isDinnerOngoing(dinner: Dinner): boolean {
  // The date field is a full ISO string (e.g., "2026-01-11T23:00:00.000Z")
  const dinnerStartMoment = moment.utc(dinner.date)

  // Calculate end time by adding duration (in minutes)
  const dinnerEndMoment = dinnerStartMoment.clone().add(dinner.duration || 0, 'minutes')

  // Get current time in UTC for comparison
  const nowMoment = moment.utc()

  // Ongoing if current time is between start and end time
  return nowMoment.isSameOrAfter(dinnerStartMoment) && nowMoment.isBefore(dinnerEndMoment)
}

/**
 * Check if a dinner has ended (past its end time)
 */
export function isDinnerEnded(dinner: Dinner): boolean {
  // The date field is a full ISO string (e.g., "2026-01-11T23:00:00.000Z")
  const dinnerStartMoment = moment.utc(dinner.date)

  // Calculate end time by adding duration (in minutes)
  const dinnerEndMoment = dinnerStartMoment.clone().add(dinner.duration || 0, 'minutes')

  // Get current time in UTC for comparison
  const nowMoment = moment.utc()

  // Ended if current time is at or after end time
  return nowMoment.isSameOrAfter(dinnerEndMoment)
}

/**
 * Determine dinner status for host dashboard
 * Returns: 'upcoming', 'ongoing', 'completed', or 'draft'
 */
export function getDinnerStatus(
  dinner: Dinner,
  isActive: boolean = true
): 'upcoming' | 'ongoing' | 'completed' | 'draft' {
  // Draft dinners (not active)
  if (!isActive) {
    return 'draft'
  }

  // Check if dinner is currently ongoing
  if (isDinnerOngoing(dinner)) {
    return 'ongoing'
  }

  // Completed if ended or fully booked
  if (isDinnerEnded(dinner) || isDinnerBooked(dinner)) {
    return 'completed'
  }

  // Otherwise it's upcoming
  return 'upcoming'
}
