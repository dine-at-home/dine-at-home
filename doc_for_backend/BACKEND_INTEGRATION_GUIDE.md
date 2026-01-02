# DineWithUs Backend Integration Guide

## 📋 Overview

This guide provides all the information needed to build the backend API for the DineWithUs social dining platform.

---

## 📦 Documentation Files

### 1. **API_SPECIFICATION.md**
Complete API documentation with all endpoints, request/response formats, and error handling.

**What's included:**
- Authentication endpoints
- User management
- Dinners CRUD operations
- Bookings management
- Reviews system
- Search functionality
- Host dashboard endpoints

### 2. **BACKEND_TYPES.ts**
TypeScript type definitions for all request/response objects.

**What's included:**
- Database model types
- Request/response interfaces
- Enums (UserRole, BookingStatus)
- Error types
- Validation rules

### 3. **API_EXAMPLES.md**
Real-world examples of API usage with complete request/response samples.

**What's included:**
- Complete user journeys (guest and host)
- Authentication flow examples
- Search examples
- Error handling examples
- WebSocket events (future)

### 4. **DATABASE_SCHEMA.md**
Complete database schema documentation.

**What's included:**
- Table structures
- Relationships
- Indexes
- Constraints
- Sample queries
- Migration notes

### 5. **prisma/schema.prisma**
Prisma schema file (source of truth for database structure).

---

## 🚀 Quick Start

### 1. Review the Files
```bash
1. Start with API_SPECIFICATION.md - understand all endpoints
2. Review BACKEND_TYPES.ts - understand data structures
3. Check DATABASE_SCHEMA.md - understand database design
4. Look at API_EXAMPLES.md - see real usage examples
5. Review prisma/schema.prisma - see actual schema
```

### 2. Key Technologies
- **Database:** MongoDB
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **API Style:** RESTful
- **Data Format:** JSON

### 3. Authentication
- JWT-based authentication
- Support for Google OAuth and email/password
- Role-based access control (guest, host, admin)
- Session token in Authorization header: `Bearer {token}`

---

## 🔑 Critical Endpoints to Implement First

### Phase 1: Authentication & Users
1. `POST /api/auth/register` - User registration
2. `POST /api/auth/update-role` - Role selection after OAuth
3. `GET /api/auth/current-user` - Get current user
4. `GET /api/users/{userId}` - Get user profile
5. `PATCH /api/users/{userId}` - Update user profile

### Phase 2: Core Functionality
6. `GET /api/dinners` - List dinners with filters
7. `GET /api/dinners/{dinnerId}` - Get dinner details
8. `POST /api/dinners` - Create dinner (host only)
9. `POST /api/bookings` - Create booking
10. `GET /api/bookings/user/{userId}` - Get user bookings

### Phase 3: Host Features
11. `GET /api/host/{hostId}/dinners` - Get host's dinners
12. `GET /api/bookings/host/{hostId}` - Get host's bookings
13. `PATCH /api/bookings/{bookingId}/status` - Update booking status
14. `GET /api/host/{hostId}/stats` - Get host statistics

### Phase 4: Reviews & Search
15. `POST /api/reviews` - Create review
16. `GET /api/dinners/{dinnerId}/reviews` - Get dinner reviews
17. `GET /api/search/dinners` - Advanced search
18. `GET /api/search/cuisines` - Get popular cuisines

---

## 📊 Data Models Summary

### Core Entities

1. **User**
   - Represents both guests and hosts
   - Role-based access (guest, host, admin)
   - OAuth and email/password support

2. **Dinner**
   - Created by hosts
   - Contains all event details
   - JSON fields for images, menu, location, etc.

3. **Booking**
   - Links users to dinners
   - Status workflow: PENDING → CONFIRMED → COMPLETED
   - Manages availability

4. **Review**
   - 1-5 star rating system
   - One review per user per dinner
   - Updates dinner's average rating

---

## 🔐 Authentication Flow

### Email/Password Registration
```
1. POST /api/auth/register
2. Create user with hashed password
3. Return user object
4. Frontend receives JWT token and stores it
```

### Google OAuth Flow
```
1. User clicks "Sign in with Google"
2. Google OAuth redirect
3. OAuth callback handled by frontend (if implemented)
4. If new user:
   - Create user with needsRoleSelection=true
   - Redirect to role selection page
   - POST /api/auth/update-role
5. Set needsRoleSelection=false
6. Redirect to appropriate page (home or dashboard)
```

---

## 🎯 Business Logic Rules

### Dinners
- Only hosts can create dinners
- Date must be in the future
- Available spots must be <= capacity
- Price must be positive
- Images, menu, dietary, etc. stored as JSON strings

### Bookings
- Guests cannot book their own dinners
- Number of guests must be <= available spots
- Total price = dinner.price * guests
- Booking decreases dinner.available
- Cancellation increases dinner.available

### Reviews
- Only after dinner date has passed
- Only for attended dinners (booking status = COMPLETED)
- One review per user per dinner
- Rating must be 1-5
- Updates dinner's average rating and review count

### Role-Based Access
- **Guests:** Can search, book, and review dinners
- **Hosts:** Can create dinners, manage bookings, view stats
- **Admins:** Full access to all features

---

## 🗄️ Database Considerations

### JSON Fields
These fields are stored as JSON strings in PostgreSQL:

