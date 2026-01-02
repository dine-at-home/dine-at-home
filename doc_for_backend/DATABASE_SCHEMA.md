# DineWithUs Database Schema

## Overview

This document describes the database schema for the DineWithUs application. The schema is designed for PostgreSQL and uses Prisma ORM.

---

## Tables

### 1. users

Stores user account information for both guests and hosts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PRIMARY KEY | Unique user identifier |
| email | String | UNIQUE, NOT NULL | User's email address |
| name | String | NULLABLE | User's full name |
| password | String | NULLABLE | Hashed password (null for OAuth users) |
| image | String | NULLABLE | Profile picture URL |
| role | String | NOT NULL, DEFAULT 'guest' | User role: 'guest', 'host', or 'admin' |
| emailVerified | DateTime | NULLABLE | Email verification timestamp |
| needsRoleSelection | Boolean | NOT NULL, DEFAULT false | Flag for OAuth users who need to select role |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Account creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

**Relationships:**
- Has many `accounts` (OAuth providers)
- Has many `sessions`
- Has many `dinners` (as host)
- Has many `bookings` (as guest)
- Has many `reviews`

---

### 2. accounts

Stores OAuth provider information for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PRIMARY KEY | Unique account identifier |
| userId | String | NOT NULL, FOREIGN KEY | Reference to users.id |
| type | String | NOT NULL | Account type (e.g., 'oauth') |
| provider | String | NOT NULL | OAuth provider (e.g., 'google') |
| providerAccountId | String | NOT NULL | Provider's user ID |
| refresh_token | String | NULLABLE | OAuth refresh token |
| access_token | String | NULLABLE | OAuth access token |
| expires_at | Integer | NULLABLE | Token expiration timestamp |
| token_type | String | NULLABLE | Token type (e.g., 'Bearer') |
| scope | String | NULLABLE | OAuth scopes |
| id_token | String | NULLABLE | OpenID Connect ID token |
| session_state | String | NULLABLE | OAuth session state |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(provider, providerAccountId)`
- INDEX on `userId`

**Relationships:**
- Belongs to `users` (userId)

**Cascade:** DELETE on user deletion

---

### 3. sessions

Stores user session information (for future use).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PRIMARY KEY | Unique session identifier |
| sessionToken | String | UNIQUE, NOT NULL | Session token |
| userId | String | NOT NULL, FOREIGN KEY | Reference to users.id |
| expires | DateTime | NOT NULL | Session expiration timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `sessionToken`
- INDEX on `userId`

**Relationships:**
- Belongs to `users` (userId)

**Cascade:** DELETE on user deletion

---

### 4. verification_tokens

Stores email verification tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| identifier | String | NOT NULL | User identifier (usually email) |
| token | String | UNIQUE, NOT NULL | Verification token |
| expires | DateTime | NOT NULL | Token expiration timestamp |

**Indexes:**
- UNIQUE INDEX on `token`
- UNIQUE INDEX on `(identifier, token)`

---

### 5. dinners

Stores dinner event information created by hosts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PRIMARY KEY | Unique dinner identifier |
| title | String | NOT NULL | Dinner title |
| description | String | NOT NULL | Detailed description |
| price | Float | NOT NULL | Price per person |
| currency | String | NOT NULL, DEFAULT 'USD' | Currency code (ISO 4217) |
| date | DateTime | NOT NULL | Dinner date and time |
| time | String | NOT NULL | Dinner time (HH:MM format) |
| duration | Integer | NOT NULL | Duration in minutes |
| capacity | Integer | NOT NULL | Maximum number of guests |
| available | Integer | NOT NULL | Available spots |
| images | String | NOT NULL | JSON array of image URLs |
| cuisine | String | NOT NULL | Cuisine type |
| dietary | String | NOT NULL | JSON array of dietary options |
| rating | Float | NOT NULL, DEFAULT 0 | Average rating (0-5) |
| reviewCount | Integer | NOT NULL, DEFAULT 0 | Total number of reviews |
| instantBook | Boolean | NOT NULL, DEFAULT false | Allow instant booking |
| menu | String | NOT NULL | JSON array of menu items |
| included | String | NOT NULL | JSON array of included items |
| houseRules | String | NOT NULL | JSON array of house rules |
| location | String | NOT NULL | JSON object with location data |
| isActive | Boolean | NOT NULL, DEFAULT true | Whether dinner is active |
| hostId | String | NOT NULL, FOREIGN KEY | Reference to users.id |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |

**JSON Field Structures:**

**images:**
```json
["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
```

**dietary:**
```json
["Vegetarian options", "Gluten-free available", "Vegan option"]
```

**menu:**
```json
["Antipasto platter", "Homemade pasta", "Tiramisu"]
```

**included:**
```json
["Welcome drink", "3-course meal", "Wine pairing"]
```

**houseRules:**
```json
["Please arrive on time", "No smoking", "Respect the space"]
```

**location:**
```json
{
  "address": "123 Main St",
  "city": "Brooklyn",
  "state": "NY",
  "neighborhood": "Park Slope",
  "coordinates": {
    "lat": 40.6782,
    "lng": -73.9442
  }
}
```

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `hostId`
- INDEX on `date`
- INDEX on `cuisine`
- INDEX on `isActive`

**Relationships:**
- Belongs to `users` (hostId)
- Has many `bookings`
- Has many `reviews`

---

### 6. bookings

Stores booking information for dinner reservations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PRIMARY KEY | Unique booking identifier |
| status | BookingStatus | NOT NULL, DEFAULT 'PENDING' | Booking status enum |
| guests | Integer | NOT NULL | Number of guests |
| totalPrice | Float | NOT NULL | Total booking price |
| message | String | NULLABLE | Special requests or message |
| userId | String | NOT NULL, FOREIGN KEY | Reference to users.id (guest) |
| dinnerId | String | NOT NULL, FOREIGN KEY | Reference to dinners.id |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Booking creation timestamp |
| updatedAt | DateTime | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `userId`
- INDEX on `dinnerId`
- INDEX on `status`

**Relationships:**
- Belongs to `users` (userId)
- Belongs to `dinners` (dinnerId)

---

### 7. reviews

Stores reviews and ratings for dinners.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String (cuid) | PRIMARY KEY | Unique review identifier |
| rating | Integer | NOT NULL | Rating (1-5 stars) |
| comment | String | NULLABLE | Review comment |
| userId | String | NOT NULL, FOREIGN KEY | Reference to users.id |
| dinnerId | String | NOT NULL, FOREIGN KEY | Reference to dinners.id |
| createdAt | DateTime | NOT NULL, DEFAULT now() | Review creation timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `(userId, dinnerId)` - One review per user per dinner
- INDEX on `dinnerId`
- INDEX on `userId`

**Relationships:**
- Belongs to `users` (userId)
- Belongs to `dinners` (dinnerId)

---

## Enums

### BookingStatus

```sql
CREATE TYPE "BookingStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED'
);
```

**Status Flow:**
```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED
```

---

## Relationships Diagram

```
users (1) ──────────────────────── (*) accounts
  │                                      (OAuth providers)
  │
  ├── (1) ────────────────────────── (*) sessions
  │                                      (User sessions)
  │
  ├── (1 as host) ────────────────── (*) dinners
  │                                      (Hosted dinners)
  │
  ├── (1 as guest) ───────────────── (*) bookings
  │                                      (Made bookings)
  │
  └── (1) ────────────────────────── (*) reviews
                                         (Written reviews)

