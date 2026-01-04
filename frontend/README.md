# Frontend Documentation

## Overview
React-based frontend for the Smart City Management System with protected routes, authentication flow, and complaint management interface.

## Folder Structure

```
frontend/src/
├── components/        # Reusable React components
│   └── ProtectedRoute.js    # Route protection wrapper
│
├── context/          # React Context API
│   └── AuthContext.js       # Global authentication state
│
├── pages/           # Page components
│   ├── Signup.js            # User registration
│   ├── Login.js             # User login
│   ├── OTPVerification.js   # 2FA OTP input
│   ├── Dashboard.js         # Main dashboard
│   ├── ComplaintRegister.js # Create complaint form
│   └── ComplaintList.js     # View/filter complaints
│
├── utils/           # Utility functions
│   └── api.js              # Axios instance with interceptors
│
├── App.js           # Main app component with routing
├── App.css          # Global styles
├── index.js         # React entry point
└── index.css        # Base styles
```

## Key Features

### 1. Authentication Flow
- **Signup Page**: User registration with role selection
- **Login Page**: Credential validation, redirects to OTP
- **OTP Verification**: 6-digit input with auto-focus
- **Auto Token Refresh**: Interceptor handles token refresh

### 2. Protected Routes
- `ProtectedRoute` component wraps protected pages
- Checks authentication status
- Redirects to login if not authenticated
- Shows loading spinner during auth check

### 3. API Integration
- Axios instance with base URL configuration
- Automatic cookie inclusion (`withCredentials: true`)
- Request interceptor for token attachment
- Response interceptor for token refresh on 401

### 4. State Management
- `AuthContext` provides global auth state
- User data, authentication status
- Login, signup, logout, OTP verification functions

## Pages

### Signup (`/signup`)
- Form: Name, Email, Password, Confirm Password, Role
- Validation: Password match, minimum length
- Success: Redirects to login after signup

### Login (`/login`)
- Form: Email, Password
- On success: Stores email, redirects to OTP verification
- Error handling: Displays error messages

### OTP Verification (`/verify-otp`)
- 6 separate input fields
- Auto-focus next field on input
- Backspace navigation
- Validates and submits OTP

### Dashboard (`/dashboard`)
- Welcome message with user info
- Quick links to complaint features
- Logout button

### Complaint Register (`/complaints/register`)
- Form: Title, Description, Category, Location, Image
- GPS location button
- Image upload (base64 conversion)
- Validation and submission

### Complaint List (`/complaints`)
- Displays all complaints (filtered by role)
- Status filters (Admin/Officer only)
- Category filters
- Status update (Admin/Officer only)
- Color-coded status badges

## API Client (`utils/api.js`)

### Features
- Base URL configuration
- Cookie inclusion for authentication
- Automatic token refresh on 401
- Error handling

### Usage
```javascript
import api from '../utils/api';

// GET request
const response = await api.get('/complaints');

// POST request
const response = await api.post('/auth/login', { email, password });
```

## Authentication Context

### Usage
```javascript
import { useAuth } from '../context/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

### Available Methods
- `login(email, password)` - User login
- `signup(userData)` - User registration
- `verifyOTP(email, otp)` - OTP verification
- `logout()` - User logout
- `checkAuth()` - Verify current auth status

## Styling

- Global styles in `App.css`
- Component-specific styles inline
- Responsive design with CSS Grid/Flexbox
- Modern UI with shadows and rounded corners

## Running the Frontend

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Environment Variables

Create `.env` file in frontend root:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Geolocation API for location features

## Security Considerations

1. **Tokens**: Stored in HTTP-only cookies (backend handles)
2. **Credentials**: Always included in API requests
3. **Protected Routes**: Client-side protection (backend also validates)
4. **XSS Protection**: React escapes content by default

