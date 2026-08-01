# FuelMate System Architecture

## 1. Project Overview
**FuelMate** is an on-demand fuel delivery management system built using the MERN stack (MongoDB, Express, React, Node.js). It facilitates fuel ordering for customers and order management for fuel stations.

### Technology Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Shadcn/UI, React Query, React Router.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (with Mongoose ODM).
- **Cache / In-Memory Store**: Redis (ioredis) — OTP lifecycle and analytics caching.
- **Authentication**: JWT (JSON Web Tokens) in HTTP-only cookies.
- **External Services**: Mapbox GL (for maps/location).

## 2. High-Level Architecture
The system follows a classic Client-Server architecture.

```mermaid
graph TD
    subgraph Client ["Client Side (Vite + React)"]
        UI[User Interface]
        AuthCtx[Auth Context]
        Query[React Query / State]
    end

    subgraph Server ["Server Side (Node/Express)"]
        API[REST API Layer]
        Auth[Auth Middleware]
        Controllers[Controllers]
        Services[Business Logic Services]
    end

    subgraph Database ["Data Layer"]
        MongoDB[(MongoDB Cluster)]
        Redis[(Redis)]
    end

    UI --> AuthCtx
    AuthCtx --> API
    UI --> Query
    Query -- "HTTP Requests (Axios/Fetch)" --> API
    API --> Auth
    Auth --> Controllers
    Controllers --> Services
    Services -- "Mongoose Models" --> MongoDB
    Services -- "OTP & Analytics Cache" --> Redis
```

## 3. Database Schema
The database consists of three primary collections: `Users`, `Orders`, and `Reviews`.

```mermaid
erDiagram
    USER {
        ObjectId _id
        String email "unique, required"
        String password "hashed"
        String name
        String phone
        String address
        String role "enum: customer, station"
        Date createdAt
    }

    ORDER {
        ObjectId _id
        ObjectId userId "ref: User"
        String fuelType "enum: Petrol, Diesel"
        Number quantity
        String brand
        String selectedStation
        String deliveryAddress
        String paymentMethod
        Number totalPrice
        String status "enum: pending, confirmed, in-transit, delivered, cancelled"
        Object driver "name, phone, email, location"
        Date estimatedDelivery
        Date createdAt
        Date updatedAt
    }

    REVIEW {
        ObjectId _id
        String email
        String name
        String message
        Number rating
        Boolean isApproved
        Date createdAt
    }

    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
```

## 4. System Workflows

### 4.1. Authentication Flow
Authentication is handled via JWT stored in HTTP-only cookies.

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (Frontend)
    participant S as Server (Backend)
    participant DB as MongoDB

    Note over U, C: Login Process
    U->>C: Enter Email & Password
    C->>S: POST /api/auth/login
    S->>DB: Find User by Email
    DB-->>S: User Document
    S->>S: Compare Password (bcrypt)
    
    alt Success
        S->>S: Generate JWT Access Token
        S-->>C: 200 OK + Set-Cookie (token, httpOnly)
        C->>U: Redirect to Dashboard
    else Failure
        S-->>C: 401 Unauthorized
        C->>U: Show Error
    end
```

### 4.2. Order Creation Flow
Customers place orders which are then received by the backend.

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as Frontend
    participant API as Backend API
    participant DB as Database

    C->>FE: Fill Order Form (Fuel Type, Qty, Station)
    FE->>API: POST /api/orders/create
    API->>API: Validate Request
    API->>DB: Save New Order (Status: pending)
    DB-->>API: Saved Order
    API-->>FE: Order Confirmation
    FE->>C: specific Order ID / Success Message
```

## 5. Directory Structure

### Root `c:\FuelMate`

#### Server (`/server`)
- **Controllers** (`/controllers`): Handle incoming HTTP requests and responses.
- **Services** (`/services`): Contain business logic (separation of concerns).
- **Models** (`/models`): Mongoose schema definitions (`User`, `Order`, `Review`).
- **Routes** (`/routes`): API route definitions mapping endpoints to controllers.
- **Middleware** (`/middleware`): Auth checks, error handling.

