# DineWithUs API Specification

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Dinners](#dinners)
4. [Bookings](#bookings)
5. [Reviews](#reviews)
6. [Search](#search)
7. [Host Dashboard](#host-dashboard)

---

## Authentication

### Register User (Email/Password)
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "guest" // or "host"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "guest",
    "createdAt": "2024-10-23T10:00:00.000Z"
  }
}
```

### Update User Role (After OAuth)
**Endpoint:** `POST /api/auth/update-role`

**Request Body:**
```json
{
  "role": "guest" // or "host"
}
```

**Response:**
```json
{
  "success": true,
  "role": "guest"
}
```

### Get Current User
**Endpoint:** `GET /api/auth/current-user`

**Headers:**
```
Authorization: Bearer {session_token}
```

**Response:**
```json
{
  "email": "user@example.com",
  "role": "guest",
  "needsRoleSelection": false
}
```

---

## User Management

### User Object
```typescript
{
  "id": "clxxx123456",
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://example.com/avatar.jpg",
  "role": "guest", // "guest" | "host" | "admin"
  "emailVerified": "2024-10-23T10:00:00.000Z",
  "needsRoleSelection": false,
  "createdAt": "2024-10-23T10:00:00.000Z",
  "updatedAt": "2024-10-23T10:00:00.000Z"
}
```

### Get User Profile
**Endpoint:** `GET /api/users/{userId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/avatar.jpg",
    "role": "guest",
    "bio": "Food enthusiast and home chef",
    "joinedDate": "2024-01-15T10:00:00.000Z",
    "responseRate": 98,
    "responseTime": "within an hour",
    "superhost": false
  }
}
```

### Update User Profile
**Endpoint:** `PATCH /api/users/{userId}`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Updated bio",
  "image": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "clxxx123456",
    "name": "John Doe Updated",
    "bio": "Updated bio",
    "image": "https://example.com/new-avatar.jpg"
  }
}
```

---

## Dinners

### Dinner Object
```typescript
{
  "id": "dinner_001",
  "title": "Authentic Italian Family Feast",
  "description": "Join us for an authentic Italian dinner...",
  "price": 75.00,
  "currency": "USD",
  "date": "2024-11-15T19:00:00.000Z",
  "time": "19:00",
  "duration": 180, // in minutes
  "capacity": 8,
  "available": 5,
  "images": [
    "https://images.unsplash.com/photo-1.jpg",
    "https://images.unsplash.com/photo-2.jpg"
  ],
  "cuisine": "Italian",
  "dietary": ["Vegetarian options", "Gluten-free available"],
  "rating": 4.9,
  "reviewCount": 47,
  "instantBook": true,
  "menu": [
    "Antipasto platter",
    "Homemade pasta",
    "Tiramisu"
  ],
  "included": [
    "Welcome aperitivo",
    "3-course meal",
    "Wine pairing"
  ],
  "houseRules": [
    "Please arrive on time",
    "No smoking",
    "Respect the space"
  ],
  "location": {
    "address": "123 Main St",
    "city": "Brooklyn",
    "state": "NY",
    "neighborhood": "Park Slope",
    "coordinates": {
      "lat": 40.6782,
      "lng": -73.9442
    }
  },
  "host": {
    "id": "host_001",
    "name": "Maria Rossi",
    "avatar": "https://example.com/maria.jpg",
    "superhost": true,
    "joinedDate": "2020-01-15T10:00:00.000Z",
    "responseRate": 98,
    "responseTime": "within an hour",
    "bio": "Passionate Italian chef sharing family recipes"
  },
  "isActive": true,
  "createdAt": "2024-10-01T10:00:00.000Z",
  "updatedAt": "2024-10-23T10:00:00.000Z"
}
```

### Get All Dinners (with filters)
**Endpoint:** `GET /api/dinners`

**Query Parameters:**
```
?location=Brooklyn
&date=2024-11-15
&guests=4
&cuisine=Italian
&minPrice=50
&maxPrice=100
&instantBook=true
&page=1
&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Dinner object (see above)
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Get Single Dinner
**Endpoint:** `GET /api/dinners/{dinnerId}`

**Response:**
```json
{
  "success": true,
  "data": {
    // Complete Dinner object with reviews
    "id": "dinner_001",
    "title": "Authentic Italian Family Feast",
    // ... all dinner fields
    "reviews": [
      {
        "id": "review_001",
        "userId": "user_123",
        "userName": "Sarah Johnson",
        "userAvatar": "https://example.com/sarah.jpg",
        "rating": 5,
        "comment": "Amazing experience!",
        "date": "2024-10-20T10:00:00.000Z",
        "helpful": 12
      }
    ]
  }
}
```

### Create Dinner (Host only)
**Endpoint:** `POST /api/dinners`

**Request Body:**
```json
{
  "title": "Authentic Italian Family Feast",
  "description": "Join us for an authentic Italian dinner...",
  "price": 75.00,
  "currency": "USD",
  "date": "2024-11-15T19:00:00.000Z",
  "time": "19:00",
  "duration": 180,
  "capacity": 8,
  "images": [
    "https://images.unsplash.com/photo-1.jpg"
  ],
  "cuisine": "Italian",
  "dietary": ["Vegetarian options"],
  "instantBook": true,
  "menu": ["Antipasto", "Pasta", "Tiramisu"],
  "included": ["Welcome drink", "3-course meal"],
  "houseRules": ["Please arrive on time"],
  "location": {
    "address": "123 Main St",
    "city": "Brooklyn",
    "state": "NY",
    "neighborhood": "Park Slope",
    "coordinates": {
      "lat": 40.6782,
      "lng": -73.9442
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dinner created successfully",
  "data": {
    "id": "dinner_new_001",
    // ... complete dinner object
  }
}
```

### Update Dinner (Host only)
**Endpoint:** `PATCH /api/dinners/{dinnerId}`

**Request Body:**
```json
{
  "title": "Updated Title",
  "price": 80.00,
  "available": 6
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dinner updated successfully",
  "data": {
    // Updated dinner object
  }
}
```

### Delete Dinner (Host only)
**Endpoint:** `DELETE /api/dinners/{dinnerId}`

**Response:**
```json
{
  "success": true,
  "message": "Dinner deleted successfully"
}
```

---

## Bookings

### Booking Object
```typescript
{
  "id": "booking_001",
  "status": "PENDING", // "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  "guests": 4,
  "totalPrice": 300.00,
  "message": "Looking forward to the dinner!",
  "createdAt": "2024-10-23T10:00:00.000Z",
  "updatedAt": "2024-10-23T10:00:00.000Z",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://example.com/john.jpg"
  },
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
  }
}
```

### Create Booking
**Endpoint:** `POST /api/bookings`

**Request Body:**
```json
{
  "dinnerId": "dinner_001",
  "guests": 4,
  "message": "Looking forward to the dinner!",
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking_001",
    "status": "PENDING",
    "guests": 4,
    "totalPrice": 300.00,
    "dinnerId": "dinner_001",
    "userId": "user_123",
    "createdAt": "2024-10-23T10:00:00.000Z"
  }
}
```

### Get User Bookings
**Endpoint:** `GET /api/bookings/user/{userId}`

**Query Parameters:**
```
?status=CONFIRMED
&page=1
&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Booking object (see above)
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

### Get Host Bookings
**Endpoint:** `GET /api/bookings/host/{hostId}`

**Query Parameters:**
```
?status=PENDING
&page=1
&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Booking object (see above)
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

### Update Booking Status (Host only)
**Endpoint:** `PATCH /api/bookings/{bookingId}/status`

**Request Body:**
```json
{
  "status": "CONFIRMED" // "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking status updated successfully",
  "data": {
    "id": "booking_001",
    "status": "CONFIRMED",
    "updatedAt": "2024-10-23T10:00:00.000Z"
  }
}
```

### Cancel Booking
**Endpoint:** `DELETE /api/bookings/{bookingId}`

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

## Reviews

### Review Object
```typescript
{
  "id": "review_001",
  "rating": 5, // 1-5
  "comment": "Amazing experience! The food was incredible.",
  "createdAt": "2024-10-20T10:00:00.000Z",
  "user": {
    "id": "user_123",
    "name": "Sarah Johnson",
    "image": "https://example.com/sarah.jpg"
  },
  "dinner": {
    "id": "dinner_001",
    "title": "Authentic Italian Family Feast"
  }
}
```

### Create Review
**Endpoint:** `POST /api/reviews`

**Request Body:**
```json
{
  "dinnerId": "dinner_001",
  "rating": 5,
  "comment": "Amazing experience! The food was incredible."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "review_001",
    "rating": 5,
    "comment": "Amazing experience!",
    "userId": "user_123",
    "dinnerId": "dinner_001",
    "createdAt": "2024-10-23T10:00:00.000Z"
  }
}
```

### Get Dinner Reviews
**Endpoint:** `GET /api/dinners/{dinnerId}/reviews`

**Query Parameters:**
```
?page=1
&limit=10
&sort=recent // "recent" | "helpful" | "rating"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Review object (see above)
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "totalPages": 5
  }
}
```

### Get User Reviews
**Endpoint:** `GET /api/users/{userId}/reviews`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Review object (see above)
    }
  ]
}
```

