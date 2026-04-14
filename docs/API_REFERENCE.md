# Blood Suite - API Reference

## Overview

The Blood Suite API provides RESTful endpoints for managing blood bank operations including user authentication, donor management, hospital operations, blood inventory, and notifications.

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {
      // Additional error details
    }
  }
}
```

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "donor|hospital|admin",
  "fullName": "Full Name",
  "phone": "1234567890",
  "address": "123 Main St, City, Country"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "donor",
      "fullName": "Full Name",
      "phone": "1234567890",
      "createdAt": "2026-04-13T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Validation Errors (422):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 6 characters"
    }
  }
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "donor",
      "fullName": "Full Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### POST /auth/refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <current_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

---

## Donor Management Endpoints

### GET /donors
Get all donors (Admin only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `bloodType` (string): Filter by blood type
- `search` (string): Search by name or email

**Response (200):**
```json
{
  "success": true,
  "data": {
    "donors": [
      {
        "id": 1,
        "fullName": "John Doe",
        "email": "john@example.com",
        "bloodType": "O+",
        "phone": "1234567890",
        "isEligible": true,
        "lastDonationDate": "2026-03-15",
        "createdAt": "2026-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### GET /donors/:id
Get donor by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "donor": {
      "id": 1,
      "userId": 2,
      "fullName": "John Doe",
      "email": "john@example.com",
      "bloodType": "O+",
      "phone": "1234567890",
      "address": "123 Main St, City, Country",
      "dateOfBirth": "1990-01-01",
      "isEligible": true,
      "lastDonationDate": "2026-03-15",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  }
}
```

### PUT /donors/:id
Update donor profile.

**Request Body:**
```json
{
  "fullName": "John Updated",
  "phone": "0987654321",
  "address": "456 New St, City, Country"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "donor": {
      "id": 1,
      "fullName": "John Updated",
      "phone": "0987654321",
      "address": "456 New St, City, Country",
      "updatedAt": "2026-04-13T10:00:00.000Z"
    }
  },
  "message": "Donor profile updated successfully"
}
```

### POST /donors
Register new donor.

**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "bloodType": "A+",
  "phone": "1234567890",
  "address": "789 Oak St, City, Country",
  "dateOfBirth": "1985-05-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "donor": {
      "id": 2,
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "bloodType": "A+",
      "isEligible": true,
      "createdAt": "2026-04-13T10:00:00.000Z"
    }
  },
  "message": "Donor registered successfully"
}
```

---

## Hospital Management Endpoints

### GET /hospitals
Get all hospitals.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `verified` (boolean): Filter by verification status
- `search` (string): Search by name

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hospitals": [
      {
        "id": 1,
        "name": "General Hospital",
        "email": "info@generalhospital.com",
        "licenseNumber": "GH123456",
        "phone": "1234567890",
        "address": "123 Hospital Ave, City, Country",
        "isVerified": true,
        "createdAt": "2026-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### GET /hospitals/:id
Get hospital by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hospital": {
      "id": 1,
      "name": "General Hospital",
      "email": "info@generalhospital.com",
      "licenseNumber": "GH123456",
      "phone": "1234567890",
      "address": "123 Hospital Ave, City, Country",
      "isVerified": true,
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  }
}
```

### PUT /hospitals/:id
Update hospital profile.

**Request Body:**
```json
{
  "name": "Updated Hospital Name",
  "phone": "0987654321",
  "address": "456 New Hospital St, City, Country"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hospital": {
      "id": 1,
      "name": "Updated Hospital Name",
      "phone": "0987654321",
      "address": "456 New Hospital St, City, Country",
      "updatedAt": "2026-04-13T10:00:00.000Z"
    }
  },
  "message": "Hospital profile updated successfully"
}
```

---

## Blood Inventory Endpoints

### GET /inventory
Get blood inventory.

**Query Parameters:**
- `hospitalId` (number): Filter by hospital
- `bloodType` (string): Filter by blood type
- `status` (string): Filter by status (available, reserved, expired)
- `page` (number): Page number
- `limit` (number): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "inventory": [
      {
        "id": 1,
        "hospitalId": 1,
        "donorId": 1,
        "bloodType": "O+",
        "quantityMl": 450,
        "collectionDate": "2026-04-01",
        "expiryDate": "2026-07-01",
        "status": "available",
        "createdAt": "2026-04-01T10:00:00.000Z",
        "donor": {
          "fullName": "John Doe",
          "bloodType": "O+"
        },
        "hospital": {
          "name": "General Hospital"
        }
      }
    ],
    "summary": {
      "totalUnits": 150,
      "availableUnits": 120,
      "expiredUnits": 5,
      "reservedUnits": 25
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### POST /inventory
Add new blood unit to inventory.

**Request Body:**
```json
{
  "hospitalId": 1,
  "donorId": 1,
  "bloodType": "O+",
  "quantityMl": 450,
  "collectionDate": "2026-04-13",
  "expiryDate": "2026-07-13"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "inventory": {
      "id": 2,
      "hospitalId": 1,
      "donorId": 1,
      "bloodType": "O+",
      "quantityMl": 450,
      "collectionDate": "2026-04-13",
      "expiryDate": "2026-07-13",
      "status": "available",
      "createdAt": "2026-04-13T10:00:00.000Z"
    }
  },
  "message": "Blood unit added to inventory successfully"
}
```

### PUT /inventory/:id
Update blood unit status.

**Request Body:**
```json
{
  "status": "reserved",
  "notes": "Reserved for emergency surgery"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "inventory": {
      "id": 1,
      "status": "reserved",
      "notes": "Reserved for emergency surgery",
      "updatedAt": "2026-04-13T10:00:00.000Z"
    }
  },
  "message": "Blood unit updated successfully"
}
```

### DELETE /inventory/:id
Remove blood unit from inventory.

**Response (200):**
```json
{
  "success": true,
  "message": "Blood unit removed from inventory successfully"
}
```

---

## Blood Request Endpoints

### GET /requests
Get blood requests.

**Query Parameters:**
- `hospitalId` (number): Filter by hospital
- `status` (string): Filter by status (pending, approved, fulfilled, cancelled)
- `urgency` (string): Filter by urgency (low, medium, high, critical)
- `bloodType` (string): Filter by blood type
- `page` (number): Page number
- `limit` (number): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "hospitalId": 1,
        "bloodType": "O+",
        "quantityMl": 500,
        "urgency": "high",
        "status": "pending",
        "requestDate": "2026-04-13T10:00:00.000Z",
        "fulfillmentDate": null,
        "notes": "Emergency surgery required",
        "hospital": {
          "name": "General Hospital",
          "phone": "1234567890"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### POST /requests
Create new blood request.

**Request Body:**
```json
{
  "hospitalId": 1,
  "bloodType": "O+",
  "quantityMl": 500,
  "urgency": "high",
  "notes": "Emergency surgery required"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 2,
      "hospitalId": 1,
      "bloodType": "O+",
      "quantityMl": 500,
      "urgency": "high",
      "status": "pending",
      "requestDate": "2026-04-13T10:00:00.000Z",
      "notes": "Emergency surgery required"
    }
  },
  "message": "Blood request created successfully"
}
```

### PUT /requests/:id
Update blood request status.

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Request approved, blood units allocated"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 1,
      "status": "approved",
      "notes": "Request approved, blood units allocated",
      "updatedAt": "2026-04-13T10:00:00.000Z"
    }
  },
  "message": "Blood request updated successfully"
}
```

