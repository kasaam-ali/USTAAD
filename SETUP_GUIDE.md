# 🚀 USTAAD - Complete Setup & Deployment Guide

## 📦 What Has Been Built

### ✅ **Backend (Node.js + Express + TypeScript)**
- **Authentication System**
  - Real OTP via SMS (Twilio/MSG91)
  - JWT tokens with refresh mechanism
  - Role-based access control (Customer, Worker, Admin)
  - Password hashing with bcrypt

- **Database (PostgreSQL + Sequelize)**
  - Users table
  - Workers table (with geolocation)
  - Bookings table
  - Reviews table
  - OTP table

- **AI-Powered Features (Gemini AI)** 🤖
  - Smart price estimation
  - Job description analysis
  - Worker recommendations
  - Multi-language translation

- **Real-time Features (Socket.io)** ⚡
  - Live booking updates
  - Chat system
  - Typing indicators
  - Push notifications

- **File Upload System**
  - Google Cloud Storage integration
  - Image optimization (Sharp)
  - Profile photos
  - Portfolio management

- **Security & Monitoring**
  - Rate limiting (Redis-backed)
  - Helmet.js security headers
  - Sentry error tracking
  - Request logging (Winston)
  - CORS configuration

### ✅ **Frontend (React + TypeScript + Vite)**
- Beautiful UI with Tailwind CSS
- Multi-language support (English, Urdu, Roman)
- Voice input support
- Responsive design
- Animation with Motion
- API integration ready

### ✅ **DevOps**
- Docker & Docker Compose
- Google Cloud Run deployment
- CI/CD with Cloud Build
- Nginx reverse proxy
- Health checks

---

## 🚀 Quick Start (Local Development)

### 1. **Install PostgreSQL**
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/

# Start PostgreSQL service
pg_ctl start

# Create database
createdb ustaad_db
```

### 2. **Install Redis (Optional but Recommended)**
```bash
# Windows (using Chocolatey)
choco install redis-64

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

### 3. **Backend Setup**
```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your credentials
notepad .env

# Run database migrations
npm run migrate

# Seed sample data
npm run seed

# Start development server
npm run dev
```

**Backend will run on:** `http://localhost:8080`

### 4. **Frontend Setup**
```bash
cd ..

# Install dependencies
npm install

# Create environment file
echo VITE_API_URL=http://localhost:8080/api/v1 > .env.local

# Start development server
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend (.env)
```env
# REQUIRED
NODE_ENV=development
PORT=8080
DB_HOST=localhost
DB_NAME=ustaad_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
GEMINI_API_KEY=AIzaSyB1tNKQIeztj3PKuRsqP27p4GvDIQzq4R4

# OPTIONAL (for SMS)
MSG91_AUTH_KEY=your_msg91_key
MSG91_SENDER_ID=USTAAD

# OPTIONAL (for production)
REDIS_HOST=localhost
REDIS_PORT=6379
GCS_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=ustaad-uploads
SENTRY_DSN=your_sentry_dsn
```

---

## 🐳 Docker Deployment (Easiest Way)

```bash
# Start all services (PostgreSQL + Redis + Backend + Frontend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

**Access:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- API Health: `http://localhost:8080/api/v1/health`

---

## ☁️ Google Cloud Run Deployment

### Prerequisites
```bash
# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

### 1. **Setup Cloud SQL (PostgreSQL)**
```bash
# Create instance
gcloud sql instances create ustaad-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1

# Create database
gcloud sql databases create ustaad_db --instance=ustaad-db

# Set password
gcloud sql users set-password postgres \
  --instance=ustaad-db \
  --password=YOUR_SECURE_PASSWORD
```

### 2. **Deploy Backend**
```bash
cd backend

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ustaad-backend

gcloud run deploy ustaad-backend \
  --image gcr.io/YOUR_PROJECT_ID/ustaad-backend \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars="NODE_ENV=production,DB_HOST=YOUR_DB_IP,DB_NAME=ustaad_db,DB_USER=postgres,DB_PASSWORD=YOUR_PASSWORD,JWT_SECRET=YOUR_SECRET,GEMINI_API_KEY=YOUR_KEY"
```

### 3. **Deploy Frontend**
```bash
cd ..

# Update API URL in .env
echo "VITE_API_URL=https://ustaad-backend-xxx.run.app/api/v1" > .env.production

# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ustaad-frontend

gcloud run deploy ustaad-frontend \
  --image gcr.io/YOUR_PROJECT_ID/ustaad-frontend \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 256Mi
```

### 4. **Run Migrations on Cloud**
```bash
# Connect to Cloud SQL
gcloud sql connect ustaad-db --user=postgres

# Run migrations manually or use Cloud Run Jobs
```

---

## 📱 Testing the API

### 1. **Health Check**
```bash
curl http://localhost:8080/api/v1/health
```

### 2. **Send OTP**
```bash
curl -X POST http://localhost:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"3001234567","purpose":"login"}'
```

### 3. **Login with OTP**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"3001234567","otp":"123456"}'
```

### 4. **Search Workers**
```bash
curl -X GET "http://localhost:8080/api/v1/workers/search?trade=electrician&city=Lahore" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Key Features Implemented

### 1. **AI-Powered Price Estimation** 🤖
```typescript
// Automatically estimates job price based on description
const booking = await bookingService.createBooking({
  worker_id: "uuid",
  description: "Need to fix electrical wiring in 3 rooms",
  // AI will analyze and estimate: Rs. 800-1500
});
```

### 2. **Real-time Notifications** ⚡
```typescript
// Socket.io automatically notifies users
io.to(`user:${userId}`).emit('notification', {
  type: 'booking_accepted',
  message: 'Worker accepted your booking!'
});
```

### 3. **Location-Based Search** 📍
```typescript
// Find workers within 10km radius
const workers = await workerService.searchWorkers({
  latitude: 31.5204,
  longitude: 74.3587,
  radius: 10,
  trade: 'plumber'
});
```

### 4. **Smart Recommendations** 🎯
```typescript
// AI recommends best workers based on requirements
const recommendations = await aiService.generateWorkerRecommendations(
  "Need urgent plumbing work",
  availableWorkers
);
```

---

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation (express-validator)
- ✅ SQL injection protection (Sequelize ORM)
- ✅ XSS protection
- ✅ Password hashing (bcrypt)
- ✅ OTP expiration (10 minutes)
- ✅ Error tracking (Sentry)

---

## 📊 Database Schema

```sql
Users (id, full_name, phone, email, password, role, is_verified, profile_photo_url)
Workers (id, user_id, trade, experience_years, city, area, latitude, longitude, rating, cnic)
Bookings (id, customer_id, worker_id, description, scheduled_date, status, estimated_price)
Reviews (id, booking_id, customer_id, worker_id, rating, comment)
OTPs (id, phone, otp, purpose, expires_at, is_used)
```

---

## 🎨 Frontend Integration Example

```typescript
import { authService, workerService, bookingService } from './services';

// Login with OTP
const response = await authService.loginWithOTP('3001234567', '123456');

// Search workers
const workers = await workerService.searchWorkers({
  trade: 'electrician',
  city: 'Lahore'
});

// Create booking
const booking = await bookingService.createBooking({
  worker_id: workers[0].id,
  description: 'Fix wiring',
  scheduled_date: '2024-01-20',
  time_preference: 'morning',
  address: 'House 123, DHA',
  city: 'Lahore',
  area: 'DHA'
});
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Check connection
psql -U postgres -d ustaad_db
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Change port in .env
PORT=8081
```

### Redis Connection Failed
```bash
# Redis is optional, app will work without it
# To install: choco install redis-64
# Or disable in code by not setting REDIS_HOST
```

---

## 📈 Next Steps (Optional Enhancements)

1. **Payment Integration** - JazzCash/EasyPaisa API
2. **Admin Dashboard** - User management, analytics
3. **Mobile App** - React Native version
4. **Advanced Chat** - File sharing, voice messages
5. **Worker Tracking** - Real-time GPS location
6. **Push Notifications** - Firebase Cloud Messaging
7. **Analytics** - Google Analytics, Mixpanel
8. **Email Notifications** - SendGrid integration

---

## 📞 Support

- **Documentation**: Check README.md files
- **Issues**: Create GitHub issue
- **Email**: support@ustaad.com

---

## 🎉 Congratulations!

You now have a **production-ready** worker booking platform with:
- ✅ Real authentication
- ✅ AI-powered features
- ✅ Real-time updates
- ✅ Cloud deployment
- ✅ Security best practices
- ✅ Scalable architecture

**Start the servers and test it out!** 🚀
