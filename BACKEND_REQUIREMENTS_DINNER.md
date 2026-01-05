# Backend Requirements for Dinner Creation & Host Dashboard

## Overview
The frontend now sends dinner creation requests to the backend and fetches dinners from the backend. The backend needs to implement the following endpoints and functionality.

---

## Required API Endpoints

### 0. Upload Images (POST) - **REQUIRED FOR IMAGES TO WORK**

**Endpoint:** `POST /api/upload/images`

**Authentication:** Required (Bearer token in Authorization header)

**Request:** 
- Content-Type: `multipart/form-data`
- Body: FormData with `images[]` field (array of image files)

**Example (from frontend):**
```javascript
const formData = new FormData()
files.forEach(file => {
  formData.append('images[]', file)
})

fetch('/api/upload/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // DON'T set Content-Type - browser will set it with boundary
  },
  body: formData
})
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "urls": [
      "http://localhost:3001/uploads/dinner-123-abc.jpg",
      "http://localhost:3001/uploads/dinner-123-def.jpg"
    ]
  }
}
```

**Implementation Options:**

**Option A: Store on Backend Server (Simple - Recommended for Development)**
- Save files to `uploads/` directory on your backend server
- Serve files via static file serving: `http://localhost:3001/uploads/filename.jpg`
- Generate unique filenames: `dinner-{timestamp}-{random}.jpg`
- Return URLs like: `http://localhost:3001/uploads/dinner-123-abc.jpg`

**Option B: Use Cloud Storage (Recommended for Production)**
- **DigitalOcean Spaces** (Recommended - S3-compatible, simple)
- AWS S3
- Cloudinary
- Google Cloud Storage
- Get back permanent URLs: `https://your-space.nyc3.digitaloceanspaces.com/image.jpg`
- Return those URLs

**Backend Implementation Notes:**
- Use a library like `multer` (Node.js) or `multipart/form-data` parser
- Validate file types (only images: jpg, png, webp, etc.)
- Validate file size (max 5MB per image, max 10 images)
- Generate unique filenames to avoid conflicts
- Store files and return permanent URLs

**For DigitalOcean Spaces:**
- Install: `npm install aws-sdk` or `@aws-sdk/client-s3` (Spaces is S3-compatible)
- Configure with Spaces endpoint and credentials
- Upload file to Spaces bucket
- Get back permanent URL: `https://{space-name}.{region}.digitaloceanspaces.com/{filename}`
- Make sure the file is public or use signed URLs

**Error Response (400/413):**
```json
{
  "success": false,
  "error": "File too large. Maximum size is 5MB per image.",
  "code": "FILE_TOO_LARGE"
}
```

---

### 1. Create Dinner (POST)

**Note:** Images should be uploaded FIRST using `/api/upload/images` endpoint, then the returned URLs should be sent in the `images` array.

**Endpoint:** `POST /api/dinners`

