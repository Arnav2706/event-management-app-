# The Atelier — Luxury Event Management Platform

> A full-stack, production-grade event management mobile application and backend service built for curated, exclusive gatherings. Designed with an obsidian dark and champagne gold glassmorphism aesthetic inspired by District by Zomato, featuring atomic ticketing, role-based access control, and live MongoDB Atlas cloud integration.

---

## 🏛️ System Architecture

```
                                 ┌─────────────────────────────────┐
                                 │       React Native Client       │
                                 │       (Expo SDK 57 / Web)       │
                                 └───────────────┬─────────────────┘
                                                 │
                                     HTTP / REST │ JWT Bearer Auth
                                                 ▼
                                 ┌─────────────────────────────────┐
                                 │     Node.js / Express API       │
                                 │         (Port 5000)             │
                                 └───────────────┬─────────────────┘
                                                 │
                                 Mongoose ODM    │ TLS Connection
                                                 ▼
                                 ┌─────────────────────────────────┐
                                 │      MongoDB Atlas Cloud        │
                                 │   (Users, Events, Bookings)     │
                                 └─────────────────────────────────┘
```

---

## 📱 Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native with Expo SDK 57
- **Navigation:** React Navigation v7 (Native Stack & Bottom Tabs)
- **Styling:** Custom Obsidian & Champagne Gold Glassmorphic Design System
- **State & Storage:** React Context API + `@react-native-async-storage/async-storage`
- **Networking:** Axios with dynamic Wi-Fi IP auto-detection (`expo-constants`)
- **Icons:** `@expo/vector-icons` (Ionicons)

### Backend (REST API)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB Atlas with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **Security & Middleware:** CORS, custom JWT authentication, and Role-Based Access Control (RBAC)

---

## ✨ Key Features & User Journeys

### 🎩 For Patrons (Participants)
- **Membership Sign-In & Apply**: Private concierge authentication with 1-tap quick credentials for demonstrations.
- **Discovery Salon (Feed)**: Search curations in real time, filter by genres (*Private Salon*, *Culinary Atelier*, *Art & Design*, *Acoustic & Chamber*, *Technology & AI*), and explore the Featured Spotlight hero.
- **Curation Details**: Review sensory descriptions, venue coordinates, curator profile, date/time, and real-time capacity meters.
- **One-Tap Reservation**: Reserve invitations with concurrency protection.
- **Private Passes (Tickets)**: Perforated notch pass cards with confirmed status, unique alphanumeric ticket codes, and venue QR code placeholders.
- **Invitation Surrender**: Cancel tickets to immediately return seats to the registry.

### 💎 For Curators (Organizers)
- **Curator Atelier Dashboard**: Real-time counter metrics for *Salons Hosted*, *Guests Admitted*, and *Total Capacity*.
- **Salon Management**: View all organized events with fill rate percentages and status badges.
- **Guest Registry**: Drill into any event to see the verified attendee list with names and contact emails.
- **Curate New Salon**: Modal form with venue validation, genre assignment, date/time pickers, and capacity limits.
- **Withdraw Salon**: Safely delete gatherings with full cascade safety.

---

## 🗄️ Database Schema & Collections

1. **`User`**: Name, unique indexed email, hashed password, role (`participant`, `organizer`, `admin`), phone, and avatar.
2. **`Category`**: Name, unique slug, and active status flag.
3. **`Event`**: Title, description, category reference (`categoryId`), organizer reference (`organizerId`), banner image URL, structured venue (`name`, `address`, `coordinates`), event date, start/end times, registration deadline, `maxParticipants`, `currentParticipantsCount`, and status (`draft`, `published`, `cancelled`).
4. **`Registration`**: User reference (`userId`), event reference (`eventId`), status (`confirmed`, `cancelled`), and unique `qrTicketCode`.

---

## 📡 REST API Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new patron or curator (`name`, `email`, `password`, `role`) | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/categories` | List all active categories | Public |
| `POST` | `/api/categories` | Create new category | Admin |
| `DELETE` | `/api/categories/:id` | Delete category | Admin |

### Events (`/api/events`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/events` | Discovery feed (`?categoryId=&search=&status=published`) | Public |
| `GET` | `/api/events/:id` | Retrieve event details by ID | Public |
| `POST` | `/api/events` | Create and publish new event | Organizer, Admin |
| `PUT` | `/api/events/:id` | Update event details | Event Organizer, Admin |
| `DELETE` | `/api/events/:id` | Delete event | Event Organizer, Admin |
| `GET` | `/api/events/organizer/my-events` | Retrieve events hosted by authenticated curator | Organizer, Admin |

### Registrations & Tickets (`/api/registrations`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/registrations/events/:eventId` | Reserve ticket & decrement available capacity | Authenticated |
| `PUT` | `/api/registrations/:id/cancel` | Cancel reservation & restore capacity | Ticket Owner, Admin |
| `GET` | `/api/registrations/my-tickets` | List user's active confirmed passes | Authenticated |
| `GET` | `/api/registrations/events/:eventId/participants` | View guest list for an event | Organizer, Admin |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm**
- **Expo Go** app on your physical mobile phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the API server
node server.js
```
The server will run on `http://localhost:5000` and connect to MongoDB Atlas.

#### (Optional) Seed the Database:
To populate the database with sample luxury curations and demo accounts:
```bash
node seed.js
```

---

### 3. Mobile Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Expo development server
npx expo start --clear
```

#### Run on Your Physical Phone:
1. Make sure your phone is connected to the **same Wi-Fi** as your laptop.
2. Open **Expo Go** on Android (or Camera on iOS) and scan the QR code, or enter:
   ```text
   exp://<YOUR_LOCAL_IP>:8081
   ```
*(The app automatically detects your laptop's Wi-Fi IP and routes API requests to your local backend).*

#### Run in Browser (Web Preview):
```bash
npx expo start --web
```
Access at `http://localhost:8081`.

---

## 🔑 Demo Credentials

Use these pre-configured credentials or use the 1-tap quick fill buttons on the sign-in screen:

| Role | Email | Password | What You Can Test |
|---|---|---|---|
| **Participant (Patron)** | `participant@example.com` | `password123` | Browse discovery feed, view event details, reserve tickets, and view passes with QR codes. |
| **Organizer (Curator)** | `organizer@example.com` | `password123` | View curator metrics, see guest lists of registered patrons, and publish new salons. |

---

## 📁 Repository Structure

```
├── backend/
│   ├── controllers/         # Business logic (auth, categories, events, registrations)
│   ├── middleware/          # JWT auth & RBAC permissions
│   ├── models/              # Mongoose schemas (User, Category, Event, Registration)
│   ├── routes/              # Express API route declarations
│   ├── seed.js              # Database seeder script
│   ├── server.js            # Express app entry point & MongoDB Atlas connection
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (GlassCard, EventCard, TicketCard, etc.)
│   │   ├── constants/       # Design tokens (theme.js with obsidian & gold palette)
│   │   ├── context/         # AuthContext with token persistence
│   │   ├── navigation/      # AppNavigator (Role-based tabs & stacks)
│   │   ├── screens/         # Login, Register, Home, EventDetails, Passes, Dashboard
│   │   └── services/        # Axios API client with dynamic host resolution
│   ├── App.js               # Application root wrapper
│   ├── app.json             # Expo project configuration
│   └── package.json
│
├── docs/                    # Architecture, ER diagrams, API specs, and UX flows
├── .gitignore               # Clean repository ignores
└── README.md                # Project overview and documentation
```

---

## 📄 License
This project is developed for academic and demonstration purposes.
