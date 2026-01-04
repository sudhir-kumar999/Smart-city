# Backend API Documentation

## Overview
This is the Express.js backend for the Smart City Management System. It provides RESTful APIs for authentication, user management, and complaint management.

## Folder Structure

```
backend/
├── controllers/       # Business logic handlers
│   ├── auth.controller.js      # Authentication operations
│   └── complaint.controller.js # Complaint CRUD operations
│
├── middleware/        # Custom Express middleware
│   └── auth.middleware.js      # JWT verification, RBAC, 2FA checks
│
├── models/           # MongoDB Mongoose schemas
│   ├── User.model.js           # User schema with password hashing
│   ├── OTP.model.js            # OTP schema with auto-expiry
│   └── Complaint.model.js      # Complaint schema with relationships
│
├── routes/           # API route definitions
│   ├── auth.routes.js          # Auth endpoints
│   ├── complaint.routes.js    # Complaint endpoints
│   └── user.routes.js          # User profile endpoints
│
├── utils/            # Utility functions
│   ├── jwt.util.js             # JWT token generation/verification
│   ├── email.util.js           # Nodemailer email sending
│   └── generateToken.util.js   # Token/OTP generation
│
├── server.js         # Express app entry point
└── package.json       # Dependencies
```

## Key Features

### 1. Authentication System
- **Signup**: Creates user with hashed password, generates email verification token
- **Email Verification**: Token-based verification with 24-hour expiry
- **Login**: Validates credentials, generates OTP for 2FA
- **2FA**: OTP sent via email, 5-minute expiry, one-time use
- **Token Management**: Access token (15min) + Refresh token (7days) in HTTP-only cookies

### 2. Security Middleware
- `authenticate`: Verifies JWT access token from cookies
- `authorize(...roles)`: Checks if user has required role(s)
- `require2FA`: Ensures 2FA is verified before accessing protected routes

### 3. Complaint Management
- Citizens can create/view their own complaints
- Admin/Officer can view all complaints
- Status updates: pending → in-progress → resolved
- Role-based filtering and permissions

## API Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  // stack trace in development mode
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Database Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: Enum ['admin', 'citizen', 'officer'],
  isEmailVerified: Boolean,
  is2FAVerified: Boolean,
  timestamps: true
}
```

### Complaint Model
```javascript
{
  title: String (required),
  description: String (required),
  category: Enum ['infrastructure', 'sanitation', 'traffic', 'safety', 'utilities', 'other'],
  image: String (optional),
  location: {
    latitude: Number (required),
    longitude: Number (required),
    address: String
  },
  status: Enum ['pending', 'in-progress', 'resolved'],
  citizenId: ObjectId (ref: User),
  assignedOfficerId: ObjectId (ref: User, optional),
  resolutionNotes: String,
  timestamps: true
}
```

### OTP Model
```javascript
{
  userId: ObjectId (ref: User),
  otp: String (6 digits),
  expiresAt: Date (5 minutes),
  isUsed: Boolean,
  timestamps: true
}
// Auto-deletes expired OTPs via TTL index
```

## Running the Server

```bash
# Install dependencies
npm install

# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

## Error Handling

All errors are caught and handled by:
1. Try-catch blocks in controllers
2. Express error middleware
3. Mongoose validation errors
4. JWT verification errors

Errors return appropriate HTTP status codes and user-friendly messages.

