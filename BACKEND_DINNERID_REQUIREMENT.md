# Backend Requirement: dinnerId in Booking Response

## Summary
The `POST /api/bookings` endpoint **MUST** return `dinnerId` in the response so the frontend can immediately remove the booked dinner from listings.

## Required Response Format

When a booking is created successfully, the response **MUST** include `dinnerId` at the top level of the `data` object:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_001",
    "status": "CONFIRMED",
    "guests": 4,
    "totalPrice": 300.00,
    "dinnerId": "dinner_001",  // ⚠️ REQUIRED - Must be included here
    "userId": "user_123",
    "createdAt": "2024-10-23T10:00:00.000Z",
    "updatedAt": "2024-10-23T10:00:00.000Z",
    "dinner": {
      "id": "dinner_001",
      // ... nested dinner object
    },
    "user": {
      // ... nested user object
    }
  }
}
```

## Why This is Required

1. **Real-time Listings Removal**: When a user books a dinner, the frontend immediately removes it from all listings (home page, search results) so other users cannot see or book it.

2. **User Experience**: Without `dinnerId`, booked dinners will continue to appear in listings until page refresh, causing confusion.

3. **Prevents Double Booking**: Ensures only one user can book a dinner at a time.

## Implementation

Simply include the `dinnerId` field in the booking response:

```javascript
// After creating booking in database
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
    dinnerId: booking.dinnerId, // ⚠️ Include this field
    userId: booking.userId,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    // ... other fields
  }
})
```

## Testing

1. Create a booking via `POST /api/bookings`
2. Verify the response includes `dinnerId` at the top level of `data`
3. Verify the `dinnerId` matches the dinner that was booked
4. The frontend will automatically remove the dinner from listings when it receives this response

## Notes

- The `dinnerId` should be the same value that was sent in the request body
- It must be a string (the dinner's unique identifier)
- It should be included even if the nested `dinner` object is also included
- This field is **critical** for the frontend's real-time listing removal feature

