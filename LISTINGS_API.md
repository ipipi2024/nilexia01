# Listings API Documentation

## Overview

The Listings API allows verified Florida Tech students and staff to create, read, update, and delete marketplace listings for items they want to sell, donate, or rent.

## Authentication

All write operations (POST, PATCH, DELETE) require authentication via Better Auth session. The API uses session-based authentication with cookies.

## Data Model

### Listing Object

```typescript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  id: string,              // String representation of _id
  userId: ObjectId,        // Reference to user who created the listing
  title: string,           // 3-100 characters
  description: string,     // 10-1000 characters
  type: "sell" | "donate" | "rent",
  price: number | null,    // Required for sell/rent, null for donate
  images: string[],        // Array of image URLs (max 5)
  status: "available" | "unavailable",
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Create a Listing

**POST** `/api/listings`

Creates a new listing.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "MacBook Pro 2021",
  "description": "Excellent condition, barely used. Includes charger and case.",
  "type": "sell",
  "price": 1200,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Validation Rules:**
- `title`: Required, 3-100 characters
- `description`: Required, 10-1000 characters
- `type`: Required, must be "sell", "donate", or "rent"
- `price`:
  - Required if type is "sell" or "rent"
  - Must be >= 0
  - Must be null if type is "donate"
- `images`: Optional, max 5 URLs

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "title": "MacBook Pro 2021",
  "description": "Excellent condition, barely used. Includes charger and case.",
  "type": "sell",
  "price": 1200,
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "status": "available",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Not authenticated
- `500 Internal Server Error`: Server error

---

### 2. Get All Listings

**GET** `/api/listings`

Retrieves all available listings with optional filters.

**Authentication:** Not required

**Query Parameters:**
- `type` (optional): Filter by listing type ("sell", "donate", "rent")
- `limit` (optional): Number of results to return (default: 20, max: 100)
- `skip` (optional): Number of results to skip for pagination (default: 0)

**Examples:**
- `/api/listings` - Get first 20 available listings
- `/api/listings?type=sell` - Get listings for sale only
- `/api/listings?type=donate&limit=10` - Get first 10 donation listings
- `/api/listings?limit=20&skip=20` - Get next page (items 21-40)

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "title": "MacBook Pro 2021",
    "description": "Excellent condition, barely used. Includes charger and case.",
    "type": "sell",
    "price": 1200,
    "images": ["https://example.com/image1.jpg"],
    "status": "available",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `500 Internal Server Error`: Server error

---

### 3. Get Single Listing

**GET** `/api/listings/:id`

Retrieves a single listing by ID with populated user information.

**Authentication:** Not required

**Path Parameters:**
- `id`: The listing ID (MongoDB ObjectId)

**Example:**
- `/api/listings/507f1f77bcf86cd799439011`

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "title": "MacBook Pro 2021",
  "description": "Excellent condition, barely used. Includes charger and case.",
  "type": "sell",
  "price": 1200,
  "images": ["https://example.com/image1.jpg"],
  "status": "available",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "user": {
    "id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "email": "jdoe@fit.edu"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid listing ID format
- `404 Not Found`: Listing not found
- `500 Internal Server Error`: Server error

---

### 4. Update a Listing

**PATCH** `/api/listings/:id`

Updates an existing listing. Only the listing owner can update their listing.

**Authentication:** Required

**Path Parameters:**
- `id`: The listing ID (MongoDB ObjectId)

**Request Body (all fields optional):**
```json
{
  "title": "MacBook Pro 2021 - Price Reduced!",
  "description": "Excellent condition, barely used. Includes charger and case. Must sell!",
  "price": 1000,
  "images": ["https://example.com/image1.jpg", "https://example.com/image3.jpg"],
  "status": "available"
}
```

**Validation Rules:**
- `title` (optional): 3-100 characters
- `description` (optional): 10-1000 characters
- `price` (optional): >= 0 or null
- `images` (optional): Max 5 URLs
- `status` (optional): "available" or "unavailable"

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "title": "MacBook Pro 2021 - Price Reduced!",
  "description": "Excellent condition, barely used. Includes charger and case. Must sell!",
  "type": "sell",
  "price": 1000,
  "images": ["https://example.com/image1.jpg", "https://example.com/image3.jpg"],
  "status": "available",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ID format or validation failed
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User doesn't own the listing
- `404 Not Found`: Listing not found
- `500 Internal Server Error`: Server error

---

### 5. Delete a Listing

**DELETE** `/api/listings/:id`

Deletes a listing. Only the listing owner can delete their listing.

**Authentication:** Required

**Path Parameters:**
- `id`: The listing ID (MongoDB ObjectId)

**Example:**
- `DELETE /api/listings/507f1f77bcf86cd799439011`

**Response (204 No Content):**
No response body

**Error Responses:**
- `400 Bad Request`: Invalid listing ID format
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User doesn't own the listing
- `404 Not Found`: Listing not found
- `500 Internal Server Error`: Server error

---

## Image Upload

The API accepts image URLs in the `images` array. You have several options for handling image uploads:

### Option 1: UploadThing (Recommended for Next.js)

1. Install UploadThing:
```bash
npm install uploadthing @uploadthing/react
```

2. Follow the [UploadThing Next.js guide](https://docs.uploadthing.com/getting-started/appdir)

3. Upload images on the client side and pass the returned URLs to the listings API

### Option 2: Cloudinary

1. Install Cloudinary:
```bash
npm install cloudinary
```

2. Create an upload endpoint or use Cloudinary's client-side upload widget

3. Pass the returned image URLs to the listings API

### Option 3: Vercel Blob

1. Install Vercel Blob:
```bash
npm install @vercel/blob
```

2. Follow the [Vercel Blob guide](https://vercel.com/docs/storage/vercel-blob)

3. Upload images and pass the URLs to the listings API

### Option 4: Direct Upload (Custom Solution)

You can also create a custom `/api/upload` endpoint that handles multipart form data and stores images to your preferred storage solution (AWS S3, Google Cloud Storage, etc.).

---

## Security Features

1. **Authentication**: All write operations require authentication
2. **Authorization**: Users can only update/delete their own listings
3. **Input Sanitization**: All text inputs are sanitized to prevent XSS attacks
4. **Validation**: Comprehensive validation on all inputs
5. **Ownership Verification**: Database queries verify listing ownership before modifications

---

## Database Indexes

The following indexes are automatically created for optimal query performance:

- `userId` (ascending)
- `status` (ascending)
- `createdAt` (descending) - for sorting newest first
- `type` (ascending)
- `status + createdAt` (compound index)
- `type + status + createdAt` (compound index)

---

## Example Client-Side Usage

### Using Fetch API

```javascript
// Create a listing
const createListing = async () => {
  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for session cookies
    body: JSON.stringify({
      title: 'Used Textbook',
      description: 'Engineering Mathematics textbook in good condition',
      type: 'sell',
      price: 50,
      images: []
    })
  });

  if (response.ok) {
    const listing = await response.json();
    console.log('Created:', listing);
  } else {
    const error = await response.json();
    console.error('Error:', error);
  }
};

// Get all listings
const getListings = async () => {
  const response = await fetch('/api/listings?type=sell&limit=20');
  const listings = await response.json();
  console.log('Listings:', listings);
};

// Update a listing
const updateListing = async (id) => {
  const response = await fetch(`/api/listings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      status: 'unavailable'
    })
  });

  if (response.ok) {
    const updated = await response.json();
    console.log('Updated:', updated);
  }
};

// Delete a listing
const deleteListing = async (id) => {
  const response = await fetch(`/api/listings/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (response.status === 204) {
    console.log('Deleted successfully');
  }
};
```

---

## Common Error Formats

### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title must be at least 3 characters long"
    },
    {
      "field": "price",
      "message": "Price is required for 'sell' type"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "error": "Unauthorized. Please sign in to create a listing."
}
```

### Authorization Error (403)
```json
{
  "error": "Forbidden. You can only update your own listings."
}
```

### Not Found Error (404)
```json
{
  "error": "Listing not found"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error. Please try again later."
}
```
