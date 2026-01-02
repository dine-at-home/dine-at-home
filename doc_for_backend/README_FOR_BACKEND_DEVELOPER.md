# 👨‍💻 Backend Developer - Start Here!

## 📦 What You're Building

**DineWithUs** is a social dining platform that connects food enthusiasts with home chefs who host intimate dining experiences. Think "Airbnb for dinner parties."

---

## 📚 Documentation Files

I've prepared **5 comprehensive documents** for you:

### 1️⃣ **BACKEND_INTEGRATION_GUIDE.md** ⭐ START HERE
Your main guide with overview, quick start, and implementation phases.

### 2️⃣ **API_SPECIFICATION.md**
Complete API documentation:
- All endpoints with request/response formats
- Authentication flow
- Error handling
- Rate limiting

### 3️⃣ **BACKEND_TYPES.ts**
TypeScript type definitions:
- Database models
- Request/response interfaces
- Enums and validation rules
- You can copy-paste these into your backend

### 4️⃣ **API_EXAMPLES.md**
Real-world examples:
- Complete user journeys
- Sample requests/responses
- Error examples
- Testing credentials

### 5️⃣ **DATABASE_SCHEMA.md**
Database documentation:
- Table structures
- Relationships
- Indexes and constraints
- Sample SQL queries
- Migration notes

### 6️⃣ **prisma/schema.prisma**
The actual Prisma schema file (source of truth for database).

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Read These First
1. **BACKEND_INTEGRATION_GUIDE.md** (10 min) - Overview and phases
2. **API_SPECIFICATION.md** (20 min) - All endpoints
3. **BACKEND_TYPES.ts** (5 min) - Data structures

### Step 2: Understand the Data Model
```
User (guest/host)
  ↓
  Creates → Dinner (event)
  ↓
  Makes → Booking (reservation)
  ↓
  Writes → Review (rating + comment)
```

### Step 3: Start Implementing
Follow the **4 phases** in BACKEND_INTEGRATION_GUIDE.md:
- Phase 1: Authentication & Users
- Phase 2: Core Functionality (Dinners & Bookings)
- Phase 3: Host Features
- Phase 4: Reviews & Search

---

## 🎯 Key Concepts

### 1. User Roles
- **Guest:** Can search, book, and review dinners
- **Host:** Can create dinners and manage bookings
- **Admin:** Full access (future)

### 2. Booking Flow
```
Guest searches → Views dinner → Creates booking (PENDING)
                                      ↓
Host receives notification → Confirms booking (CONFIRMED)
                                      ↓
Dinner happens → Status changes to (COMPLETED)
                                      ↓
Guest can leave review
```

### 3. JSON Fields
Some database fields store JSON as strings:
- `dinner.images` - Array of image URLs
- `dinner.menu` - Array of menu items
- `dinner.location` - Object with address, city, coordinates

**Important:** Parse on read, stringify on write!

---

## 💡 Critical Business Rules

### Dinners
✅ Only hosts can create dinners
✅ Date must be in the future
✅ Available spots ≤ capacity
✅ Price must be positive

### Bookings
✅ Guests can't book their own dinners
✅ Number of guests ≤ available spots
✅ Booking decreases `dinner.available`
✅ Cancellation increases `dinner.available`

### Reviews
✅ Only after dinner date has passed
✅ Only for attended dinners (status = COMPLETED)
✅ One review per user per dinner
✅ Rating must be 1-5 stars

---

## 🗄️ Database

**Type:** MongoDB
**ORM:** Prisma

### Main Tables
1. **users** - User accounts (guests and hosts)
2. **dinners** - Dinner events created by hosts
3. **bookings** - Reservations made by guests
4. **reviews** - Ratings and comments
5. **accounts** - OAuth provider data
6. **sessions** - User sessions (for future use)

### Key Relationships
```
users (1) ──→ (*) dinners (as host)
users (1) ──→ (*) bookings (as guest)
dinners (1) ──→ (*) bookings
dinners (1) ──→ (*) reviews
users (1) ──→ (*) reviews
```

---

## 🔐 Authentication

**Method:** JWT (JSON Web Tokens)

**Providers:**
- Google OAuth
- Email/Password

**Flow:**
1. User signs in (Google or email/password)
2. If new Google user → select role (guest/host)
3. Session created with role
4. All requests include session token

**Authorization Header:**
```
Authorization: Bearer {session_token}
```

---

## 📋 Implementation Checklist

### Phase 1: Authentication (Week 1)
- [ ] `POST /api/auth/register` - Register user
- [ ] `POST /api/auth/update-role` - Set role after OAuth
- [ ] `GET /api/auth/current-user` - Get current user
- [ ] `GET /api/users/{userId}` - Get profile
- [ ] `PATCH /api/users/{userId}` - Update profile