### GET /requests/:id
Get blood request details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 1,
      "hospitalId": 1,
      "bloodType": "O+",
      "quantityMl": 500,
      "urgency": "high",
      "status": "pending",
      "requestDate": "2026-04-13T10:00:00.000Z",
      "fulfillmentDate": null,
      "notes": "Emergency surgery required",
      "hospital": {
        "name": "General Hospital",
        "phone": "1234567890",
        "address": "123 Hospital Ave, City, Country"
      },
      "fulfillments": []
    }
  }
}
```

---

## Notification Endpoints

### GET /notifications
Get user notifications.

**Query Parameters:**
- `isRead` (boolean): Filter by read status
- `type` (string): Filter by notification type
- `page` (number): Page number
- `limit` (number): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "blood_request",
        "title": "New Blood Request",
        "message": "General Hospital has requested 500ml of O+ blood",
        "isRead": false,
        "createdAt": "2026-04-13T10:00:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

### PUT /notifications/:id/read
Mark notification as read.

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### PUT /notifications/read-all
Mark all notifications as read.

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### DELETE /notifications/:id
Delete notification.

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Analytics Endpoints

### GET /analytics/dashboard
Get dashboard analytics data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDonors": 1250,
      "totalHospitals": 45,
      "totalBloodUnits": 2500,
      "pendingRequests": 12,
      "fulfilledRequests": 234
    },
    "bloodTypeDistribution": {
      "O+": 450,
      "O-": 120,
      "A+": 380,
      "A-": 95,
      "B+": 320,
      "B-": 85,
      "AB+": 180,
      "AB-": 70
    },
    "monthlyTrends": [
      {
        "month": "2026-01",
        "donations": 120,
        "requests": 85,
        "fulfillments": 78
      }
    ],
    "hospitalPerformance": [
      {
        "hospitalName": "General Hospital",
        "totalRequests": 45,
        "fulfillmentRate": 0.89
      }
    ]
  }
}
```