#### Client (`/client`)
- **Pages** (`/pages`): Top-level route components.
  - `Home`, `Features`, `About`, `Contact`: Public marketing pages.
  - `Index` (`/dashboard`, `/customer`): Customer Dashboard.
  - `StationDashboard` (`/station`): Fuel Station Dashboard.
  - `Auth`: Login/Signup page.
- **Components** (`/components`): Reusable UI elements (Shadcn/UI based).
- **Contexts** (`/contexts`): Global state (e.g., `AuthContext`).
- **Hooks** (`/hooks`): Custom React hooks.
- **App.tsx**: Main application component with Routing configuration.

## 6. API Endpoints Overview
Based on the route files analysis:

### Auth Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login and receive JWT
- `POST /logout` - Logout (clear cookies)
- `POST /refresh-token` - Refresh access token
- `GET /profile` - Get current user profile (Protected)

### Order Routes (`/api/orders`)
- `GET /` - Get active orders for the authenticated user
- `POST /` - Create a new order
- `GET /history` - Get order history
- `GET /:orderId` - Get specific order details
- `PATCH /:orderId/status` - Update order status (used by Station/Driver)

### Review Routes (`/api/reviews`)
- `GET /` - Get all approved reviews
- `POST /` - Submit a new review

## 7. Redis Integration

Redis is used as a fast, expiry-aware layer alongside MongoDB. The client (`server/lib/redis.js`) uses **ioredis** with exponential retry and `enableOfflineQueue: false` so the app degrades gracefully if Redis is unavailable.

### 7.1. OTP Storage

Email verification OTPs are stored entirely in Redis — the `User` document holds no OTP state.

| Key pattern | `otp:<email>` |
|---|---|
| Type | Redis Hash (`hash`, `attempts`) |
| TTL | 10 minutes (auto-expired by Redis) |
| Max attempts | 5 |

```mermaid
sequenceDiagram
    participant U as User
    participant S as Server
    participant R as Redis
    participant DB as MongoDB
    participant M as Mail

    Note over U,M: Registration
    U->>S: POST /api/auth/register
    S->>DB: Create User (isEmailVerified: false)
    S->>R: HSET otp:email {hash, attempts:0}  EX 600
    S->>M: Send OTP email
    S-->>U: 201 requiresVerification: true

    Note over U,M: Verification
    U->>S: POST /api/auth/verify-email {email, otp}
    S->>R: HGETALL otp:email
    R-->>S: {hash, attempts}
    S->>S: bcrypt.compare(otp, hash)
    alt OTP correct
        S->>R: DEL otp:email
        S->>DB: user.isEmailVerified = true
        S-->>U: 200 + JWT tokens
    else OTP wrong
        S->>R: HINCRBY otp:email attempts 1
        S-->>U: 400 Invalid code (N attempts left)
    end
```

### 7.2. Analytics Caching

The `GET /api/analytics` response is cached in Redis to avoid scanning all delivered orders on every dashboard load.

| Key pattern | `analytics:<userId>` |
|---|---|
| Type | Redis String (JSON) |
| TTL | 5 minutes |
| Invalidation | Immediately on order status → `delivered` |

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant R as Redis
    participant DB as MongoDB

    C->>S: GET /api/analytics
    S->>R: GET analytics:userId
    alt Cache hit
        R-->>S: Cached JSON
        S-->>C: 200 (response in ~0.2ms)
    else Cache miss
        R-->>S: nil
        S->>DB: Aggregate all delivered orders
        DB-->>S: Orders data
        S->>R: SET analytics:userId JSON  EX 300
        S-->>C: 200 (response from DB)
    end

    Note over C,DB: When a delivery is completed
    C->>S: PATCH /api/orders/:id/status {status: "delivered"}
    S->>DB: Update order status
    S->>R: DEL analytics:customerId
    S->>R: DEL analytics:stationId
    Note over R: Next dashboard load gets fresh data
```
