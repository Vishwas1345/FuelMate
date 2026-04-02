# 🚀 FuelMate - On-Demand Fuel Delivery System

[License: MIT](https://opensource.org/licenses/MIT)
[Node.js](https://nodejs.org/)
[React](https://reactjs.org/)
[TypeScript](https://www.typescriptlang.org/)

FuelMate is a comprehensive on-demand fuel delivery management system built with the MERN stack. It provides a seamless platform connecting customers, fuel stations, and delivery personnel for efficient fuel delivery services.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Challenges and solutions](#challenges-and-solutions)
- [Future enhancements](#future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Customer Features

- 🔐 User authentication and authorization
- 📍 Real-time location-based fuel ordering
- 💳 Multiple payment options
- 📱 Order tracking and history
- ⭐ Rating and review system
- 🔔 Push notifications for order updates

### Station Features

- 📊 Dashboard with analytics
- 📦 Order management system
- 👥 Delivery personnel management
- 📈 Revenue tracking
- 📍 Service area management

### Delivery Personnel Features

- 🗺️ Route optimization
- 📋 Order assignment and tracking
- 💰 Earnings dashboard
- 📊 Performance metrics

### Admin Features

- 👨‍💼 User management
- 🏪 Station management
- 📊 System-wide analytics
- 🔧 Configuration management

## 🛠️ Tech Stack

### Frontend

- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Recharts** - Data visualization
- **Mapbox GL** - Interactive maps

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Winston** - Professional logging with file rotation

### DevOps & Tools

- **ESLint** - Code linting
- **Nodemon** - Auto-restart server
- **Git** - Version control
- **loglevel** - Client-side logging

## 📁 Project Structure

```
Fuel-Mate/
├── 📂 public/                    # Static assets
│   ├── favicon.ico              # App favicon
│   └── robots.txt               # SEO robots file
│
├── 📂 server/                    # Backend application
│   ├── 📂 controllers/          # Request handlers
│   ├── 📂 middleware/           # Custom middleware
│   ├── 📂 models/               # Mongoose schemas
│   ├── 📂 routes/               # API routes
│   ├── 📂 lib/                  # Utilities and helpers
│   ├── index.js                 # Database connection
│   └── server.js                # Express server setup
│
├── 📂 src/                       # Frontend application
│   ├── 📂 components/           # React components
│   │   ├── 📂 ui/               # shadcn/ui components
│   │   └── ...                  # Custom components
│   ├── 📂 contexts/             # React contexts
│   ├── 📂 hooks/                # Custom React hooks
│   ├── 📂 lib/                  # Utilities
│   ├── 📂 models/               # TypeScript types/interfaces
│   ├── 📂 pages/                # Page components
│   ├── 📂 routes/               # Route configurations
│   ├── 📂 services/             # API services
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
│
├── 📄 .env                       # Environment variables (not in git)
├── 📄 .gitignore                # Git ignore rules
├── 📄 components.json           # shadcn/ui config
├── 📄 eslint.config.js          # ESLint configuration
├── 📄 index.html                # HTML template
├── 📄 package.json              # Dependencies and scripts
├── 📄 postcss.config.js         # PostCSS configuration
├── 📄 tailwind.config.ts        # Tailwind CSS config
├── 📄 tsconfig.json             # TypeScript config
├── 📄 tsconfig.app.json         # App TypeScript config
├── 📄 tsconfig.node.json        # Node TypeScript config
├── 📄 vite.config.ts            # Vite configuration
└── 📄 README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Git**

### Installation

1. **Clone the repository**
  ```bash
   git clone https://github.com/Vishwas1345/Fuel-Mate.git
   cd Fuel-Mate
  ```
2. **Install dependencies**
  ```bash
   npm install
  ```
3. **Set up environment variables**
  ```bash
   # Create .env file in the root directory
   cp .env.example .env
   # Edit .env with your configuration
  ```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/fuelmate
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fuelmate

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Mapbox (for maps)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Payment Gateway (if applicable)
PAYMENT_API_KEY=your_payment_api_key

# Logging Configuration
LOG_LEVEL=debug              # Server: error, warn, info, http, debug
VITE_LOG_LEVEL=debug         # Client: trace, debug, info, warn, error
```

## 📝 Logging

FuelMate uses professional logging libraries for both client and server:

### Server Logging (Winston)

- **Colored console output** for easy debugging
- **Daily rotating log files** in `server/logs/`
- **Separate error logs** for quick issue identification
- **Automatic exception handling**

### Client Logging (loglevel)

- **Colored browser console** output
- **Timestamp formatting**
- **Helper methods** for API calls, components, and actions
- **Dynamic log level** changes

### Quick Start

**Server:**

```javascript
import logger from './utils/logger.js';

logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error: err.message });
```

**Client:**

```typescript
import logger from '@/utils/logger';

logger.info('Component mounted');
logger.api('POST', '/api/orders', { orderId: '123' });
```

### Documentation

- 📖 **Full Guide**: See `LOGGER_USAGE.md` for comprehensive documentation
- 🚀 **Quick Reference**: See `LOGGER_SETUP.md` for setup summary
- 💡 **Examples**: Check `server/examples/` and `client/examples/`

### Log Files (Server)

Logs are saved to `server/logs/`:

- `application-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Errors only
- `exceptions-YYYY-MM-DD.log` - Uncaught exceptions
- `rejections-YYYY-MM-DD.log` - Unhandled rejections

```

## 🏃 Running the Application

### Development Mode

**Run Frontend (Vite Dev Server)**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

**Run Backend (Node.js Server)**

```bash
npm run server:dev
```

The backend API will be available at `http://localhost:5000`

**Run Both Concurrently**

```bash
# In separate terminals:
# Terminal 1:
npm run dev

# Terminal 2:
npm run server:dev
```

### Production Mode

**Build Frontend**

```bash
npm run build
```

**Run Backend**

```bash
npm run server
```

**Preview Production Build**

```bash
npm run preview
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Order Endpoints

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### User Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Challenges and solutions

FuelMate sits between **customers, stations, and field delivery**, so several design tensions show up in the product and codebase:


| Challenge                                                                                                                                                            | Solution                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identity and trust on signup** — email accounts need to be real before users order fuel or stations go live.                                                       | **Email OTP** for local registration (bounded attempts, resend + expiry), **Google OAuth** for verified-email sign-in, and **JWT + httpOnly refresh** so sessions stay usable without exposing long-lived tokens in JS.                                                            |
| **One product, two roles (and one data model)** — customers and stations share auth and listings but need different profiles, dashboards, and permissions.           | A **single `User` collection** with `role` (`customer` / `station`) and role-specific fields; **stations are users** referenced by `stationId` on orders so analytics and listings stay consistent.                                                                                |
| **Analytics when history is thin or APIs partial** — charts and “insights” break if there are no delivered orders or missing profile fragments (e.g. pump location). | **Server-side aggregates** where possible, **client fallbacks** rebuilt from delivered orders, **defensive UI** (optional chaining / placeholders), and **rules-based dashboard copy** instead of hard-coded fake AI so messaging tracks real data.                                |
| **OAuth hijacking the whole browser tab** — a full redirect to Google pulls users out of sign-up context and feels heavy.                                            | **Popup-based Google sign-in** (`window.open` to `/api/auth/google`), `**postMessage`** from `/auth/callback` back to the opener, then the **main tab** finishes login; refresh cookies still work because they are scoped to the **API host**, not the window.                    |
| **Deliverability and local development** — OTP and notifications must send in production but engineers often lack mail infra locally.                                | Central `**mailService`** using **SendGrid** when `**SENDGRID_API_KEY`** is set; **clear logging / safe fallbacks** when mail is disabled so verification flows remain testable without leaking secrets in responses.                                                              |
| **Short-lived access tokens vs smooth UX** — aggressive access JWT expiry improves security but breaks tabs mid-session.                                             | `**POST /api/auth/refresh-token`** with **httpOnly refresh cookies** (and optional stored refresh fallback), plus a **fetch layer** that only retries with refresh on **protected** routes—not on login/register/verify, so bad credentials are not mistaken for expired sessions. |
| **Onboarding fatigue for returning users** — new flows should not repeat after every login or OAuth return.                                                          | `**isProfileComplete`** on the user record plus a **per-user “onboarding seen”** flag in **localStorage** so first-time signups see setup once, while **returning** users go straight to the customer or station dashboard.                                                        |


## Future enhancements

Short-term and longer-term directions that would deepen FuelMate without changing the core MERN shape of the product:

- **Payments and fulfilment** — Integrate a real **payment gateway** (UPI / cards) with webhooks for settlement status, plus **SMS or WhatsApp** order updates so customers and drivers are notified outside the browser.
- **Operations** — **Driver mobile app or PWA** with GPS pings, **dispatch rules** (auto-assign, SLA alerts), and **inventory / bowser** checks so stations cannot oversell capacity in peak windows.
- **Trust and scale** — **KYC-lite for stations**, richer **review moderation**, **admin console** for disputes and pricing audits, and **horizontal scaling** (job queues for mail/analytics, read replicas, or caching hot station lists).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vishwas**

- GitHub: [@Vishwas1345](https://github.com/Vishwas1345)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [MongoDB](https://www.mongodb.com/) for the database

---

**Made with ❤️ by Vishwas**