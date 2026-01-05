# Backend Steps: Implement Image Upload with DigitalOcean Spaces

## Overview
Backend needs to implement image upload endpoint that uploads images to DigitalOcean Spaces and returns permanent URLs.

---

## Step-by-Step Instructions

### Step 1: Install Required Packages

```bash
npm install aws-sdk
# OR (newer AWS SDK v3)
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

**Note:** DigitalOcean Spaces is S3-compatible, so you can use AWS SDK.

---

### Step 2: Set Up DigitalOcean Spaces

1. **Create a Space in DigitalOcean:**
   - Go to DigitalOcean Dashboard
   - Create a new Space
   - Choose a region (e.g., nyc3)
   - Name it (e.g., `dine-at-home-images`)
   - Make it **Public** (or use CDN)

2. **Get Access Keys:**
   - Go to API → Spaces Keys
   - Generate new key
   - Save:
     - Access Key
     - Secret Key
     - Endpoint (e.g., `nyc3.digitaloceanspaces.com`)
     - Space name

3. **Add to Environment Variables:**
```env
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your-access-key
DO_SPACES_SECRET=your-secret-key
DO_SPACES_NAME=dine-at-home-images
DO_SPACES_REGION=nyc3
DO_SPACES_CDN_URL=https://dine-at-home-images.nyc3.cdn.digitaloceanspaces.com
# OR if not using CDN:
DO_SPACES_CDN_URL=https://dine-at-home-images.nyc3.digitaloceanspaces.com
```

---

### Step 3: Install File Upload Library (if using Express)

```bash
npm install multer
npm install --save-dev @types/multer  # if TypeScript
```

---

### Step 4: Create Upload Endpoint

**Endpoint:** `POST /api/upload/images`

**File Structure:**
```
backend/
  src/
    routes/
      upload.js (or upload.ts)
    middleware/
      upload.js
    config/
      spaces.js
```

**Example Implementation (Node.js/Express with AWS SDK v2):**

```javascript
// config/spaces.js
const AWS = require('aws-sdk')

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT)
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: process.env.DO_SPACES_REGION
})

module.exports = { s3 }
```

```javascript
// middleware/upload.js
const multer = require('multer')
const multerS3 = require('multer-s3')  // npm install multer-s3
const { s3 } = require('../config/spaces')

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.DO_SPACES_NAME,
    acl: 'public-read',  // Make files public
    key: function (req, file, cb) {
      // Generate unique filename
      const uniqueName = `dinners/${Date.now()}-${Math.random().toString(36).substring(7)}${file.originalname.match(/\.[0-9a-z]+$/i)[0]}`
      cb(null, uniqueName)
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

module.exports = upload
```

```javascript
// routes/upload.js
const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { authenticateToken } = require('../middleware/auth')

router.post('/images', authenticateToken, upload.array('images[]', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided',
        code: 'NO_IMAGES'
      })
    }

    // Build URLs
    const baseUrl = process.env.DO_SPACES_CDN_URL || `https://${process.env.DO_SPACES_NAME}.${process.env.DO_SPACES_ENDPOINT}`
    const urls = req.files.map(file => `${baseUrl}/${file.key}`)

    res.json({
      success: true,
      data: {
        urls: urls
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload images',
      code: 'UPLOAD_ERROR'
    })
  }
})

module.exports = router
```

**Alternative: Manual Upload (AWS SDK v3):**

```javascript
// routes/upload.js (using AWS SDK v3)
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const { authenticateToken } = require('../middleware/auth')

const s3Client = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET
  }
})

const upload = multer({
  storage: multer.memoryStorage(),  // Store in memory temporarily
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files allowed'), false)
    }
  }
})

