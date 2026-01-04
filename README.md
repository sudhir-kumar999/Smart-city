# Smart City Management System

A comprehensive full-stack MERN application for managing city complaints with advanced authentication, role-based access control, and two-factor authentication.

## 🚀 Features

### Authentication & Security
- ✅ User signup with email verification
- ✅ Secure password hashing using bcrypt
- ✅ JWT-based authentication (Access Token + Refresh Token)
- ✅ HTTP-only cookies for secure token storage
- ✅ Email verification via token link
- ✅ Role-Based Access Control (RBAC): Admin, Citizen, Officer

### Two-Factor Authentication (2FA)
- ✅ OTP generation and email delivery
- ✅ 5-minute OTP expiry
- ✅ OTP verification before dashboard access

### Complaint Management
- ✅ Citizens can register complaints with:
  - Title, description, category
  - Optional image upload
  - Location (GPS coordinates + address)
- ✅ View all complaints (filtered by role)
- ✅ Admin/Officer can update complaint status
- ✅ Status tracking: pending → in-progress → resolved

### Technical Features
- ✅ Clean, scalable backend architecture
- ✅ Protected routes with middleware
- ✅ Automatic token refresh
- ✅ Professional API response format
- ✅ Proper HTTP status codes
- ✅ Error handling throughout

## 📁 Project Structure

```
smart-city-management/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.js
│   │   └── complaint.controller.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.middleware.js
│   ├── models/              # MongoDB schemas
│   │   ├── User.model.js
│   │   ├── OTP.model.js
│   │   └── Complaint.model.js
│   ├── routes/              # API routes
│   │   ├── auth.routes.js
│   │   ├── complaint.routes.js
│   │   └── user.routes.js
│   ├── utils/               # Utility functions
│   │   ├── jwt.util.js
│   │   ├── email.util.js
│   │   └── generateToken.util.js
│   ├── server.js            # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   └── ProtectedRoute.js
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.js
│   │   ├── pages/          # Page components
│   │   │   ├── Signup.js
│   │   │   ├── Login.js
│   │   │   ├── OTPVerification.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ComplaintRegister.js
│   │   │   └── ComplaintList.js
│   │   ├── utils/          # Utility functions
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure `.env` file with your settings:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-city-db
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@smartcity.com
FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, for custom API URL):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🔐 Authentication Flow

### 1. User Registration
```
User Signup → Email Verification Token Generated → 
Verification Email Sent → User Clicks Link → Email Verified
```

### 2. Login Flow
```
User Login → Credentials Validated → 
OTP Generated & Sent via Email → 
User Enters OTP → OTP Verified → 
Access Token Set in HTTP-only Cookie → Dashboard Access
```

### 3. Token Management
- **Access Token**: Short-lived (15 minutes), stored in HTTP-only cookie
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie
- **Auto Refresh**: Frontend automatically refreshes access token when expired

### 4. Protected Routes
- All complaint routes require:
  1. Valid access token (authenticate middleware)
  2. 2FA verification (require2FA middleware)
  3. Appropriate role (authorize middleware for admin/officer actions)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify-email?token=xxx` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification (2FA)
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Complaints
- `POST /api/complaints` - Create complaint (Citizen)
- `GET /api/complaints` - Get all complaints (filtered by role)
- `GET /api/complaints/:id` - Get single complaint
- `PATCH /api/complaints/:id/status` - Update status (Admin/Officer)
- `DELETE /api/complaints/:id` - Delete complaint

## 👥 User Roles

### Citizen
- Register complaints
- View own complaints
- Update/delete own complaints

### Officer
- View all complaints
- Update complaint status
- Assign complaints to themselves

### Admin
- All Officer permissions
- Assign complaints to any officer
- Full system access

## 🔒 Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds of 12
   - Minimum 6 characters required

2. **Token Security**
   - HTTP-only cookies (prevents XSS attacks)
   - Short-lived access tokens
   - Secure refresh token rotation

3. **Email Verification**
   - Token-based verification
   - 24-hour expiry
   - Required before login

4. **2FA Security**
   - 6-digit OTP
   - 5-minute expiry
   - One-time use

5. **Role-Based Access**
   - Middleware-based authorization
   - Route-level protection
   - Data filtering by role

## 🧪 Testing the Application

### 1. Create Test Users

Sign up with different roles:
- Citizen: Regular user
- Officer: Can manage complaints
- Admin: Full access

### 2. Test Authentication Flow

1. Sign up → Check email for verification link
2. Verify email → Login
3. Login → Check email for OTP
4. Enter OTP → Access dashboard

### 3. Test Complaint Management

1. Register a complaint as Citizen
2. View complaints (Citizen sees only their own)
3. Login as Officer/Admin → View all complaints
4. Update complaint status

## 📝 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/smart-city-db

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@smartcity.com

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚨 Important Notes

1. **Email Configuration**: For Gmail, you need to:
   - Enable 2-Step Verification
   - Generate an App Password
   - Use the App Password in `EMAIL_PASS`

2. **MongoDB**: Ensure MongoDB is running before starting the backend

3. **CORS**: Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL

4. **Production**: 
   - Change `JWT_SECRET` to a strong random string
   - Set `NODE_ENV=production`
   - Use secure cookie settings
   - Use MongoDB Atlas or production database

## 🛠️ Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- Bcryptjs
- Nodemailer
- Cookie-parser
- CORS

### Frontend
- React
- React Router DOM
- Axios
- Context API

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Development

This is a production-ready, industry-standard MERN stack application suitable for:
- Portfolio projects
- Resume showcase
- Learning full-stack development
- Real-world application development

---

**Built with ❤️ using MERN Stack**