**Authentication:** Required (Bearer token in Authorization header)

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
  "dietary": ["Vegetarian", "Gluten-Free"],
  "instantBook": false,
  "menu": ["Antipasto", "Pasta", "Tiramisu"],
  "included": [],
  "houseRules": ["Please arrive on time"],
  "location": {
    "address": "123 Main St",
    "city": "Brooklyn",
    "state": "NY",
    "zipCode": "11201",
    "neighborhood": "Park Slope",
    "coordinates": {
      "lat": 40.6782,
      "lng": -73.9442
    }
  }
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Dinner created successfully",
  "data": {
    "id": "dinner_new_001",
    "title": "Authentic Italian Family Feast",
    "description": "Join us for an authentic Italian dinner...",
    "price": 75.00,
    "currency": "USD",
    "date": "2024-11-15T19:00:00.000Z",
    "time": "19:00",
    "duration": 180,
    "capacity": 8,
    "available": 8,
    "images": ["https://images.unsplash.com/photo-1.jpg"],
    "cuisine": "Italian",
    "dietary": ["Vegetarian", "Gluten-Free"],
    "rating": 0,
    "reviewCount": 0,
    "instantBook": false,
    "menu": ["Antipasto", "Pasta", "Tiramisu"],
    "included": [],
    "houseRules": ["Please arrive on time"],
    "location": {
      "address": "123 Main St",
      "city": "Brooklyn",
      "state": "NY",
      "zipCode": "11201",
      "neighborhood": "Park Slope",
      "coordinates": {
        "lat": 40.6782,
        "lng": -73.9442
      }
    },
    "isActive": true,
    "hostId": "user_123",
    "createdAt": "2024-01-02T10:00:00.000Z",
    "updatedAt": "2024-01-02T10:00:00.000Z"
  }
}
```

**Response (Error - 400/422):**
```json
{
  "success": false,
  "error": "Validation error message",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "title",
    "message": "Title is required"
  }
}
```

**Important Notes:**
- Extract `hostId` from the JWT token (current logged-in user)
- Set `available` = `capacity` initially (no bookings yet)
- Set `rating` = 0 and `reviewCount` = 0 for new dinners
- Set `isActive` = true by default
- Store `images` as JSON array in MongoDB
- Store `dietary`, `menu`, `included`, `houseRules` as JSON arrays in MongoDB
- Store `location` as JSON object in MongoDB
- Store `date` as Date/DateTime type
- Generate unique `id` for the dinner

---

### 2. Get Host Dinners (GET)

**Endpoint:** `GET /api/host/{hostId}/dinners`

**Authentication:** Required (Bearer token in Authorization header)

**Query Parameters (Optional):**
- `status`: "active" | "past" | "all" (default: "all")
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dinner_001",
      "title": "Authentic Italian Pasta Making",
      "description": "Join us for...",
      "price": 85.00,
      "currency": "USD",
      "date": "2024-02-15T19:00:00.000Z",
      "time": "19:00",
      "duration": 180,
      "capacity": 8,
      "available": 2,
      "images": ["https://images.unsplash.com/photo-1.jpg"],
      "cuisine": "Italian",
      "dietary": ["Vegetarian"],
      "rating": 4.9,
      "reviewCount": 12,
      "instantBook": false,
      "menu": ["Pasta", "Bread"],
      "included": [],
      "houseRules": [],
      "location": {
        "address": "123 Main St",
        "city": "Brooklyn",
        "state": "NY",
        "zipCode": "11201",
        "neighborhood": "Park Slope",
        "coordinates": {
          "lat": 40.6782,
          "lng": -73.9442
        }
      },
      "isActive": true,
      "hostId": "user_123",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

**Important Notes:**
- Verify that the `hostId` in URL matches the user ID from JWT token (security)
- Return all dinners for that host
- If `status=active`, filter by `isActive=true` AND `date > now()`
- If `status=past`, filter by `date <= now()`
- If `status=all`, return all dinners
- Parse JSON fields (images, dietary, menu, etc.) when reading from MongoDB
- Calculate `available` = `capacity - confirmed bookings count`

---

## Database Schema (MongoDB)

The backend should store dinners in MongoDB with this structure:

```javascript
{
  _id: ObjectId("..."),
  id: "dinner_001", // Unique string ID (can use _id.toString() or generate)
  title: "Authentic Italian Pasta Making",
  description: "Join us for...",
  price: 85.00,
  currency: "USD",
  date: ISODate("2024-02-15T19:00:00.000Z"),
  time: "19:00",
  duration: 180, // minutes
  capacity: 8,
  available: 2, // capacity - confirmed bookings
  images: ["https://image1.jpg", "https://image2.jpg"], // Array of strings
  cuisine: "Italian",
  dietary: ["Vegetarian", "Gluten-Free"], // Array of strings
  rating: 4.9,
  reviewCount: 12,
  instantBook: false,
  menu: ["Pasta", "Bread", "Dessert"], // Array of strings
  included: [], // Array of strings
  houseRules: ["Please arrive on time"], // Array of strings
  location: {
    address: "123 Main St",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    neighborhood: "Park Slope",
    coordinates: {
      lat: 40.6782,
      lng: -73.9442
    }
  },
  isActive: true,
  hostId: "user_123", // Reference to User _id
  createdAt: ISODate("2024-01-01T10:00:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:00:00.000Z")
}
```

**Indexes to create:**
- Index on `hostId` for faster queries
- Index on `date` for filtering
- Index on `isActive` for filtering
- Compound index on `hostId` + `date` for host dashboard queries

---

## Validation Rules

### Required Fields:
- `title` (string, min 5 characters, max 100)
- `description` (string, min 20 characters, max 2000)
- `price` (number, > 0)
- `date` (ISO date string, must be in the future)
- `time` (string, format: "HH:MM")
- `duration` (number, > 0, in minutes)
- `capacity` (number, >= 2, <= 50)
- `cuisine` (string)
- `location.address` (string)
- `location.city` (string)
- `location.state` (string)

### Optional Fields:
- `currency` (default: "USD")
- `images` (array, max 10 images)
- `dietary` (array)
- `instantBook` (boolean, default: false)
- `menu` (array)
- `included` (array)
- `houseRules` (array)
- `location.zipCode` (string)
- `location.neighborhood` (string)
- `location.coordinates` (object with lat/lng)

---

## Error Handling

### Error Response Format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "fieldName",
    "message": "Specific error message"
  }
}
```