---

## Search

### Search Dinners
**Endpoint:** `GET /api/search/dinners`

**Query Parameters:**
```
?query=Italian pasta
&location=Brooklyn
&date=2024-11-15
&guests=4
&cuisine=Italian
&minPrice=50
&maxPrice=100
&instantBook=true
&dietary=vegetarian
&page=1
&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Dinner object (see above)
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  },
  "filters": {
    "cuisines": ["Italian", "French", "Japanese"],
    "priceRange": {
      "min": 30,
      "max": 150
    },
    "cities": ["Brooklyn", "Manhattan", "Queens"]
  }
}
```

### Get Popular Cuisines
**Endpoint:** `GET /api/search/cuisines`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Italian",
      "count": 45,
      "image": "https://example.com/italian.jpg"
    },
    {
      "name": "Japanese",
      "count": 38,
      "image": "https://example.com/japanese.jpg"
    }
  ]
}
```

### Get Popular Locations
**Endpoint:** `GET /api/search/locations`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "city": "Brooklyn",
      "state": "NY",
      "count": 67,
      "image": "https://example.com/brooklyn.jpg"
    }
  ]
}
```

---

## Host Dashboard

### Get Host Statistics
**Endpoint:** `GET /api/host/{hostId}/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDinners": 12,
    "activeDinners": 8,
    "totalBookings": 156,
    "pendingBookings": 5,
    "confirmedBookings": 3,
    "totalRevenue": 11700.00,
    "monthlyRevenue": 2400.00,
    "averageRating": 4.8,
    "totalReviews": 89,
    "responseRate": 98,
    "responseTime": "within an hour"
  }
}
```