### GET /analytics/reports
Generate detailed reports.

**Query Parameters:**
- `type` (string): Report type (donor, inventory, requests, hospital)
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `format` (string): Output format (json, csv)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "report": {
      "type": "donor",
      "period": "2026-01-01 to 2026-04-13",
      "data": [
        {
          "date": "2026-04-13",
          "newDonors": 5,
          "totalDonations": 8,
          "bloodTypeDistribution": {
            "O+": 3,
            "A+": 2,
            "B+": 2,
            "AB+": 1
          }
        }
      ]
    }
  }
}
```

---

## Error Codes

| Error Code | Description | HTTP Status |
|------------|-------------|------------|
| VALIDATION_ERROR | Input validation failed | 422 |
| INVALID_CREDENTIALS | Invalid email or password | 401 |
| UNAUTHORIZED | Authentication required | 401 |
| FORBIDDEN | Insufficient permissions | 403 |
| NOT_FOUND | Resource not found | 404 |
| CONFLICT | Resource already exists | 409 |
| INSUFFICIENT_INVENTORY | Not enough blood units available | 400 |
| DONOR_NOT_ELIGIBLE | Donor is not eligible for donation | 400 |
| EXPIRED_BLOOD | Blood unit has expired | 400 |
| RATE_LIMIT_EXCEEDED | Too many requests | 429 |
| DATABASE_ERROR | Database operation failed | 500 |
| INTERNAL_ERROR | Internal server error | 500 |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Analytics endpoints**: 20 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1649870400
```

---

## SDK and Client Libraries

### JavaScript/Node.js
```bash
npm install bloodsuite-sdk
```

```javascript
const BloodSuite = require('bloodsuite-sdk');

const client = new BloodSuite({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// Get all donors
const donors = await client.donors.list();

// Create blood request
const request = await client.requests.create({
  hospitalId: 1,
  bloodType: 'O+',
  quantityMl: 500,
  urgency: 'high'
});
```

---

## Webhooks

### Configure Webhooks
Webhooks allow your application to receive real-time notifications when events occur.

**Supported Events:**
- `donor.registered` - New donor registration
- `blood_request.created` - New blood request
- `blood_request.fulfilled` - Request fulfilled
- `inventory.low_stock` - Low blood inventory alert
- `inventory.expired` - Blood unit expired

**Webhook Payload Example:**
```json
{
  "event": "blood_request.created",
  "data": {
    "requestId": 123,
    "hospitalId": 1,
    "bloodType": "O+",
    "quantityMl": 500,
    "urgency": "high",
    "timestamp": "2026-04-13T10:00:00.000Z"
  }
}
```

---

## Testing

### API Testing with Postman
Import the Postman collection from `docs/postman-collection.json` to test all endpoints.

### Test Credentials
- **Admin**: admin@bloodsuite.org / Admin123!
- **Hospital**: hospital@bloodsuite.org / Hospital123!
- **Donor**: donor@bloodsuite.org / Donor123!

---

## Support

For API support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation for common issues

---

*Last Updated: April 2026*
*Version: 1.0.0*
