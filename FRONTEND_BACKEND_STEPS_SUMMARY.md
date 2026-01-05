# Summary: Steps for Backend Developer

## Quick Overview

Your backend needs to implement image upload to DigitalOcean Spaces. Here are the steps:

---

## Step 1: Create DigitalOcean Space

1. Go to DigitalOcean Dashboard
2. Create a new Space (Object Storage)
3. Choose region (e.g., nyc3)
4. Name it (e.g., `dine-at-home-images`)
5. Make it **Public**
6. Get Access Keys from API → Spaces Keys
7. Save: Access Key, Secret Key, Endpoint, Space Name

---

## Step 2: Add Environment Variables

Add to your backend `.env` file:

```env
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your-access-key-here
DO_SPACES_SECRET=your-secret-key-here
DO_SPACES_NAME=dine-at-home-images
DO_SPACES_REGION=nyc3
DO_SPACES_CDN_URL=https://dine-at-home-images.nyc3.cdn.digitaloceanspaces.com
```

---

## Step 3: Install Packages

```bash
npm install aws-sdk multer
# OR for AWS SDK v3:
npm install @aws-sdk/client-s3 multer
```

---

## Step 4: Create Upload Endpoint

**Endpoint:** `POST /api/upload/images`

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with `images[]` field (array of files)
- Headers: Authorization: Bearer {token}

**Response:**
```json
{
  "success": true,
  "data": {
    "urls": [
      "https://dine-at-home-images.nyc3.cdn.digitaloceanspaces.com/dinners/123-abc.jpg",
      "https://dine-at-home-images.nyc3.cdn.digitaloceanspaces.com/dinners/124-def.jpg"
    ]
  }
}
```

**Full implementation details:** See `BACKEND_STEPS_DIGITALOCEAN_IMAGES.md`

---

## Step 5: Test the Endpoint

```bash
curl -X POST http://localhost:3001/api/upload/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images[]=@/path/to/image.jpg"
```

---

## Step 6: Verify

1. Files appear in DigitalOcean Spaces dashboard
2. URLs are accessible in browser
3. URLs work when stored in MongoDB

---

## Files to Reference

1. **`BACKEND_STEPS_DIGITALOCEAN_IMAGES.md`** - Complete step-by-step guide with code examples
2. **`BACKEND_REQUIREMENTS_DINNER.md`** - Full API specifications

---

## What Happens After Backend Implements This

1. Frontend uploads images → Gets URLs back
2. Frontend creates dinner → Sends URLs in request
3. Backend saves URLs to MongoDB
4. Images display correctly in dashboard! ✅