dinners (1) ────────────────────────── (*) bookings
  │                                        (Dinner bookings)
  │
  └── (1) ──────────────────────────── (*) reviews
                                           (Dinner reviews)
```

---

## Constraints and Business Rules

### User Constraints
- Email must be unique
- Role must be one of: 'guest', 'host', 'admin'
- OAuth users (password is null) must have an associated account

### Dinner Constraints
- Price must be positive
- Capacity must be positive
- Available must be <= capacity
- Available must be >= 0
- Date must be in the future (enforced at application level)
- Duration must be between 30 and 480 minutes
- Rating must be between 0 and 5
- Host must have role 'host' or 'admin'

### Booking Constraints
- Guests must be positive
- Guests must be <= dinner.available
- Total price = dinner.price * guests
- User cannot book their own dinner
- User cannot book the same dinner twice (unless previous booking is cancelled)

### Review Constraints
- Rating must be between 1 and 5
- User can only review a dinner once
- User can only review dinners they have attended (booking status = COMPLETED)
- Review can only be created after dinner date has passed

---

## Triggers and Computed Fields

### Automatic Updates

1. **Update dinner.available on booking:**
   - When booking is CONFIRMED: `available -= booking.guests`
   - When booking is CANCELLED: `available += booking.guests`

2. **Update dinner.rating and reviewCount on review:**
   - Recalculate average rating
   - Increment reviewCount

3. **Update user.updatedAt:**
   - Automatically updated on any user modification

---

## Indexes for Performance

### Recommended Additional Indexes

```sql
-- Search optimization
CREATE INDEX idx_dinners_location ON dinners USING GIN ((location::jsonb));
CREATE INDEX idx_dinners_date_active ON dinners(date, isActive);
CREATE INDEX idx_dinners_cuisine_active ON dinners(cuisine, isActive);

