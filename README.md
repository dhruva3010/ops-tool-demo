# OpsHub

An internal operations tool for small teams to manage assets, vendors, users, and employee onboarding.

## Features

- **Dashboard** - Overview of key metrics and recent activity
- **Asset Management** - Track hardware, software, and equipment with QR code support
- **Vendor Management** - Manage vendor relationships, contacts, and contracts
- **User Management** - Role-based access control (Admin, Manager, Employee)
- **Onboarding** - Create templates and track employee onboarding progress
- **Dark Mode** - Full dark mode support with system preference detection
- **Responsive** - Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Passport.js (Local, Google OAuth, Microsoft OAuth)
- QR Code generation

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Query (TanStack Query)
- React Router v6
- Headless UI + Heroicons
- Recharts for data visualization

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd ops-tool
```

### 2. Install dependencies

```bash
npm run install:all
```

This installs dependencies for the root, server, and client.

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ops-tool
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# OAuth - Google (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OAuth - Microsoft (optional)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:5000/api/auth/microsoft/callback

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 4. Seed the database (optional)

```bash
cd server
npm run seed
```

This creates a default admin user:
- Email: `admin@example.com`
- Password: `admin123`

### 5. Start the development servers

```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 5173) concurrently.

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Available Scripts

### Root directory

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and client in development mode |
| `npm run dev:server` | Start only the backend server |
| `npm run dev:client` | Start only the frontend client |
| `npm run install:all` | Install all dependencies |
| `npm run build` | Build the client for production |
| `npm start` | Start the production server |

### Server directory (`/server`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (auto-reload) |
| `npm start` | Start server in production mode |
| `npm run seed` | Seed database with initial data |

### Client directory (`/client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Project Structure

```
ops-tool/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (Auth, Theme)
│   │   ├── features/       # Feature modules
│   │   │   ├── assets/
│   │   │   ├── auth/
│   │   │   ├── onboarding/
│   │   │   ├── profile/
│   │   │   ├── users/
│   │   │   └── vendors/
│   │   ├── services/       # API client
│   │   └── App.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Passport, etc.
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, RBAC, validation
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helpers, seed script
│   │   └── app.js
│   └── package.json
└── package.json            # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/microsoft` - Microsoft OAuth

### Users
- `GET /api/users` - List users (Admin)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (Admin)

### Assets
- `GET /api/assets` - List assets
- `POST /api/assets` - Create asset (Manager+)
- `GET /api/assets/:id` - Get asset
- `PUT /api/assets/:id` - Update asset (Manager+)
- `DELETE /api/assets/:id` - Delete asset (Admin)
- `POST /api/assets/:id/assign` - Assign to user
- `POST /api/assets/:id/unassign` - Unassign
- `POST /api/assets/:id/maintenance` - Add maintenance record
- `GET /api/assets/:id/qr` - Generate QR code

### Vendors
- `GET /api/vendors` - List vendors
- `POST /api/vendors` - Create vendor (Admin)
- `GET /api/vendors/:id` - Get vendor
- `PUT /api/vendors/:id` - Update vendor (Admin)
- `DELETE /api/vendors/:id` - Delete vendor (Admin)
- `POST /api/vendors/:id/contracts` - Add contract
- `DELETE /api/vendors/:id/contracts/:contractId` - Delete contract

### Onboarding
- `GET /api/onboarding/templates` - List templates
- `POST /api/onboarding/templates` - Create template (Admin)
- `PUT /api/onboarding/templates/:id` - Update template (Admin)
- `DELETE /api/onboarding/templates/:id` - Delete template (Admin)
- `GET /api/onboarding/instances` - List instances
- `POST /api/onboarding/instances` - Start onboarding (Manager+)
- `GET /api/onboarding/instances/:id` - Get instance
- `PUT /api/onboarding/instances/:id/tasks/:taskId` - Update task
- `POST /api/onboarding/instances/:id/cancel` - Cancel onboarding

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features |
| **Manager** | Manage assets, vendors (view only), onboarding |
| **Employee** | View assets, complete assigned onboarding tasks |

## License

MIT
