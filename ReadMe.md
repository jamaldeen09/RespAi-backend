# RespAI Backend API

![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge&logo=jsonwebtokens)

A robust Node.js/Express backend API that powers RespAI - an intelligent API response analysis platform. Provides secure authentication, AI-powered response analysis, and comprehensive request history management with optional AI features.

## 🚀 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT & Passport.js Google OAuth
- **Security**: bcrypt, CORS, environment-based configuration
- **Architecture**: Modular MVC with service layer

## 📁 Project Structure
src/
├── server.ts # Express server setup & middleware configuration
├── types/ # TypeScript type definitions
│ ├── resPayload.types.ts # API response payload structures
│ ├── reqPayload.types.ts # Client request payload definitions
│ ├── env.types.ts # Environment variables typing
│ └── api.types.ts # Extended Request/Response & validation types
├── config/ # Configuration modules
│ ├── env.config.ts # Environment variables loader
│ ├── database.config.ts # MongoDB connection with retry logic
│ └── passport.config.ts # Passport.js Google OAuth setup
├── controllers/ # Route controllers (auth, profile, response)
├── routes/ # Express route definitions
├── models/ # MongoDB models (User, RequestHistory, Profile)
├── services/ # Business logic layer
└── middlewares/ # Custom middleware functions


## 🔑 Key Features

### 🔐 Authentication & Security
- **JWT-based Authentication** - Secure token-based auth with localStorage strategy
- **Google OAuth 2.0** - Social authentication via Passport.js
- **Password Hashing** - bcrypt for secure credential storage
- **CORS Configuration** - Configurable allowed origins for frontend integration

### 🤖 AI-Powered Analysis
- **Configurable AI Analysis** - Users can enable/disable AI features per request
- **Intelligent Response Processing** - Advanced analysis of API responses
- **Flexible AI Integration** - Designed to plug into various AI providers

### 📊 Request Management
- **Complete History Tracking** - Store and manage all API analysis requests
- **Efficient Caching** - Redis/Memory cache for user profiles and frequent data
- **Structured Error Handling** - Consistent error responses with proper HTTP codes

### 👤 User Management
- **Profile Management** - Update user preferences and settings
- **AI Feature Control** - Toggle AI analysis capabilities
- **Request Analytics** - Track and analyze user request patterns

## 🛣 API Endpoints

### Authentication Routes (`/api/v1/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login with email/password |
| POST | `/signup` | User registration |
| GET | `/google` | Initiate Google OAuth flow |
| GET | `/google/callback` | Google OAuth callback handler |
| POST | `/refresh` | Refresh JWT tokens |
| POST | `/logout` | User logout (token invalidation) |

### Profile Routes (`/api/v1/profile`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user profile information |
| PUT | `/` | Update user profile |
| PATCH | `/ai-settings` | Toggle AI analysis features |

### Analysis Routes (`/api/v1/response`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Submit API response for analysis |
| GET | `/history` | Get user's request history |
| GET | `/history/:id` | Get specific request details |
| DELETE | `/history/:id` | Delete request from history |
| GET | `/stats` | Get user analysis statistics |

## 🔄 System Architecture

### Token Lifecycle Management
```typescript
// JWT tokens stored in client localStorage
interface TokenPayload {
  userId: string;
  email: string;
  expiresIn: string;
}

// Token refresh mechanism
**POST /api/v1/auth/refresh → Issues new access token**
 
## AI Analysis Flow
  - User submits API response for analysis
  - System checks users AI preferences
  - If enabled, routes to AI processing service
  - Returns enhanced analysis with AI insights
  - Stores result in history with AI metadata

**Environment Configuration**
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=clienturl

# Database
MONGODB_URI=mongodb-url

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Open ai
OPENAI_API_KEY=your-openai-api-key

# Client
FRONTEND_URL=your-frontend-url

# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start

**Scripts**
npm run dev    # Start development server
npm run build  # Build TypeScript to JavaScript
npm start      # Start production server

**API Response Format**
# Success response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}

# Error response
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Field is required"]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}