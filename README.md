# GlowSync — Smart Salon Management Platform

A full-stack web application for managing salon operations across three user roles: **Manager**, **Stylist**, and **Client**.

---

## Project Structure

```
glowsync/
├── glowsync.code-workspace   ← Open this in VSCode
├── .gitignore
├── README.md
│
├── backend/                  ← Node.js / Express API
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js              ← API Gateway entry point
│       ├── config/
│       │   └── database.js        ← In-memory data store
│       ├── middleware/
│       │   └── authMiddleware.js  ← JWT protect + authorize
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── bookingRoutes.js
│       │   └── inventoryRoutes.js
│       └── services/
│           ├── auth/authService.js
│           ├── booking/bookingService.js
│           └── inventory/inventoryService.js
│
└── frontend/                 ← React SPA
    ├── package.json
    └── src/
        ├── App.js                 ← Root + sidebar shell
        ├── index.js
        ├── services/
        │   └── api.js             ← API client (Auth / Booking / Inventory)
        ├── styles/
        │   └── global.css
        └── components/
            ├── auth/
            │   ├── AuthContext.js
            │   └── LoginPage.js
            ├── dashboard/
            │   └── Dashboard.js
            ├── booking/
            │   └── BookingsPage.js
            └── inventory/
                └── InventoryPage.js
```

---

## Quick Start

### 1. Open in VSCode
Double-click **`glowsync.code-workspace`** — VSCode will open both folders side by side.

### 2. Start the Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
The API runs at **http://localhost:5000**

### 3. Start the Frontend
```bash
cd frontend
npm install
npm start
```
The app opens at **http://localhost:3000**

---

## Demo Accounts

| Role    | Email                    | Password |
|---------|--------------------------|----------|
| Manager | manager@glowsync.com     | password |
| Stylist | stylist@glowsync.com     | password |
| Client  | client@glowsync.com      | password |

---

## API Endpoints

### Authentication Service (`/api/auth`)
| Method | Route       | Description         | Auth |
|--------|-------------|---------------------|------|
| POST   | /register   | Register new user   | No   |
| POST   | /login      | Login, returns JWT  | No   |
| GET    | /me         | Get current user    | Yes  |

### Booking Service (`/api/bookings`)
| Method | Route               | Description             | Auth     |
|--------|---------------------|-------------------------|----------|
| GET    | /                   | List appointments       | All      |
| POST   | /                   | Create appointment      | Client/Manager |
| PATCH  | /:id/status         | Update status           | All      |
| GET    | /stylists/:salonId  | List salon stylists     | All      |

### Inventory Service (`/api/inventory`)
| Method | Route      | Description          | Auth    |
|--------|------------|----------------------|---------|
| GET    | /          | List all items       | Manager |
| GET    | /alerts    | Low-stock items      | Manager |
| POST   | /          | Add new item         | Manager |
| PATCH  | /:id       | Update quantity      | Manager |
| DELETE | /:id       | Delete item          | Manager |

---

## Tech Stack

**Backend:** Node.js, Express, JWT (jsonwebtoken), bcryptjs  
**Frontend:** React 18, plain CSS (no UI library)  
**Data:** In-memory store (swap `src/config/database.js` for MongoDB/PostgreSQL)
