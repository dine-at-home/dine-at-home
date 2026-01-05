import { Dinner, Host, Location } from '@/types'

/**
 * Transform backend dinner object to frontend Dinner type
 */
export function transformDinner(dinner: any): Dinner {
  // Parse JSON fields
  let images: string[] = []
  try {
    images = typeof dinner.images === 'string' 
      ? JSON.parse(dinner.images) 
      : dinner.images || []
  } catch (e) {
    images = []
  }

  // Filter out invalid blob URLs
  const validImages = images.filter((img: string) => 
    img && 
    typeof img === 'string' && 
    (img.startsWith('http://') || img.startsWith('https://'))
  )

  let location: Location = {
    address: '',
    city: '',
    state: '',
    neighborhood: ''
  }
  try {
    const locationData = typeof dinner.location === 'string' 
      ? JSON.parse(dinner.location) 
      : dinner.location || {}
    location = {
      address: locationData.address || '',
      city: locationData.city || '',
      state: locationData.state || '',
      neighborhood: locationData.neighborhood || locationData.city || '',
      coordinates: locationData.coordinates
    }
  } catch (e) {
    // Use defaults
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
    bio: dinner.host?.bio
  }

  // Format date
  const dateStr = typeof dinner.date === 'string' 
    ? dinner.date.split('T')[0] 
    : new Date(dinner.date).toISOString().split('T')[0]

  return {
    id: dinner.id,
    title: dinner.title,
    description: dinner.description || '',
    price: dinner.price,
    cuisine: dinner.cuisine || 'Other',
    date: dateStr,
    time: dinner.time || '19:00',
    capacity: dinner.capacity,
    available: dinner.available || dinner.capacity,
    instantBook: dinner.instantBook || false,
    rating: dinner.rating || 0,
    reviewCount: dinner.reviewCount || 0,
    images: validImages.length > 0 
      ? validImages 
      : ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop&crop=center'], // Fallback image
    host,
    location
  }
}

