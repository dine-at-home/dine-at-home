import { Dinner, Host, Location } from '@/types'
import moment from 'moment-timezone'

/**
 * Format date and time in a friendly format: "12th Jan 2026 2:21 pm"
 * @param dateStr - ISO date string (e.g., "2026-01-12T18:35:00.000Z") or date string (e.g., "2026-01-12")
 * @param timeStr - Time string (e.g., "18:35" or "18:35:00")
 * @returns Formatted string like "12th Jan 2026 2:21 pm"
 */
export function formatFriendlyDateTime(dateStr: string, timeStr?: string): string {
  if (!dateStr) {
    console.warn('formatFriendlyDateTime: dateStr is empty', { dateStr, timeStr })
    return ''
  }

  try {
    let dateMoment: moment.Moment

    // Check if dateStr is a full ISO string with time
    if (dateStr.includes('T') && dateStr.includes('Z')) {
      // Full ISO string (e.g., "2026-01-12T18:35:00.000Z")
      // The ISO string already contains the correct UTC time, so use it directly
      // Do NOT override with timeStr as that would be incorrect (timeStr is local time)
      dateMoment = moment.utc(dateStr)
    } else if (dateStr.includes('T')) {
      // ISO string without Z (local time)
      dateMoment = moment(dateStr)
      
      // If time is provided separately, use it
      if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number)
        dateMoment.hours(hours || 0).minutes(minutes || 0).seconds(0)
      }
    } else {
      // Just date string (e.g., "2026-01-12")
      // Parse the date and combine with time in UTC
      const [year, month, day] = dateStr.split('-').map(Number)
      
      if (timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number)
        // Create UTC moment from date and time components
        dateMoment = moment.utc([year, month - 1, day, hours || 0, minutes || 0, 0])
      } else {
        // No time provided, set to midnight UTC
        dateMoment = moment.utc([year, month - 1, day, 0, 0, 0])
      }
    }

    // Convert to local timezone and format
    const localMoment = dateMoment.local()

    // Format: "12th Jan 2026 2:21 pm"
    // moment's 'Do' gives ordinal (1st, 2nd, 3rd, etc.)
    const formattedDate = localMoment.format('Do MMM YYYY')
    const formattedTime = localMoment.format('h:mm a')

    return `${formattedDate} ${formattedTime}`
  } catch (error) {
    console.error('Error formatting date/time:', error, { dateStr, timeStr })
    // Fallback: try to return a basic formatted version
    try {
      // Try to construct a date from dateStr and timeStr
      if (timeStr && dateStr) {
        const [hours, minutes] = timeStr.split(':').map(Number)
        const dateOnly = dateStr.split('T')[0] // Get just the date part
        const [year, month, day] = dateOnly.split('-').map(Number)
        const fallbackDate = new Date(year, month - 1, day, hours || 0, minutes || 0)
        if (!isNaN(fallbackDate.getTime())) {
          // Format with ordinal suffix manually
          const getOrdinal = (n: number) => {
            const s = ['th', 'st', 'nd', 'rd']
            const v = n % 100
            return n + (s[(v - 20) % 10] || s[v] || s[0])
          }
          const day = fallbackDate.getDate()
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const month = monthNames[fallbackDate.getMonth()]
          const year = fallbackDate.getFullYear()
          const time = fallbackDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          return `${getOrdinal(day)} ${month} ${year} ${time}`
        }
      }
      const fallbackDate = new Date(dateStr)
      if (!isNaN(fallbackDate.getTime())) {
        const getOrdinal = (n: number) => {
          const s = ['th', 'st', 'nd', 'rd']
          const v = n % 100
          return n + (s[(v - 20) % 10] || s[v] || s[0])
        }
        const day = fallbackDate.getDate()
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = monthNames[fallbackDate.getMonth()]
        const year = fallbackDate.getFullYear()
        const time = fallbackDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        return `${getOrdinal(day)} ${month} ${year} ${time}`
      }
    } catch {
      // If all else fails, return original
    }
    return dateStr
  }
}

/**
 * Transform backend dinner object to frontend Dinner type
 */
export function transformDinner(dinner: any): Dinner {
  // Images are stored as array directly
  const images: string[] = Array.isArray(dinner.images) ? dinner.images : []

  // Filter out invalid blob URLs
  const validImages = images.filter(
    (img: string) =>
      img && typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))
  )

  let location: Location = {
    address: '',
    city: '',
    state: '',
    neighborhood: '',
  }
  // Location is now stored as object directly
  if (
    typeof dinner.location === 'object' &&
    dinner.location !== null &&
    !Array.isArray(dinner.location)
  ) {
    const locationData = dinner.location as any
    location = {
      address: locationData.address || '',
      city: locationData.city || '',
      state: locationData.state || '',
      neighborhood: locationData.neighborhood || locationData.city || '',
      coordinates: locationData.coordinates,
    }
  }

  // Transform host data
  const host: Host = {
    id: dinner.host?.id || dinner.hostId || '',
    name: dinner.host?.name || 'Unknown Host',
    avatar: dinner.host?.image || dinner.host?.avatar,
    superhost: dinner.host?.superhost || false,
    joinedDate: dinner.host?.createdAt || dinner.host?.joinedDate || new Date().toISOString(),
    responseRate: dinner.host?.responseRate || 0,
    responseTime: dinner.host?.responseTime || 'responds within 24 hours',
    bio: dinner.host?.bio,
  }

  // Preserve the original ISO date string for timezone conversion
  // The backend sends date as ISO string (e.g., "2026-01-11T23:00:00.000Z")
  // We keep the full ISO string so moment-timezone can convert it properly
  const dateStr =
    typeof dinner.date === 'string'
      ? dinner.date // Keep full ISO string for timezone conversion
      : new Date(dinner.date).toISOString()

  // Menu, included, houseRules, and dietary are stored as arrays directly
  const menu: string[] = Array.isArray(dinner.menu) ? dinner.menu : []
  const included: string[] = Array.isArray(dinner.included) ? dinner.included : []
  const houseRules: string[] = Array.isArray(dinner.houseRules) ? dinner.houseRules : []
  const dietary: string[] = Array.isArray(dinner.dietary) ? dinner.dietary : []

  // Preserve reviews if they exist (from backend API response)
  const reviews = Array.isArray(dinner.reviews) ? dinner.reviews : []

  return {
    id: dinner.id,
    title: dinner.title,
    description: dinner.description || '',
    price: dinner.price,
    duration: dinner.duration || 0, // Duration in minutes
    cuisine: dinner.cuisine || 'Other',
    date: dateStr, // Full ISO string for proper timezone handling
    time: dinner.time || '19:00',
    capacity: dinner.capacity,
    available: dinner.available || dinner.capacity,
    instantBook: dinner.instantBook || false,
    rating: dinner.rating || 0,
    reviewCount: dinner.reviewCount || 0,
    thumbnail: dinner.thumbnail || (validImages.length > 0 ? validImages[0] : null),
    images: validImages.length > 0 ? validImages : [], // No hardcoded fallback
    host,
    location,
    menu,
    included,
    houseRules,
    dietary,
    reviews, // Include reviews array if present
  }
}