-- Booking queries
CREATE INDEX idx_bookings_user_status ON bookings(userId, status);
CREATE INDEX idx_bookings_dinner_status ON bookings(dinnerId, status);

-- Review queries
CREATE INDEX idx_reviews_dinner_created ON reviews(dinnerId, createdAt DESC);
```

---

## Sample Queries

### Get Available Dinners
```sql
SELECT * FROM dinners
WHERE isActive = true
  AND date > NOW()
  AND available > 0
  AND (location::jsonb->>'city') = 'Brooklyn'
ORDER BY date ASC;
```

### Get User's Upcoming Bookings
```sql
SELECT b.*, d.*, u.name as host_name
FROM bookings b
JOIN dinners d ON b.dinnerId = d.id
JOIN users u ON d.hostId = u.id
WHERE b.userId = $1
  AND b.status IN ('PENDING', 'CONFIRMED')
  AND d.date > NOW()
ORDER BY d.date ASC;
```

### Get Host's Statistics
```sql
SELECT
  COUNT(DISTINCT d.id) as total_dinners,
  COUNT(DISTINCT CASE WHEN d.isActive = true THEN d.id END) as active_dinners,
  COUNT(b.id) as total_bookings,
  SUM(b.totalPrice) as total_revenue,
  AVG(d.rating) as average_rating,
  SUM(d.reviewCount) as total_reviews
FROM users u
LEFT JOIN dinners d ON u.id = d.hostId
LEFT JOIN bookings b ON d.id = b.dinnerId AND b.status = 'COMPLETED'
WHERE u.id = $1
GROUP BY u.id;
```

---

## Migration Notes

### From SQLite to PostgreSQL

1. **CUID Generation:** Use `gen_random_uuid()` or implement CUID in application
2. **JSON Fields:** PostgreSQL has native JSON support, use `jsonb` type
3. **DateTime:** Use `TIMESTAMP WITH TIME ZONE`
4. **Enums:** Create PostgreSQL ENUMs for BookingStatus
5. **Cascading Deletes:** Properly configured in foreign keys

### Initial Data Seeding

Recommended seed data:
- 2-3 test users (1 guest, 1 host, 1 admin)
- 5-10 sample dinners
- 3-5 sample bookings
- 5-10 sample reviews

---

## Backup and Maintenance

### Recommended Backup Strategy
- Daily full backups
- Point-in-time recovery enabled
- Backup retention: 30 days

### Maintenance Tasks
- Weekly VACUUM ANALYZE
- Monthly index rebuild
- Quarterly statistics update
- Monitor table bloat

---

## Security Considerations

1. **Passwords:** Always hashed using bcrypt (cost factor 10+)
2. **Tokens:** Use cryptographically secure random generation
3. **PII Data:** Encrypt email addresses at rest (optional)
4. **Audit Log:** Consider adding audit table for sensitive operations
5. **Row-Level Security:** Consider implementing for multi-tenancy

