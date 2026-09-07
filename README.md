# Event Management App - Backend API

Robust RESTful backend service for the Event Management Platform built with Node.js, Express, MongoDB (Mongoose), and JWT authentication with Role-Based Access Control (RBAC).

---

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB / Mongoose
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Security:** Helmet, CORS, Express Rate Limit, RBAC Middleware

---

## Project Structure
```
backend/
├── controllers/
│   ├── authController.js       # Register, Login, Current User profile
│   └── categoryController.js   # Category CRUD operations
├── middleware/
│   ├── auth.js                 # JWT Bearer Token verification
│   └── rbac.js                 # Role-based permission checks
├── models/
│   ├── Category.js             # Event category schema
│   └── User.js                 # User schema with roles (Admin, Organizer, Attendee)
├── routes/
│   ├── authRoutes.js           # /api/auth endpoints
│   └── categoryRoutes.js       # /api/categories endpoints
├── .env.example                # Sample environment variables
├── package.json
└── server.js                   # Application entry point & DB connection
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file and configure your values:
```bash
cp .env.example .env
```
Update `.env` with your settings:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/eventapp
JWT_SECRET=your_jwt_secret_key_here
```

### 4. Run the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (name, email, password, role) | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile | Authenticated |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/categories` | List all active categories | Public |
| `POST` | `/api/categories` | Create new category | Admin only |
| `DELETE` | `/api/categories/:id` | Delete category | Admin only |
