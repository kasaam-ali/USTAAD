# 🚀 Ustaad - Production-Ready Worker Booking Platform

<div align="center">
  <img src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" alt="Ustaad Banner" width="100%"/>
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://ustaad-335159347838.asia-southeast1.run.app)
  [![Backend API](https://img.shields.io/badge/API-Running-blue?style=for-the-badge)](https://ustaad-backend.run.app)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
</div>

## 📋 Table of Contents
- [Overview](#overview)
- [WOW Features](#wow-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**Ustaad** is a production-ready platform connecting customers with skilled workers (electricians, plumbers, carpenters, etc.) in Pakistan. Built with modern technologies and AI-powered features.

### Key Highlights
- ✅ **Real OTP Authentication** (SMS via Twilio/MSG91)
- ✅ **AI-Powered Price Estimation** (Gemini AI)
- ✅ **Location-Based Search** (PostGIS)
- ✅ **Real-time Chat** (Socket.io)
- ✅ **Multi-language Support** (English, Urdu, Roman)
- ✅ **Payment Integration Ready** (JazzCash/EasyPaisa)
- ✅ **Production Deployed** (Google Cloud Run)

---

## 🌟 WOW Features

### 1. **AI-Powered Smart Pricing** 🤖
- Gemini AI analyzes job descriptions
- Estimates fair prices based on complexity
- Considers market rates in Pakistan
- Real-time price suggestions

### 2. **Real OTP Authentication** 📱
- SMS-based verification
- Secure JWT tokens
- Refresh token mechanism
- Session management

### 3. **Location-Based Search** 📍
- Find workers near you
- Distance calculation
- Radius-based filtering
- Map integration ready

### 4. **Real-time Features** ⚡
- Live booking updates
- Instant notifications
- Chat system
- Typing indicators

### 5. **Smart Recommendations** 🎯
- AI-powered worker suggestions
- Rating-based sorting
- Experience matching
- Availability tracking

### 6. **Multi-language Support** 🌐
- English
- Urdu (اردو)
- Roman Urdu
- Voice input support

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** (Fast build tool)
- **TailwindCSS** (Styling)
- **Motion** (Animations)
- **Socket.io Client** (Real-time)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **PostgreSQL** (Database)
- **Sequelize** (ORM)
- **Redis** (Caching)
- **Socket.io** (WebSocket)

### AI & Services
- **Google Gemini AI** (Price estimation, recommendations)
- **Twilio/MSG91** (SMS/OTP)
- **Google Cloud Storage** (File uploads)
- **JWT** (Authentication)

### DevOps
- **Docker** + **Docker Compose**
- **Google Cloud Run** (Deployment)
- **Cloud Build** (CI/CD)
- **Nginx** (Reverse proxy)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional)
- Docker (optional)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ustaad.git
cd ustaad
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:8080`

### 3. Frontend Setup
```bash
cd ..

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env.local

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Using Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ⚙️ Environment Setup

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ustaad_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=24h

# SMS (Choose one)
# Option 1: Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Option 2: MSG91 (Better for Pakistan)
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=USTAAD

# Gemini AI
GEMINI_API_KEY=AIzaSyB1tNKQIeztj3PKuRsqP27p4GvDIQzq4R4

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_SOCKET_URL=http://localhost:8080
VITE_GEMINI_API_KEY=your_gemini_key
```

---

## 📚 API Documentation

### Base URL
```
Production: https://ustaad-backend.run.app/api/v1
Development: http://localhost:8080/api/v1
```

### Authentication Endpoints

#### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "phone": "3001234567",
  "purpose": "login"
}
```

#### Verify OTP & Login
```http
POST /auth/login-otp
Content-Type: application/json

{
  "phone": "3001234567",
  "otp": "123456"
}
```

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "full_name": "Ahmed Ali",
  "phone": "3001234567",
  "role": "customer",
  "worker_data": {
    "trade": "electrician",
    "experience_years": 5,
    "city": "Lahore",
    "area": "DHA",
    "cnic": "35202-1234567-1",
    "min_charge": 500,
    "hourly_rate": 500,
    "visit_charge": 200
  }
}
```

### Worker Endpoints

#### Search Workers
```http
GET /workers/search?trade=electrician&city=Lahore&min_rating=4
Authorization: Bearer {token}
```

#### Get Worker Details
```http
GET /workers/:id
Authorization: Bearer {token}
```

### Booking Endpoints

#### Create Booking
```http
POST /bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "worker_id": "uuid",
  "description": "Need to fix electrical wiring",
  "scheduled_date": "2024-01-20",
  "time_preference": "morning",
  "address": "House 123, Street 5, DHA",
  "city": "Lahore",
  "area": "DHA"
}
```

#### Get My Bookings
```http
GET /bookings?status=pending
Authorization: Bearer {token}
```

### Review Endpoints

#### Create Review
```http
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "booking_id": "uuid",
  "rating": 5,
  "comment": "Excellent work!"
}
```

---

## 🚢 Deployment

### Deploy to Google Cloud Run

1. **Setup Google Cloud**
```bash
gcloud init
gcloud auth login
```

2. **Build & Deploy**
```bash
# Submit build
gcloud builds submit --config=cloudbuild.yaml

# Or use docker
docker build -t gcr.io/PROJECT_ID/ustaad-backend ./backend
docker push gcr.io/PROJECT_ID/ustaad-backend

gcloud run deploy ustaad-backend \
  --image gcr.io/PROJECT_ID/ustaad-backend \
  --region asia-southeast1 \
  --allow-unauthenticated
```

3. **Setup Database**
```bash
# Create Cloud SQL instance
gcloud sql instances create ustaad-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1

# Create database
gcloud sql databases create ustaad_db --instance=ustaad-db
```

4. **Set Environment Variables**
```bash
gcloud run services update ustaad-backend \
  --set-env-vars="NODE_ENV=production,DB_HOST=..." \
  --region=asia-southeast1
```

---

## 📱 Mobile App (Coming Soon)
- React Native version
- iOS & Android support
- Push notifications
- Offline mode

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 👥 Team

- **Developer**: Your Name
- **AI Integration**: Gemini AI
- **Design**: Tailwind CSS

---

## 📞 Support

- **Email**: support@ustaad.com
- **Website**: https://ustaad.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/ustaad/issues)

---

<div align="center">
  Made with ❤️ in Pakistan 🇵🇰
  
  ⭐ Star this repo if you find it helpful!
</div>