### Phase 2: Core Features (Week 2)
- [ ] `GET /api/dinners` - List dinners
- [ ] `GET /api/dinners/{id}` - Get dinner details
- [ ] `POST /api/dinners` - Create dinner (host only)
- [ ] `POST /api/bookings` - Create booking
- [ ] `GET /api/bookings/user/{id}` - User's bookings

### Phase 3: Host Dashboard (Week 3)
- [ ] `GET /api/host/{id}/dinners` - Host's dinners
- [ ] `GET /api/bookings/host/{id}` - Host's bookings
- [ ] `PATCH /api/bookings/{id}/status` - Update status
- [ ] `GET /api/host/{id}/stats` - Host statistics

### Phase 4: Reviews & Search (Week 4)
- [ ] `POST /api/reviews` - Create review
- [ ] `GET /api/dinners/{id}/reviews` - Get reviews
- [ ] `GET /api/search/dinners` - Search with filters
- [ ] `GET /api/search/cuisines` - Popular cuisines

---

## 🛠️ Tech Stack

**Required:**
- Node.js / Express (or your preferred framework)
- PostgreSQL
- Prisma ORM
- JWT token validation

**Recommended:**
- TypeScript
- Express.js or Fastify
- Joi or Zod (validation)
- Winston (logging)

---

## 📊 API Response Format

### Success
```json
{
  "success": true,
  "data": { /* your data */ }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Paginated
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

## 🧪 Testing

### Test Users
Create these for testing:

**Guest:**
```
Email: guest@test.com
Password: TestGuest123!
Role: guest
```

**Host:**
```
Email: host@test.com
Password: TestHost123!
Role: host
```

### Test Data
Seed database with:
- 5-10 sample dinners
- 3-5 sample bookings
- 5-10 sample reviews

---

## 🔍 Example Requests

### Create Dinner (Host)
```bash
POST /api/dinners
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Italian Family Feast",
  "description": "Authentic Italian dinner...",
  "price": 75.00,
  "date": "2024-11-15T19:00:00.000Z",
  "time": "19:00",
  "duration": 180,
  "capacity": 8,
  "cuisine": "Italian",
  "images": ["https://..."],
  "menu": ["Antipasto", "Pasta", "Tiramisu"],
  "location": {
    "address": "123 Main St",
    "city": "Brooklyn",
    "state": "NY"
  }
}
```

### Create Booking (Guest)
```bash
POST /api/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "dinnerId": "dinner_001",
  "guests": 4,
  "message": "Looking forward to it!",
  "contactInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

### Search Dinners
```bash
GET /api/search/dinners?location=Brooklyn&date=2024-11-15&guests=4&cuisine=Italian&minPrice=50&maxPrice=100
```

---

## ⚠️ Common Pitfalls

### 1. JSON Fields
❌ **Wrong:** Storing arrays/objects directly
✅ **Right:** Store as JSON string, parse on read

### 2. Availability Management
❌ **Wrong:** Update without checking
✅ **Right:** Use transactions to prevent race conditions

### 3. Date Handling
❌ **Wrong:** Using local time
✅ **Right:** Always use UTC (ISO 8601 format)

### 4. Authorization
❌ **Wrong:** Trusting client-side role
✅ **Right:** Always verify role from session/database

---

## 🌐 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# JWT Secret
JWT_SECRET="your-secret-key"

# OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

---

## 📞 Need Help?

### For Endpoint Details
→ Check **API_SPECIFICATION.md**

### For Data Types
→ Check **BACKEND_TYPES.ts**

### For Examples
→ Check **API_EXAMPLES.md**

### For Database
→ Check **DATABASE_SCHEMA.md**

### For Overview
→ Check **BACKEND_INTEGRATION_GUIDE.md**

---

## ✅ Definition of Done

Your backend is complete when:

✅ All 18 critical endpoints work
✅ Authentication & authorization work
✅ Business rules are enforced
✅ JSON fields are handled correctly
✅ Error responses match documentation
✅ Pagination works
✅ Search with filters works
✅ Role-based access control works
✅ Database matches Prisma schema

---

## 🎉 Let's Build This!

You have everything you need:
- ✅ Complete API specification
- ✅ Type definitions
- ✅ Database schema
- ✅ Real examples
- ✅ Implementation guide

**Start with BACKEND_INTEGRATION_GUIDE.md and follow the phases!**

Good luck! 🚀

---

## 📁 File Structure

```
📦 DineWithUs Backend Documentation
├── 📄 README_FOR_BACKEND_DEVELOPER.md (this file)
├── 📄 BACKEND_INTEGRATION_GUIDE.md (start here)
├── 📄 API_SPECIFICATION.md (all endpoints)
├── 📄 BACKEND_TYPES.ts (type definitions)
├── 📄 API_EXAMPLES.md (usage examples)
├── 📄 DATABASE_SCHEMA.md (database docs)
└── 📁 prisma/
    └── 📄 schema.prisma (actual schema)
```

