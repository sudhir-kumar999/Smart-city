# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend
1. Copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` and update:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong random string
   - `EMAIL_USER` - Your Gmail address
   - `EMAIL_PASS` - Gmail App Password (see below)

#### Frontend (Optional)
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Gmail App Password Setup

For email functionality:

1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password
5. Use this password in `EMAIL_PASS` in backend `.env`

### Step 4: Start MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create free cluster at mongodb.com/atlas
- Get connection string
- Update `MONGODB_URI` in `.env`

### Step 5: Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
Frontend runs on: `http://localhost:3000`

### Step 6: Test the Application

1. **Sign Up**: Go to `http://localhost:3000/signup`
   - Create a test account
   - Check email for verification link

2. **Verify Email**: Click the link in email

3. **Login**: Go to `http://localhost:3000/login`
   - Enter credentials
   - Check email for OTP

4. **Verify OTP**: Enter 6-digit code

5. **Dashboard**: You're in! Try registering a complaint

## 📋 Default Test Accounts

You can create accounts with different roles:

- **Citizen**: Regular user (default)
- **Officer**: Can manage complaints
- **Admin**: Full system access

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify connection string format

### Email Not Sending
- Check Gmail App Password is correct
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Check spam folder

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Default: `http://localhost:3000`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: React will prompt to use different port

## 📁 Project Structure Quick Reference

```
project/
├── backend/          # Node.js + Express API
│   ├── controllers/  # Request handlers
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth & validation
│   └── utils/        # Helpers
│
└── frontend/         # React application
    ├── src/
    │   ├── pages/    # Page components
    │   ├── components/ # Reusable components
    │   ├── context/   # State management
    │   └── utils/     # API client
```

## ✅ Verification Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] MongoDB running/connected
- [ ] Backend `.env` configured
- [ ] Gmail App Password set
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)
- [ ] Can access `http://localhost:3000`
- [ ] Can sign up new user
- [ ] Can receive verification email
- [ ] Can login and receive OTP
- [ ] Can access dashboard after OTP verification

## 🎯 Next Steps

1. Explore the codebase
2. Read `AUTHENTICATION_FLOW.md` for detailed flow
3. Check `README.md` for full documentation
4. Customize for your needs

---

**Happy Coding! 🚀**

