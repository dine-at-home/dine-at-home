# Backend Requirements: Booking Availability Management

## Overview

The frontend filters out booked dinners (where `available === 0`) from public listings. The backend **MUST** properly maintain the `dinner.available` field to ensure this works correctly.

## Current Frontend Implementation

The frontend checks if a dinner is booked using:
```typescript
// src/lib/dinner-filters.ts
export function isDinnerBooked(dinner: Dinner): boolean {
  return dinner.available <= 0  // If available is 0 or less, dinner is considered booked
}
```

Dinners are filtered out from listings (home page, search) if:
- `available <= 0` (fully booked), OR
- The dinner date/time has passed

## Backend Requirements

### 1. Initial Dinner Creation

When a dinner is created via `POST /api/dinners`, the backend should:
- Set `available = capacity` (all spots are available initially)
- Example: If capacity is 8, set available = 8

### 2. Booking Creation (`POST /api/bookings`)

**CRITICAL:** When a booking is created, the backend MUST:

1. **Check availability:**
   - Ensure `dinner.available >= booking.guests`
   - Return error if not enough spots available

2. **Decrease available spots:**
   - `dinner.available = dinner.available - booking.guests`
   - Update the dinner record in the database

3. **Example:**
   ```
   Initial: capacity = 8, available = 8
   Booking created: guests = 4
   After booking: available = 8 - 4 = 4
   
   If another booking is created: guests = 4
   After second booking: available = 4 - 4 = 0 (fully booked)
   ```

### 3. Booking Cancellation (`PATCH /api/bookings/{bookingId}/status`)

When a booking is cancelled (status changed to CANCELLED), the backend MUST:

1. **Increase available spots:**
   - `dinner.available = dinner.available + booking.guests`
   - Update the dinner record in the database

2. **Example:**
   ```
   Before cancellation: available = 0 (fully booked)
   Booking cancelled: guests = 4
   After cancellation: available = 0 + 4 = 4 (spots available again)
   ```

### 4. Booking Confirmation (if applicable)

If your system has a confirmation step:
- **Option A:** Decrease `available` when booking is created (recommended for instant booking)
- **Option B:** Decrease `available` when booking status changes to CONFIRMED
- **Important:** Choose one approach and be consistent

## Implementation Example (Node.js/Express/PgSQL)

```javascript
// POST /api/bookings
router.post('/bookings', authenticateToken, async (req, res) => {
  const { dinnerId, guests } = req.body
  const userId = req.user.id

  try {
    // Start transaction
    await db.transaction(async (trx) => {
      // Get dinner and lock row to prevent race conditions
      const dinner = await trx('dinners')
        .where({ id: dinnerId })
        .forUpdate()  // Row-level lock
        .first()

      if (!dinner) {
        throw new Error('Dinner not found')
      }

      // Check availability
      if (dinner.available < guests) {
        throw new Error('Not enough spots available')
      }

      // Create booking
      const booking = await trx('bookings').insert({
        userId,
        dinnerId,
        guests,
        totalPrice: dinner.price * guests,
        status: 'PENDING'
      }).returning('*')

      // Update dinner.available
      await trx('dinners')
        .where({ id: dinnerId })
        .update({
          available: dinner.available - guests,
          updatedAt: new Date()
        })

      await trx.commit()
      res.json({ success: true, data: booking })
    })
  } catch (error) {
    await trx.rollback()
    res.status(400).json({ success: false, error: error.message })
  }
})
```

```javascript
// PATCH /api/bookings/:id/status (Cancellation)
router.patch('/bookings/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body
  const bookingId = req.params.id

  try {
    await db.transaction(async (trx) => {
      // Get booking
      const booking = await trx('bookings')
        .where({ id: bookingId })
        .first()

      if (!booking) {
        throw new Error('Booking not found')
      }

      const oldStatus = booking.status

      // Update booking status
      await trx('bookings')
        .where({ id: bookingId })
        .update({ status, updatedAt: new Date() })

      // If cancelling, increase available spots
      if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
        await trx('dinners')
          .where({ id: booking.dinnerId })
          .increment('available', booking.guests)
          .update({ updatedAt: new Date() })
      }

      // If confirming after being cancelled, decrease available spots
      if (status === 'CONFIRMED' && oldStatus === 'CANCELLED') {
        const dinner = await trx('dinners')
          .where({ id: booking.dinnerId })
          .forUpdate()
          .first()

        if (dinner.available < booking.guests) {
          throw new Error('Not enough spots available')
        }

        await trx('dinners')
          .where({ id: booking.dinnerId })
          .decrement('available', booking.guests)
          .update({ updatedAt: new Date() })
      }

      await trx.commit()
      res.json({ success: true, message: 'Booking status updated' })
    })
  } catch (error) {
    await trx.rollback()
    res.status(400).json({ success: false, error: error.message })
  }
})
```

## Important Notes

1. **Transaction Safety:** Always use database transactions when updating both booking and dinner records to prevent race conditions

2. **Row Locking:** Use `FOR UPDATE` lock when checking and updating availability to prevent double-booking

3. **Validation:** Always validate that `available >= guests` before creating a booking

4. **Atomic Updates:** The decrease/increase of `available` must happen in the same transaction as booking creation/update

5. **Initial Value:** When creating a dinner, always set `available = capacity`

## Testing Checklist

- [ ] Creating a dinner sets `available = capacity`
- [ ] Creating a booking decreases `available` by the number of guests
- [ ] Cannot create booking if `available < guests`
- [ ] Cancelling a booking increases `available` by the number of guests
- [ ] Multiple simultaneous bookings don't cause race conditions (use transactions + locks)
- [ ] Frontend correctly filters out dinners where `available === 0`

## Current Status

**Frontend:** ✅ Implemented - Filters out dinners where `available <= 0`

**Backend:** ⚠️ **REQUIRED** - Must implement the availability update logic in booking creation/cancellation endpoints

