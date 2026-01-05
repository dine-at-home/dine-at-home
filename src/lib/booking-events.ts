/**
 * Booking Events
 * Custom events for real-time booking updates across the app
 */

export const BOOKING_CREATED_EVENT = 'booking-created'
export const BOOKING_CANCELLED_EVENT = 'booking-cancelled'

export interface BookingCreatedEventDetail {
  dinnerId: string
  bookingId: string
}

/**
 * Dispatch event when a booking is created
 * This notifies other components to remove the dinner from listings
 */
export function dispatchBookingCreated(dinnerId: string, bookingId: string) {
  if (typeof window !== 'undefined') {
    console.log('🟢 Dispatching booking-created event:', { dinnerId, bookingId })
    const event = new CustomEvent<BookingCreatedEventDetail>(BOOKING_CREATED_EVENT, {
      detail: { dinnerId, bookingId }
    })
    window.dispatchEvent(event)
    console.log('🟢 Event dispatched successfully')
  } else {
    console.warn('⚠️ Cannot dispatch event - window is undefined (server-side)')
  }
}

/**
 * Dispatch event when a booking is cancelled
 * This notifies other components to potentially re-add the dinner to listings
 */
export function dispatchBookingCancelled(dinnerId: string, bookingId: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent<BookingCreatedEventDetail>(BOOKING_CANCELLED_EVENT, {
      detail: { dinnerId, bookingId }
    })
    window.dispatchEvent(event)
  }
}

