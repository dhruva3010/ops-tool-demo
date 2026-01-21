# OpsHub - Frequently Asked Questions

## General Questions

### What is OpsHub?
OpsHub is an internal operations management tool designed for small teams. It helps organizations efficiently manage assets, vendors, users, and employee onboarding processes in a centralized platform.

### What are the key features of OpsHub?
- **Dashboard**: Overview of key metrics and recent activity
- **Asset Management**: Track hardware, software, and equipment with QR code support
- **Vendor Management**: Manage vendor relationships, contacts, and contracts
- **User Management**: Role-based access control (Admin, Manager, Employee)
- **Employee Onboarding**: Create templates and track onboarding progress
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Installation & Setup

### What are the prerequisites to run OpsHub?
You need:
- Node.js 18 or higher
- MongoDB (either local installation or MongoDB Atlas)
- npm or yarn package manager

### How do I install OpsHub?
1. Clone the repository
2. Run `npm run install:all` to install all dependencies (root, server, and client)
3. Copy `server/.env.example` to `server/.env` and configure your environment variables
4. Optionally run `cd server && npm run seed` to create a default admin user
5. Run `npm run dev` to start both backend and frontend servers

### What ports does OpsHub use?
- Frontend (React): Port 5173 (default Vite dev server)
- Backend (Express API): Port 5000

### How do I configure the database?
Set the `MONGODB_URI` environment variable in `server/.env`. For example:
- Local MongoDB: `mongodb://localhost:27017/ops-tool`
- MongoDB Atlas: `mongodb+srv://<username>:<password>@cluster.mongodb.net/ops-tool`

## Authentication & Security

### What authentication methods are supported?
OpsHub supports three authentication methods:
1. **Local Authentication**: Email and password
2. **Google OAuth**: Sign in with Google account
3. **Microsoft OAuth**: Sign in with Microsoft account

### How do I set up OAuth authentication?
1. Create OAuth credentials with Google and/or Microsoft
2. Add the client IDs, secrets, and callback URLs to your `server/.env` file
3. Restart the server for changes to take effect

### What is the default admin account?
After running the seed script (`npm run seed`), you can log in with:
- Email: `admin@example.com`
- Password: `admin123`

**Important**: Change this password immediately in production environments!

### How long do authentication tokens last?
- Access tokens: 15 minutes (configurable via `JWT_EXPIRE`)
- Refresh tokens: 7 days (configurable via `JWT_REFRESH_EXPIRE`)

### Is the application secure?
Yes, OpsHub implements several security best practices:
- Password hashing with bcrypt
- JWT-based authentication with refresh tokens
- Helmet.js for HTTP header security
- CORS protection
- Role-based access control (RBAC)
- Input validation with express-validator

## User Management

### What user roles are available?
OpsHub has three user roles with different permission levels:
1. **Admin**: Full access to all features including user management
2. **Manager**: Can manage assets, view vendors, and handle onboarding
3. **Employee**: Can view assets and complete assigned onboarding tasks

### Can I change a user's role?
Yes, administrators can update user roles through the User Management interface.

### How do I deactivate a user?
Only administrators can deactivate users through the User Management section. Deactivated users cannot log in but their data is retained.

## Asset Management

### What types of assets can I track?
OpsHub can track any type of asset including:
- Hardware (laptops, monitors, phones, etc.)
- Software licenses
- Office equipment
- Vehicles
- Any other company assets

### How do QR codes work for assets?
Each asset can have a QR code generated that contains its information. You can:
- Generate QR codes via the API endpoint `/api/assets/:id/qr`
- Print QR codes and attach them to physical assets
- Scan QR codes to quickly access asset information

### Can I assign assets to users?
Yes, managers and admins can assign assets to users and track who has which equipment. Assets can also be unassigned when no longer in use by that person.

### How do I track asset maintenance?
Assets have a maintenance history feature where you can:
- Record maintenance activities
- Track maintenance dates
- Add notes about repairs or servicing

## Vendor Management

### What vendor information can I store?
You can store:
- Vendor name and contact information
- Vendor status (active/inactive)
- Contract details including dates and values
- Multiple contracts per vendor

### Who can manage vendors?
Only administrators have full access to create, update, and delete vendors. Managers can view vendor information but cannot modify it.

## Employee Onboarding

