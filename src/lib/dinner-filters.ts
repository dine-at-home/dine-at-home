import { Dinner } from '@/types'

/**
 * Check if a dinner date/time has passed
 * A dinner is considered "past" if the current time is at or after the dinner start time
 * This ensures bookings are allowed until the start time
 */
export function isDinnerPast(dinner: Dinner): boolean {
  // Parse date string (format: YYYY-MM-DD) and create date in local timezone
  const [year, month, day] = dinner.date.split('-').map(Number)
  const dinnerDate = new Date(year, month - 1, day) // month is 0-indexed
  
  // Parse time (format: HH:MM or HH:MM:SS)
  const [hours, minutes, seconds] = dinner.time.split(':').map(Number)
  dinnerDate.setHours(hours || 0, minutes || 0, seconds || 0, 0)
  
  const now = new Date()
  // Return true if current time is at or after the dinner start time
  // This means bookings are allowed until the start time
  return dinnerDate <= now
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
export function getDinnerStatus(dinner: Dinner, isActive: boolean = true): 'upcoming' | 'completed' | 'draft' {
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

