# 🔧 Ustaad - Skilled Workers Marketplace

<div align="center">

![Ustaad Logo](https://img.shields.io/badge/Ustaad-Skilled%20Workers-blue?style=for-the-badge)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A modern platform connecting skilled workers with customers in Pakistan**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

**Ustaad** is a comprehensive marketplace platform designed specifically for Pakistan, connecting skilled workers (electricians, plumbers, carpenters, painters, etc.) with customers who need their services. The platform features real-time booking, AI-powered price estimation, multi-language support (English, Urdu, Roman Urdu), and a seamless user experience.

### 🎯 Key Highlights

- 🔐 **OTP-based Authentication** - Secure SMS verification
- 🤖 **AI Price Estimation** - Powered by Google Gemini AI
- 🌍 **Multi-language Support** - English, Urdu, Roman Urdu
- 💬 **Real-time Chat** - Socket.io powered messaging
- 📍 **Location-based Search** - PostGIS integration
- 📱 **Mobile-first Design** - Responsive and accessible
- 🎨 **Modern UI/UX** - Glassmorphism design with smooth animations

---

## ✨ Features

### For Customers
- 🔍 Search and filter skilled workers by category, location, and rating
- 📅 Book services with flexible scheduling
- 💰 View transparent pricing and estimates
- ⭐ Rate and review workers after job completion
- 💬 Real-time chat with workers
- 🔔 Push notifications for booking updates

### For Workers
- 📝 Complete profile with portfolio showcase
- 📸 Camera integration for profile and work photos
- 💵 Set custom pricing (hourly rate, visit charges, minimum charge)
- 📊 Dashboard with earnings and job statistics
- 🎤 Voice bio recording (optional)
- ✅ CNIC verification for trust and safety

### For Admins
- 📈 Comprehensive dashboard with analytics
- 👥 User and worker management
- ✓ Worker verification system
- 📊 Booking and revenue tracking

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS with custom glassmorphism theme
- **Animations:** Framer Motion
- **State Management:** React Context API
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client

### Backend
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** JWT with refresh tokens
- **Real-time:** Socket.io
- **File Upload:** Multer with Google Cloud Storage
- **SMS/OTP:** Twilio / MSG91
- **AI Integration:** Google Gemini AI
- **Caching:** Redis
- **Security:** Helmet, CORS, Rate Limiting

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (optional, for caching)
- npm or yarn

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/kasaam-ali/USTAAD.git
cd USTAAD
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Update .env with your credentials
npm run migrate
npm run seed
npm run dev
\`\`\`

Backend runs on \`http://localhost:8080\`

### 3. Frontend Setup

\`\`\`bash
cd ..
npm install
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env.local
npm run dev
\`\`\`

Frontend runs on \`http://localhost:3000\`

---

## 📁 Project Structure

\`\`\`
ustaad/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   └── package.json
│
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── contexts/           # Context providers
│   ├── pages/             # Page components
│   └── main.tsx           # Entry point
│
└── package.json
\`\`\`

---

## 🔌 API Documentation

### Base URL
\`\`\`
http://localhost:8080/api/v1
\`\`\`

### Authentication

#### Send OTP
\`\`\`http
POST /auth/send-otp
Content-Type: application/json

{
  "phone": "3001234567"
}
\`\`\`

#### Verify OTP
\`\`\`http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "3001234567",
  "otp": "123456"
}
\`\`\`

### Workers

#### Search Workers
\`\`\`http
GET /workers/search?category=plumber&city=Karachi
\`\`\`

### Bookings

#### Create Booking
\`\`\`http
POST /bookings
Authorization: Bearer <token>

{
  "worker_id": "uuid",
  "service_type": "plumbing",
  "scheduled_date": "2024-05-25",
  "address": "House 123, Karachi"
}
\`\`\`

---

## 🎨 Key Features

### Camera Integration
- Native browser camera access
- Profile and portfolio photo capture
- Front/back camera switching
- Photo preview and retake

### AI Price Estimation
- Natural language problem description
- Automatic urgency detection
- Time estimation
- Multi-language support

### Real-time Features
- Live chat
- Booking status updates
- Typing indicators
- Online/offline status

---

## 🔒 Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention

---

## 📦 Deployment

### Docker
\`\`\`bash
docker-compose up -d
\`\`\`

### Manual
- **Backend:** Railway/Render/Heroku
- **Frontend:** Vercel/Netlify

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open Pull Request

---

## 📝 Environment Variables

### Backend
\`\`\`env
NODE_ENV=development
PORT=8080
DB_HOST=localhost
DB_NAME=ustaad_db
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
\`\`\`

### Frontend
\`\`\`env
VITE_API_URL=http://localhost:8080/api/v1
\`\`\`

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 👥 Team

**Developer:** Kasaam Ali  
**GitHub:** [@kasaam-ali](https://github.com/kasaam-ali)

---

## 🙏 Acknowledgments

- React, Node.js, PostgreSQL
- Google Gemini AI
- Tailwind CSS, Framer Motion

---

<div align="center">

**Made with ❤️ in Pakistan**

⭐ Star this repo if you find it helpful!

</div>
