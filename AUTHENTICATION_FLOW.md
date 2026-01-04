# Authentication Flow Explanation

This document explains the complete authentication flow in the Smart City Management System.

## 🔐 Complete Authentication Flow

### 1. User Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. POST /api/auth/signup
     │    { name, email, password, role }
     ▼
┌─────────────────┐
│  Backend        │
│  - Validate     │
│  - Hash Password│
│  - Generate     │
│    Token        │
└────┬────────────┘
     │
     │ 2. Create User in DB
     │    - isEmailVerified: false
     │    - emailVerificationToken: <token>
     │    - emailVerificationExpiry: <24h>
     ▼
┌─────────────────┐
│  Send Email     │
│  (Nodemailer)   │
└────┬────────────┘
     │
     │ 3. Email with verification link
     ▼
┌─────────┐
│  User   │
│  Clicks │
│  Link   │
└────┬────┘
     │
     │ 4. GET /api/auth/verify-email?token=xxx
     ▼
┌─────────────────┐
│  Backend        │
│  - Verify Token │
│  - Check Expiry │
│  - Update User  │
└────┬────────────┘
     │
     │ 5. isEmailVerified: true
     ▼
┌─────────┐
│ Success │
└─────────┘
```

### 2. Login & 2FA Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. POST /api/auth/login
     │    { email, password }
     ▼
┌─────────────────┐
│  Backend        │
│  - Find User    │
│  - Verify       │
│    Password     │
│  - Check Email  │
│    Verified     │
└────┬────────────┘
     │
     │ 2. Generate OTP (6 digits)
     │    Save to DB with 5min expiry
     │
     │ 3. Send OTP via Email
     │
     │ 4. Generate Refresh Token
     │    Set in HTTP-only cookie
     │
     │ 5. Reset is2FAVerified: false
     ▼
┌─────────────────┐
│  Response       │
│  { requires2FA: │
│    true }       │
└────┬────────────┘
     │
     │ 6. Redirect to /verify-otp
     ▼
┌─────────┐
│  User   │
│  Enters │
│  OTP    │
└────┬────┘
     │
     │ 7. POST /api/auth/verify-otp
     │    { email, otp }
     ▼
┌─────────────────┐
│  Backend        │
│  - Find OTP     │
│  - Check Expiry │
│  - Check Used   │
│  - Mark Used    │
└────┬────────────┘
     │
     │ 8. Update User
     │    is2FAVerified: true
     │
     │ 9. Generate Access Token
     │    Set in HTTP-only cookie
     ▼
┌─────────────────┐
│  Response       │
│  { user,        │
│    accessToken }│
└────┬────────────┘
     │
     │ 10. Redirect to /dashboard
     ▼
┌─────────┐
│Dashboard│
└─────────┘
```

### 3. Token Refresh Flow

```
┌─────────┐
│  Client │
└────┬────┘
     │
     │ 1. API Request with expired Access Token
     ▼
┌─────────────────┐
│  Backend        │
│  - Verify Token │
│  - Token Expired│
└────┬────────────┘
     │
     │ 2. Return 401 Unauthorized
     ▼
┌─────────────────┐
│  Axios          │
│  Interceptor    │
│  (Frontend)     │
└────┬────────────┘
     │
     │ 3. POST /api/auth/refresh-token
     │    (Uses refreshToken from cookie)
     ▼
┌─────────────────┐
│  Backend        │
│  - Verify       │
│    Refresh Token│
│  - Generate New │
│    Access Token │
└────┬────────────┘
     │
     │ 4. Set new Access Token in cookie
     │
     │ 5. Retry Original Request
     ▼
┌─────────┐
│ Success │
└─────────┘
```

### 4. Protected Route Access Flow

```
┌─────────┐
│  Client │
│  Request│
└────┬────┘
     │
     │ 1. GET /api/complaints
     │    (Access Token in cookie)
     ▼
┌─────────────────┐
│  authenticate   │
│  Middleware     │
│  - Read Cookie  │
│  - Verify Token │
│  - Find User    │
│  - Attach to req│
└────┬────────────┘
     │
     │ 2. req.user = <User Object>
     ▼
┌─────────────────┐
│  require2FA     │
│  Middleware     │
│  - Check        │
│    is2FAVerified│
└────┬────────────┘
     │
     │ 3. If not verified → 403
     │    If verified → Continue
     ▼
┌─────────────────┐
│  authorize      │
│  Middleware     │
│  (if needed)    │
│  - Check Role   │
└────┬────────────┘
     │
     │ 4. If authorized → Controller
     │    If not → 403
     ▼
┌─────────┐
│ Success │
└─────────┘
```

## 🔑 Token Storage Strategy

### Why HTTP-only Cookies?

1. **XSS Protection**: JavaScript cannot access HTTP-only cookies
2. **Automatic Inclusion**: Cookies sent automatically with requests
3. **Secure by Default**: Can set `secure` flag for HTTPS

### Token Types

1. **Access Token**
   - Short-lived (15 minutes)
   - Used for API authentication
   - Stored in HTTP-only cookie
   - Auto-refreshed when expired

2. **Refresh Token**
   - Long-lived (7 days)
   - Used to get new access tokens
   - Stored in HTTP-only cookie
   - Rotated on each refresh

## 🛡️ Security Layers

### Layer 1: Email Verification
- Prevents fake email registrations
- Token-based verification
- 24-hour expiry

### Layer 2: Password Security
- Bcrypt hashing (12 rounds)
- Never stored in plain text
- Not returned in API responses

### Layer 3: JWT Tokens
- Signed with secret key
- Short expiry for access tokens
- Refresh token rotation

### Layer 4: 2FA (OTP)
- Additional verification step
- Time-limited (5 minutes)
- One-time use
- Required for protected routes

### Layer 5: Role-Based Access
- Middleware checks user role
- Route-level protection
- Data filtering by role

## 📝 Important Notes

1. **OTP Expiry**: OTPs expire after 5 minutes and are auto-deleted from DB
2. **Token Refresh**: Happens automatically via axios interceptor
3. **Logout**: Clears both cookies and resets 2FA status
4. **Session Management**: Each login requires new OTP verification
5. **Cookie Security**: In production, use `secure: true` and `sameSite: 'strict'`

## 🔄 State Management

### Frontend State
- `AuthContext` manages global auth state
- `user` object contains current user data
- `isAuthenticated` boolean flag
- Auto-checks auth on app load

### Backend State
- User document in MongoDB
- `isEmailVerified` flag
- `is2FAVerified` flag (resets on logout)
- OTP documents (auto-expire)

## 🚨 Error Handling

### Common Errors

1. **401 Unauthorized**
   - Invalid/expired access token
   - Auto-refreshes if refresh token valid

2. **403 Forbidden**
   - 2FA not verified
   - Insufficient role permissions

3. **400 Bad Request**
   - Invalid OTP
   - Missing required fields
   - Validation errors

4. **404 Not Found**
   - User not found
   - Complaint not found

All errors return consistent JSON format with appropriate HTTP status codes.