### How does the onboarding system work?
The onboarding system has two components:
1. **Templates**: Predefined checklists of onboarding tasks (created by admins)
2. **Instances**: Active onboarding processes for specific employees (started by managers)

### What is an onboarding template?
An onboarding template is a reusable checklist of tasks that new employees need to complete. Examples might include:
- Review company policies
- Set up development environment
- Complete IT security training
- Meet with team members

### Who can create onboarding templates?
Only administrators can create, update, or delete onboarding templates.

### Who can start an onboarding process?
Managers and administrators can start onboarding instances for new employees.

### Can employees track their own onboarding progress?
Yes, employees can view their assigned onboarding tasks and mark them as complete.

### Can an onboarding process be cancelled?
Yes, authorized users can cancel an onboarding instance if needed (for example, if an employee leaves before completing onboarding).

## Development

### What technology stack does OpsHub use?
**Backend:**
- Node.js with Express framework
- MongoDB with Mongoose ODM
- Passport.js for authentication
- JWT for tokens

**Frontend:**
- React 18 with Vite build tool
- Tailwind CSS for styling
- React Query (TanStack Query) for data fetching
- React Router v6 for routing
- Headless UI + Heroicons for UI components
- Recharts for data visualization

### How do I run only the backend server?
Run `npm run dev:server` from the root directory, or `npm run dev` from the `server` directory.

### How do I run only the frontend client?
Run `npm run dev:client` from the root directory, or `npm run dev` from the `client` directory.

### How do I build the application for production?
1. Run `npm run build` to build the frontend
2. Run `npm start` to start the production server
3. Set `NODE_ENV=production` in your environment variables

### Where are the API endpoints documented?
API endpoints are documented in the README.md file with details on authentication, users, assets, vendors, and onboarding endpoints.

## Troubleshooting

### The application won't start. What should I check?
1. Ensure MongoDB is running and accessible
2. Verify all environment variables are set correctly in `server/.env`
3. Check that ports 5000 and 5173 are not in use by other applications
4. Make sure all dependencies are installed with `npm run install:all`
5. Check the console for specific error messages

### I forgot my admin password. How can I reset it?
You can run the seed script again (`cd server && npm run seed`) which will recreate the default admin account, or manually update the password in the MongoDB database.

### OAuth authentication isn't working. What's wrong?
Common issues:
1. Check that OAuth credentials are correctly set in `.env`
2. Verify callback URLs match what's configured in Google/Microsoft developer consoles
3. Ensure `CLIENT_URL` is set correctly for redirects after authentication
4. Make sure the OAuth provider's credentials are not expired

### How do I report a bug or request a feature?
Check the CONTRIBUTING.md file for guidelines on how to report issues or contribute to the project.

## Best Practices

### Should I change the default JWT secrets?
Absolutely! Always use strong, random JWT secrets in production environments. Never use the example values from `.env.example` in production.

### How often should I back up the database?
Regular backups are essential. We recommend:
- Daily automated backups for production systems
- Test your backup restoration process regularly
- Keep backups in a secure, separate location

### What's the recommended user onboarding flow?
1. Admin creates appropriate onboarding templates
2. When a new employee joins, a manager creates an onboarding instance based on a template
3. Employee logs in and completes tasks as they progress
4. Manager or admin monitors progress and provides support as needed

### How should I organize assets in the system?
Best practices:
- Use consistent naming conventions
- Add detailed descriptions
- Keep maintenance records up to date
- Generate and print QR codes for physical assets
- Regularly audit asset assignments

## Deployment

### Can I deploy OpsHub to production?
Yes, OpsHub can be deployed to production environments. Recommended platforms:
- Backend: Railway, Render, AWS EC2, DigitalOcean, or any Node.js hosting service
- Frontend: Vercel, Netlify, or serve from the same backend server
- Database: MongoDB Atlas (recommended), self-hosted MongoDB

### What environment variables are required for production?
All variables from `.env.example` should be configured, with particular attention to:
- Strong JWT secrets (not the example values)
- Production MongoDB URI
- Correct CLIENT_URL and callback URLs
- `NODE_ENV=production`

### How do I serve the frontend from the backend in production?
The backend is configured to serve the built frontend files. After running `npm run build`, start the server with `npm start`, and it will serve the React app along with the API.
