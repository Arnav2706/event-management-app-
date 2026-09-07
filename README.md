# Event Management App - Backend API

Robust RESTful backend service for the Event Management Platform built with Node.js, Express, MongoDB Atlas (Mongoose), and JWT authentication with Role-Based Access Control (RBAC).

---

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas / Mongoose
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Security:** CORS, RBAC Middleware

---

## Project Structure
```
backend/
├── controllers/
│   ├── authController.js         # Register, Login, Current User profile
│   ├── categoryController.js     # Category CRUD operations
│   ├── eventController.js        # Event CRUD, search & category filters
│   └── registrationController.js # Event registration, ticketing & cancellation
├── middleware/
│   ├── auth.js                   # JWT Bearer Token verification
│   └── rbac.js                   # Role-based permission checks
├── models/
│   ├── Category.js               # Category schema
│   ├── Event.js                  # Event schema (dates, venue, capacity)
│   ├── Registration.js           # Registration schema with unique ticket codes
│   └── User.js                   # User schema (Admin, Organizer, Participant)
├── routes/
│   ├── authRoutes.js             # /api/auth endpoints
│   ├── categoryRoutes.js         # /api/categories endpoints
│   ├── eventRoutes.js            # /api/events endpoints
│   └── registrationRoutes.js     # /api/registrations endpoints
├── .env.example                  # Sample environment variables
├── package.json
└── server.js                     # Application entry point & DB connection
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file:
```bash
cp .env.example .env
```
Update `.env` with your settings:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri_here
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

### Health Check
- `GET /api/health` - Server status check

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (`name`, `email`, `password`, `role`) | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user's profile | Authenticated |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/categories` | List all active categories | Public |
| `POST` | `/api/categories` | Create new category | Admin only |
| `DELETE` | `/api/categories/:id` | Delete category | Admin only |

### Events (`/api/events`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/events` | Discovery feed (`?category=&search=&date=&page=`) | Public |
| `GET` | `/api/events/:id` | Get event details by ID | Public |
| `POST` | `/api/events` | Create new event | Organizer, Admin |
| `PUT` | `/api/events/:id` | Update event | Event Creator, Admin |
| `DELETE`| `/api/events/:id` | Delete event | Event Creator, Admin |
| `GET` | `/api/events/organizer/my-events` | Events created by logged-in organizer | Organizer, Admin |

### Registrations (`/api/registrations`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/registrations/events/:eventId` | Register for an event & get unique ticket | Authenticated |
| `PUT` | `/api/registrations/:id/cancel` | Cancel registration (restores event capacity) | Ticket Owner, Admin |
| `GET` | `/api/registrations/my-tickets` | List user's registered events | Authenticated |
| `GET` | `/api/registrations/events/:eventId/participants` | View attendee list for event | Organizer, Admin |
