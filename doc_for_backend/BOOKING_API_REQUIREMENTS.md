# Booking API Requirements

## Overview
This document outlines the requirements for the Booking API endpoints. Bookings are created directly (no approval workflow) and should include all necessary data for the frontend to display and manage bookings.

## Key Requirements

1. **Direct Booking Creation**: Bookings are created immediately without requiring host approval. The status should be set to "CONFIRMED" (not "PENDING").

2. **Complete Booking Data**: All booking details must be stored and returned, including:
   - Booking ID
   - User/Guest information
   - Dinner/Listing information (including ID)
   - Date and time
   - Number of guests
   - Total price
   - Special requests/message
   - Contact information

3. **Dinner Availability**: When a booking is created, the dinner's `available` count should be decremented. If `available` reaches 0, the dinner should no longer appear in public listings.

4. **Response Format**: All responses should include the booking data with nested dinner and user objects for easy frontend consumption.

---

## Endpoints

### 1. Create Booking
**Endpoint:** `POST /api/bookings`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "dinnerId": "dinner_001",
  "guests": 4,
  "message": "Looking forward to the dinner! Any vegetarian options?",
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Response (Success - 201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_001",
    "status": "CONFIRMED",
    "guests": 4,
    "totalPrice": 300.00,
    "message": "Looking forward to the dinner! Any vegetarian options?",
    "createdAt": "2024-10-23T10:00:00.000Z",
    "updatedAt": "2024-10-23T10:00:00.000Z",
    "dinnerId": "dinner_001",
    "userId": "user_123",
    "dinner": {
      "id": "dinner_001",
      "title": "Authentic Italian Family Feast",
      "date": "2024-11-15T19:00:00.000Z",
      "time": "19:00",
      "price": 75.00,
      "images": ["https://images.unsplash.com/photo-1.jpg"],
      "host": {
        "id": "host_001",
        "name": "Maria Rossi"
      },
      "location": {
        "address": "123 Main St",
        "city": "Brooklyn",
        "state": "NY"
      }
    },
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "image": "https://example.com/john.jpg"
    }
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "error": "Dinner not available",
  "message": "This dinner is fully booked or no longer available"
}
```

**Business Logic:**
1. Verify the dinner exists and is active
2. Check if the dinner has available capacity (available > 0)
3. Verify the dinner date/time hasn't passed
4. Calculate total price: `dinner.price * guests`
5. Create booking with status "CONFIRMED" (NOT "PENDING")
6. Decrement dinner's `available` count by the number of guests
7. If `available` reaches 0 or below, the dinner should not appear in public listings (frontend handles this)
8. Return complete booking object with nested dinner and user data

**Notes:**
- **CRITICAL:** The `dinnerId` field in the response is **REQUIRED** - the frontend uses it to immediately remove the dinner from listings in real-time
- The `dinnerId` must be included at the top level of the response data object (not just in the nested `dinner` object)
- The booking status should always be "CONFIRMED" (not "PENDING") - no approval workflow
- The `totalPrice` should be calculated server-side based on dinner price and number of guests

---

### 2. Get User Bookings (Guest)
**Endpoint:** `GET /api/bookings/user/{userId}`

**Authentication:** Required (Bearer token)

**Query Parameters (Optional):**
- `status`: Filter by status (CONFIRMED, COMPLETED, CANCELLED)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_001",
      "status": "CONFIRMED",
      "guests": 4,
      "totalPrice": 300.00,
      "message": "Looking forward to the dinner!",
      "createdAt": "2024-10-23T10:00:00.000Z",
      "updatedAt": "2024-10-23T10:00:00.000Z",
      "dinner": {
        "id": "dinner_001",
        "title": "Authentic Italian Family Feast",
        "date": "2024-11-15T19:00:00.000Z",
        "time": "19:00",
        "price": 75.00,
        "images": ["https://images.unsplash.com/photo-1.jpg"],
        "host": {
          "id": "host_001",
          "name": "Maria Rossi",
          "image": "https://example.com/maria.jpg"
        },
        "location": {
          "address": "123 Main St",
          "city": "Brooklyn",
          "state": "NY",
          "neighborhood": "Park Slope"
        }
      },
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://example.com/john.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**Business Logic:**
1. Verify the user ID matches the authenticated user (or user has permission)
2. Fetch all bookings for the user
3. Include nested dinner and user objects
4. Support optional filtering and pagination
5. Return bookings sorted by date (most recent first)

---

### 3. Get Host Bookings
**Endpoint:** `GET /api/bookings/host/{hostId}`

**Authentication:** Required (Bearer token)

**Query Parameters (Optional):**
- `status`: Filter by status (CONFIRMED, COMPLETED, CANCELLED)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_001",
      "status": "CONFIRMED",
      "guests": 4,
      "totalPrice": 300.00,
      "message": "Looking forward to the dinner! Any vegetarian options?",
      "createdAt": "2024-10-23T10:00:00.000Z",
      "updatedAt": "2024-10-23T10:00:00.000Z",
      "dinner": {
        "id": "dinner_001",
        "title": "Authentic Italian Family Feast",
        "date": "2024-11-15T19:00:00.000Z",
        "time": "19:00",
        "price": 75.00
      },
      "user": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "image": "https://example.com/john.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

**Business Logic:**
1. Verify the host ID matches the authenticated user (or user has permission)
2. Fetch all bookings for dinners created by this host
3. Include nested dinner and user (guest) objects
4. Support optional filtering and pagination
5. Return bookings sorted by date (most recent first)

---

## Database Schema Requirements

### Booking Table
The booking table should have the following structure:

```sql
Bookings:
- id (Primary Key)
- status (Enum: PENDING, CONFIRMED, CANCELLED, COMPLETED) - Default: CONFIRMED
- guests (Integer)
- totalPrice (Float)
- message (Text, nullable)
- createdAt (DateTime)
- updatedAt (DateTime)
- userId (Foreign Key -> Users.id)
- dinnerId (Foreign Key -> Dinners.id)
```

**Important:** When creating a booking:
- Set status to "CONFIRMED" (not "PENDING")
- Store all contact information if needed (or use user data)
- Update the dinner's `available` count

### Dinner Table Update
When a booking is created:
- Decrement `available` by the number of guests
- Ensure `available` cannot go below 0

---

## Status Values

- **CONFIRMED**: Booking is confirmed and active (default for new bookings)
- **COMPLETED**: The dinner date/time has passed or booking is marked complete
- **CANCELLED**: Booking was cancelled
- **PENDING**: Not used in this implementation (bookings are confirmed immediately)

---

## Error Handling

### Common Errors

1. **Dinner Not Available (400)**
   - Dinner doesn't exist
   - Dinner is fully booked (available === 0)
   - Dinner date/time has passed
   - Dinner is not active

2. **Unauthorized (401)**
   - Missing or invalid authentication token

3. **Forbidden (403)**
   - User doesn't have permission to access bookings
   - User trying to access another user's bookings

4. **Validation Error (400)**
   - Missing required fields
   - Invalid data format
   - Number of guests exceeds capacity

---

## Integration Notes

1. **Frontend Expects:**
   - Booking response includes `dinnerId` so it can remove the dinner from listings
   - Booking status is "CONFIRMED" (not "PENDING")
   - Complete dinner and user objects in the response
   - All booking data needed for display

2. **Dinner Availability:**
   - Frontend filters out dinners with `available === 0` from public listings
   - Frontend also filters out dinners whose date/time has passed
   - Backend should ensure `available` is correctly decremented

3. **No Approval Workflow:**
   - Bookings are created with status "CONFIRMED" immediately
   - No "Accept/Decline" buttons needed in the frontend
   - Host dashboard shows all confirmed bookings

---

## Testing Checklist

- [ ] Create booking successfully with valid data
- [ ] Reject booking when dinner is fully booked
- [ ] Reject booking when dinner date/time has passed
- [ ] Verify dinner `available` count is decremented correctly
- [ ] Verify booking status is "CONFIRMED" (not "PENDING")
- [ ] Verify response includes complete dinner and user objects
- [ ] Get user bookings returns correct bookings
- [ ] Get host bookings returns correct bookings
- [ ] Authentication and authorization work correctly
- [ ] Error handling returns appropriate status codes

---

## Example Frontend Integration

The frontend sends:
```javascript
POST /api/bookings
{
  "dinnerId": "dinner_001",
  "guests": 4,
  "message": "Special requests here",
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

And expects to receive:
- Booking ID
- Booking status: "CONFIRMED"
- Complete booking data with dinner and user objects
- `dinnerId` to remove the dinner from listings