### Common Error Codes:
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (user is not a host, or trying to access another host's dinners)
- `422` - Validation Error (invalid data format)
- `500` - Internal Server Error

---

## Security Requirements

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:** 
   - Only users with `role: "host"` can create dinners
   - Users can only fetch their own dinners (hostId must match token userId)
3. **Input Validation:** Validate all input fields before saving to database
4. **SQL Injection Prevention:** Use parameterized queries/MongoDB drivers
5. **XSS Prevention:** Sanitize user input for description, title, etc.

---

## Testing Checklist

- [ ] Create dinner with valid data → Returns 201 with dinner object
- [ ] Create dinner without authentication → Returns 401
- [ ] Create dinner as non-host user → Returns 403
- [ ] Create dinner with missing required fields → Returns 422
- [ ] Create dinner with invalid date (past date) → Returns 422
- [ ] Get host dinners with valid hostId → Returns 200 with array
- [ ] Get host dinners with invalid hostId → Returns 403
- [ ] Get host dinners without authentication → Returns 401
- [ ] Get host dinners with status filter → Returns filtered results
- [ ] Verify dinner appears in database after creation
- [ ] Verify JSON fields (images, dietary, menu, location) are stored correctly

---

## Frontend Integration Notes

The frontend is now sending requests to:
- `POST /api/dinners` - Create dinner
- `GET /api/host/{hostId}/dinners` - Get host dinners

The frontend expects:
- Response format: `{ success: true, data: {...} }`
- Error format: `{ success: false, error: "...", code: "..." }`
- All responses include proper HTTP status codes

After dinner creation, the frontend redirects to `/host/dashboard?tab=dinners` and fetches the updated list.

---

---

## Image Upload Flow (DigitalOcean Spaces)

### Complete Flow:

```
1. User selects images in frontend
   ↓
2. Frontend sends images to: POST /api/upload/images
   ↓
3. Backend receives images
   ↓
4. Backend uploads to DigitalOcean Spaces
   ↓
5. DigitalOcean Spaces returns permanent URL:
   https://your-space.nyc3.digitaloceanspaces.com/dinner-123-abc.jpg
   ↓
6. Backend returns URLs to frontend:
   { "urls": ["https://...jpg", "https://...jpg"] }
   ↓
7. Frontend sends URLs in create dinner request:
   POST /api/dinners { "images": ["https://...jpg", ...] }
   ↓
8. Backend saves URLs to MongoDB (in images array)
   ↓
9. When fetching dinners:
   GET /api/host/{hostId}/dinners
   ↓
10. Backend gets URLs from MongoDB
   ↓
11. Backend returns URLs to frontend
   ↓
12. Frontend displays images using URLs
   ✅ Images show correctly!
```

### Key Points:
- ✅ Images stored permanently in DigitalOcean Spaces
- ✅ URLs stored in MongoDB (not the actual files)
- ✅ URLs are permanent and accessible from anywhere
- ✅ Fast CDN delivery from DigitalOcean
- ✅ Scalable - unlimited storage

---

## Questions?

If you need clarification on any of these requirements, please ask!

