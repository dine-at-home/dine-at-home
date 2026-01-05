# Backend Update Required: Booking Response Must Include dinnerId

## Critical Update Needed


The frontend requires the `dinnerId` field in the booking creation response to immediately remove the booked dinner from listings in real-time.

## What to Update


### POST /api/bookings Response

The response **MUST** include `dinnerId` at the top level of the `data` object:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_001",
    "status": "CONFIRMED",
    "guests": 4,
    "totalPrice": 300.00,
    "dinnerId": "dinner_001",  // ⚠️ THIS FIELD IS REQUIRED
    "userId": "user_123",
    "createdAt": "2024-10-23T10:00:00.000Z",
    "updatedAt": "2024-10-23T10:00:00.000Z",
    "dinner": {
      // ... nested dinner object
    },
    "user": {
      // ... nested user object
    }
  }
}
```

## Why This is Critical

1. **Real-time Listings Removal**: When a user creates a booking, the frontend immediately removes that dinner from all listings (home page, search results) so other users cannot see or book it.

2. **User Experience**: Without this, booked dinners will continue to appear in listings until the page is refreshed, leading to confusion and potential double-bookings.

3. **Event System**: The frontend uses a custom event system that requires the `dinnerId` to identify which dinner to remove from the listings.

## Implementation Checklist

- [ ] Ensure the booking creation endpoint returns `dinnerId` in the response
- [ ] The `dinnerId` should be at the top level of the response data object
- [ ] Verify the `dinnerId` matches the dinner that was booked
- [ ] Test that the response includes this field before marking the endpoint as complete

## Example Implementation

When creating a booking:

```javascript
// After creating the booking in the database
const booking = await createBooking({
  dinnerId: request.body.dinnerId,
  userId: user.id,
  // ... other fields
})

// Return response with dinnerId
return res.status(201).json({
  success: true,
  message: "Booking created successfully",
  data: {
    id: booking.id,
    status: booking.status,
    guests: booking.guests,
    totalPrice: booking.totalPrice,
    dinnerId: booking.dinnerId, // ⚠️ MUST BE INCLUDED
    userId: booking.userId,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    // ... other fields
  }
})
```

## Testing

1. Create a booking via POST /api/bookings
2. Verify the response includes `dinnerId` at the top level of `data`
3. Verify the `dinnerId` matches the dinner that was booked
4. Test that the frontend receives this and removes the dinner from listings

