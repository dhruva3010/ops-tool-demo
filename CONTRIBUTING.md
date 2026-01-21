# Contributing to OpsHub

Thank you for your interest in contributing to OpsHub! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- MongoDB 6.0+ (local installation or MongoDB Atlas)
- Git
- A code editor (VS Code recommended)

### Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/ops-tool.git
   cd ops-tool
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   ```bash
   cp server/.env.example server/.env
   ```

   Edit `server/.env` with your local configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ops-tool
   JWT_SECRET=dev-secret-key
   JWT_REFRESH_SECRET=dev-refresh-secret
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   ```

4. **Start MongoDB**

   If using local MongoDB:
   ```bash
   mongod
   ```

   Or use MongoDB Atlas and update the `MONGODB_URI` in your `.env` file.

5. **Seed the database**

   ```bash
   cd server
   npm run seed
   cd ..
   ```

   This creates a default admin user:
   - Email: `admin@example.com`
   - Password: `admin123`

6. **Start the development servers**

   ```bash
   npm run dev
   ```

   This starts:
   - Backend API at http://localhost:5000
   - Frontend at http://localhost:5173

## Project Structure

```
ops-tool/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   │   ├── layout/     # Layout components (Navbar, Sidebar)
│   │   │   └── ui/         # UI primitives (Button, Input, Modal)
│   │   ├── context/        # React context providers
│   │   ├── features/       # Feature-based modules
│   │   ├── services/       # API client (axios)
│   │   ├── App.jsx         # Root component with routes
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Configuration (passport)
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Utilities and helpers
│   │   └── app.js          # Express app entry
│   └── .env.example
│
└── package.json            # Root package with scripts
```

## Development Workflow

### Running in Development

```bash
# Run both frontend and backend
npm run dev

# Run only backend
npm run dev:server

# Run only frontend
npm run dev:client
```

### Code Style

- **Frontend**: React functional components with hooks
- **Backend**: Express with async/await
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: React Query for server state, Context for app state

### Adding a New Feature

1. **Backend**
   - Create model in `server/src/models/`
   - Create controller in `server/src/controllers/`
   - Create routes in `server/src/routes/`
   - Register routes in `server/src/app.js`

2. **Frontend**
   - Create feature folder in `client/src/features/`
   - Add API methods in `client/src/services/api.js`
   - Add route in `client/src/App.jsx`
   - Update sidebar navigation in `client/src/components/layout/Sidebar.jsx`

### Dark Mode

All components should support dark mode using Tailwind's `dark:` prefix:

```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>
```

### Component Guidelines

- Use existing UI components from `client/src/components/ui/`
- Follow the established patterns for modals, forms, and tables
- Include loading and error states
- Support both light and dark themes

## Testing Changes

### Manual Testing Checklist

- [ ] Feature works in light mode
- [ ] Feature works in dark mode
- [ ] Feature works on mobile (responsive)
- [ ] Feature works for all applicable user roles
- [ ] No console errors
- [ ] API errors are handled gracefully

### Test User Accounts

After seeding, you can log in with:
- **Admin**: admin@example.com / admin123

You can create additional users through the UI or modify `server/src/utils/seed.js`.

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add asset QR code generation
fix: resolve dark mode issue in vendor cards
docs: update README with API endpoints
refactor: simplify authentication middleware
```

### Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request with:
   - Clear description of changes
   - Screenshots for UI changes
   - List of tested scenarios

## Common Tasks

### Adding a New API Endpoint

1. Define the route in `server/src/routes/`
2. Create the controller function
3. Add validation if needed using express-validator
4. Apply appropriate middleware (auth, rbac)
5. Add the API method in `client/src/services/api.js`

### Adding a New UI Component

1. Create the component in `client/src/components/ui/`
2. Export it from `client/src/components/ui/index.js`
3. Include dark mode styles
4. Make it accessible (aria labels, keyboard navigation)

### Modifying the Database Schema

1. Update the Mongoose model in `server/src/models/`
2. If needed, create a migration script
3. Update the seed script if the change affects initial data
4. Update related controllers and validation

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# Or check the connection string in .env
MONGODB_URI=mongodb://localhost:27017/ops-tool
```

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### Dependencies Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules server/node_modules client/node_modules
npm run install:all
```

## Getting Help

- Check existing issues for similar problems
- Create a new issue with detailed information
- Include error messages and steps to reproduce

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

Thank you for contributing!