router.post('/images', authenticateToken, upload.array('images[]', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      })
    }

    const baseUrl = process.env.DO_SPACES_CDN_URL || `https://${process.env.DO_SPACES_NAME}.${process.env.DO_SPACES_ENDPOINT}`
    const urls = []

    // Upload each file to Spaces
    for (const file of req.files) {
      const filename = `dinners/${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`
      
      const command = new PutObjectCommand({
        Bucket: process.env.DO_SPACES_NAME,
        Key: filename,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype
      })

      await s3Client.send(command)
      urls.push(`${baseUrl}/${filename}`)
    }

    res.json({
      success: true,
      data: { urls }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    })
  }
})
```

---

### Step 5: Register Route

**In your main server file (e.g., `app.js` or `server.js`):**

```javascript
const uploadRoutes = require('./routes/upload')
app.use('/api/upload', uploadRoutes)
```

---

### Step 6: Test the Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/upload/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images[]=@/path/to/image1.jpg" \
  -F "images[]=@/path/to/image2.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "urls": [
      "https://dine-at-home-images.nyc3.cdn.digitaloceanspaces.com/dinners/1234567890-abc123.jpg",
      "https://dine-at-home-images.nyc3.cdn.digitaloceanspaces.com/dinners/1234567891-def456.jpg"
    ]
  }
}
```

---

### Step 7: Update Create Dinner Endpoint

**Make sure your `POST /api/dinners` endpoint:**
- Accepts `images` array of URLs (strings)
- Stores URLs in MongoDB (as JSON array)
- Does NOT try to upload files (files are already uploaded)

**Example:**
```javascript
// In your create dinner endpoint
const { images, title, description, ... } = req.body

// images should be an array of URLs:
// ["https://dine-at-home-images.nyc3.cdn.digitaloceanspaces.com/dinners/123.jpg", ...]

// Store in MongoDB
const dinner = await Dinner.create({
  images: JSON.stringify(images),  // Store as JSON string
  // OR if using Mongoose/Object model:
  images: images,  // Store as array
  // ... other fields
})
```

---

### Step 8: Update Get Dinners Endpoint

**Make sure your `GET /api/host/{hostId}/dinners` endpoint:**
- Returns images as array of URLs
- If stored as JSON string, parse it
- If stored as array, return as-is

**Example:**
```javascript
const dinners = await Dinner.find({ hostId })

const formattedDinners = dinners.map(dinner => {
  let images = []
  try {
    // If stored as JSON string
    images = typeof dinner.images === 'string' 
      ? JSON.parse(dinner.images) 
      : dinner.images || []
  } catch (e) {
    images = []
  }

  return {
    ...dinner.toObject(),
    images: images  // Array of URLs
  }
})
```

---

## Testing Checklist

- [ ] Endpoint accepts multiple image files
- [ ] Files are uploaded to DigitalOcean Spaces
- [ ] Permanent URLs are returned
- [ ] URLs are accessible (test in browser)
- [ ] Invalid file types are rejected
- [ ] Files over 5MB are rejected
- [ ] Authentication is required
- [ ] URLs are stored correctly in MongoDB
- [ ] URLs are returned correctly when fetching dinners

---

## Important Notes

1. **File Names:** Use unique filenames to avoid conflicts (timestamp + random)
2. **Public Access:** Make sure files are set to `public-read` ACL
3. **CDN URL:** Use CDN URL for faster delivery (if enabled in DigitalOcean)
4. **Error Handling:** Handle upload errors gracefully
5. **File Validation:** Always validate file type and size
6. **Security:** Only authenticated users can upload

---

## Troubleshooting

**Issue: "Access Denied"**
- Check Spaces keys are correct
- Verify Space name matches
- Check file ACL is set to `public-read`

**Issue: Files not accessible**
- Check Space is set to Public
- Verify CDN URL is correct
- Check file path/key is correct

**Issue: "File too large"**
- Check multer fileSize limit
- Verify file is actually under 5MB

---

## Next Steps

1. Implement the upload endpoint
2. Test with Postman/curl
3. Verify files appear in DigitalOcean Spaces dashboard
4. Test URLs in browser
5. Update frontend to use the endpoint
6. Test complete flow: upload → create dinner → fetch → display