### Get Host Dinners
**Endpoint:** `GET /api/host/{hostId}/dinners`

**Query Parameters:**
```
?status=active // "active" | "past" | "all"
&page=1
&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Dinner object (see above)
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

### Get Host Reviews
**Endpoint:** `GET /api/host/{hostId}/reviews`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      // Review object (see above)
    }
  ],
  "stats": {
    "averageRating": 4.8,
    "totalReviews": 89,
    "ratingDistribution": {
      "5": 67,
      "4": 18,
      "3": 3,
      "2": 1,
      "1": 0
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details if applicable
  }
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Example Error Response

```json
{
  "success": false,
  "error": "Invalid booking date",
  "code": "INVALID_DATE",
  "details": {
    "field": "date",
    "message": "Booking date must be in the future"
  }
}
```

---

## Authentication

All authenticated endpoints require a valid session token in the Authorization header:

```
Authorization: Bearer {session_token}
```

JWT tokens are stored in localStorage and sent in the Authorization header.

---

## Rate Limiting

- **Guest users:** 100 requests per 15 minutes
- **Authenticated users:** 200 requests per 15 minutes
- **Host users:** 500 requests per 15 minutes

---

## Pagination

All list endpoints support pagination with these query parameters:

- `page` (default: 1)
- `limit` (default: 20, max: 100)

---

## Date Formats

All dates should be in ISO 8601 format:
```
2024-10-23T10:00:00.000Z
```

---

## Notes for Backend Developer

1. **Database Schema:** See `prisma/schema.prisma` for the complete database schema
2. **JSON Fields:** Some fields (images, menu, dietary, etc.) are stored as JSON strings in the database
3. **Authentication:** Using JWT tokens with email/password and OTP verification
4. **File Uploads:** Image uploads should return URLs to be stored in the database
5. **Real-time Updates:** Consider WebSocket support for booking notifications
6. **Payment Integration:** Stripe integration will be needed for payment processing
7. **Email Notifications:** Email service needed for booking confirmations and updates

