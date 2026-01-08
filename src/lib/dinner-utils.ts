import { Dinner, Host, Location } from '@/types'

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
    responseTime: dinner.host?.responseTime || 'within 24 hours',
    bio: dinner.host?.bio,
  }

  // Format date
  const dateStr =
    typeof dinner.date === 'string'
      ? dinner.date.split('T')[0]
      : new Date(dinner.date).toISOString().split('T')[0]

  // Menu, included, houseRules, and dietary are stored as arrays directly
  const menu: string[] = Array.isArray(dinner.menu) ? dinner.menu : []
  const included: string[] = Array.isArray(dinner.included) ? dinner.included : []
  const houseRules: string[] = Array.isArray(dinner.houseRules) ? dinner.houseRules : []
  const dietary: string[] = Array.isArray(dinner.dietary) ? dinner.dietary : []

  return {
    id: dinner.id,
    title: dinner.title,
    description: dinner.description || '',
    price: dinner.price,
    duration: dinner.duration,
    cuisine: dinner.cuisine || 'Other',
    date: dateStr,
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
  }
}