```typescript
// In database: string
// In API: array/object

dinner.images: string[]
dinner.menu: string[]
dinner.included: string[]
dinner.houseRules: string[]
dinner.dietary: string[]
dinner.location: LocationObject
```

**Example:**
```sql
-- Database storage
images = '["https://img1.jpg","https://img2.jpg"]'

-- API response
"images": ["https://img1.jpg", "https://img2.jpg"]
```

### Computed Fields
These should be calculated on-the-fly:

- `dinner.available` - Updated when bookings change
- `dinner.rating` - Recalculated when reviews are added
- `dinner.reviewCount` - Incremented with each review

### Indexes
Critical indexes for performance:
- `dinners.date` + `dinners.isActive`
- `dinners.cuisine` + `dinners.isActive`
- `bookings.userId` + `bookings.status`
- `bookings.dinnerId` + `bookings.status`

---

## 🔍 Search Implementation

### Basic Search
```sql
WHERE isActive = true
  AND date > NOW()
  AND available > 0
  AND (location::jsonb->>'city') = $1
  AND cuisine = $2
  AND price BETWEEN $3 AND $4
```

### Full-Text Search (Optional)
Consider implementing full-text search on:
- `dinner.title`
- `dinner.description`
- `dinner.cuisine`

---

## 📧 Email Notifications (Future)

Implement email notifications for:
1. **Booking Created** - Send to host
2. **Booking Confirmed** - Send to guest
3. **Booking Cancelled** - Send to both
4. **Reminder** - 24h before dinner
5. **Review Request** - After dinner completion

---

## 💳 Payment Integration (Future)

Stripe integration needed for:
1. Payment processing
2. Refunds
3. Host payouts
4. Transaction history

---

## 🔔 Real-Time Features (Future)

WebSocket events for:
1. New booking notifications (to hosts)
2. Booking status updates (to guests)
3. New messages (future chat feature)

---

## ✅ Testing Checklist

### Authentication
- [ ] Register with email/password
- [ ] Sign in with Google OAuth
- [ ] Role selection after OAuth
- [ ] Session management
- [ ] Token validation

### Dinners
- [ ] Create dinner (host only)
- [ ] List dinners with filters
- [ ] Get dinner details
- [ ] Update dinner
- [ ] Delete dinner
- [ ] Search dinners

### Bookings
- [ ] Create booking
- [ ] List user bookings
- [ ] List host bookings
- [ ] Update booking status
- [ ] Cancel booking
- [ ] Availability management

### Reviews
- [ ] Create review
- [ ] List dinner reviews
- [ ] Rating calculation
- [ ] One review per user per dinner

### Authorization
- [ ] Guests cannot create dinners
- [ ] Hosts cannot book own dinners
- [ ] Users can only edit own profile
- [ ] Hosts can only manage own dinners

---

## 🐛 Common Issues & Solutions

### Issue 1: JSON Field Parsing
**Problem:** JSON fields stored as strings
**Solution:** Parse on read, stringify on write

```typescript
// Reading
const images = JSON.parse(dinner.images)

// Writing
const imagesString = JSON.stringify(images)
```

### Issue 2: Date Handling
**Problem:** Timezone issues
**Solution:** Always use UTC, store as ISO 8601

```typescript
const date = new Date(dateString).toISOString()
```

### Issue 3: Availability Management
**Problem:** Race conditions on booking
**Solution:** Use database transactions

```sql
BEGIN;
  -- Check availability
  -- Create booking
  -- Update available
COMMIT;
```

### Issue 4: Rating Calculation
**Problem:** Slow recalculation
**Solution:** Update incrementally

```sql
UPDATE dinners
SET rating = (rating * reviewCount + newRating) / (reviewCount + 1),
    reviewCount = reviewCount + 1
WHERE id = $1;
```

---

## 📝 API Response Standards

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* additional info */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## 🔗 Useful Resources

1. **Prisma Documentation:** https://www.prisma.io/docs
2. **JWT Documentation:** https://jwt.io
3. **PostgreSQL JSON Functions:** https://www.postgresql.org/docs/current/functions-json.html
4. **MongoDB Documentation:** https://www.mongodb.com/docs

---

## 📞 Questions?

If you need clarification on any endpoint or data structure:

1. Check **API_SPECIFICATION.md** for endpoint details
2. Check **BACKEND_TYPES.ts** for type definitions
3. Check **API_EXAMPLES.md** for usage examples
4. Check **DATABASE_SCHEMA.md** for database structure
5. Review the **prisma/schema.prisma** file

---

## 🎯 Success Criteria

Your backend implementation is complete when:

- [ ] All Phase 1-4 endpoints are implemented
- [ ] Authentication and authorization work correctly
- [ ] Database schema matches Prisma schema
- [ ] All business logic rules are enforced
- [ ] Error handling follows standards
- [ ] API responses match documentation
- [ ] Role-based access control works
- [ ] JSON fields are properly handled
- [ ] Pagination works on list endpoints
- [ ] Search functionality works with filters

---

## 🚀 Deployment Notes

### Environment Variables Needed
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret-key"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Database Setup
1. Set up MongoDB database (local or MongoDB Atlas)
2. Run `npx prisma db push` to create tables
3. Seed initial data (optional)
4. Set up database backups

### Production Checklist
- [ ] Database connection pooling configured
- [ ] Rate limiting implemented
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] SSL/TLS enabled
- [ ] API documentation published

---

Good luck with the implementation! 🎉

