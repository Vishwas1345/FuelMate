# FuelMate API Testing Guide

This document provides curl commands to test all FuelMate backend API endpoints.

**Base URL:** `http://localhost:3000/api`

---

## Table of Contents
- [Authentication Routes](#authentication-routes)
- [User Routes](#user-routes)
- [Order Routes](#order-routes)
- [Review Routes](#review-routes)
- [Contact Routes](#contact-routes)

---

## Authentication Routes

### 1. Register a New User
**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Doe\",
    \"email\": \"john.doe@example.com\",
    \"password\": \"SecurePass123\",
    \"phone\": \"+1234567890\",
    \"role\": \"customer\"
  }"
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"john.doe@example.com\",
    \"password\": \"SecurePass123\"
  }"
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Get User Profile (Protected)
**Endpoint:** `GET /api/auth/profile`

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    ...
  }
}
```

---

### 4. Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"YOUR_REFRESH_TOKEN_HERE\"
  }"
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Logout
**Endpoint:** `POST /api/auth/logout`

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"YOUR_REFRESH_TOKEN_HERE\"
  }"
```

**Expected Response:**
```json
{
  "message": "Logout successful"
}
```

---

## User Routes

### 1. Get User Profile (Protected)
**Endpoint:** `GET /api/users/profile`

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "customer",
    ...
  }
}
```

---

### 2. Update User Profile (Protected)
**Endpoint:** `PUT /api/users/profile`

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Updated\",
    \"phone\": \"+9876543210\",
    \"address\": {
      \"street\": \"123 Main St\",
      \"city\": \"New York\",
      \"state\": \"NY\",
      \"zipCode\": \"10001\",
      \"country\": \"USA\"
    }
  }"
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Order Routes

### 1. Get All User Orders (Protected)
**Endpoint:** `GET /api/orders`

```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "orders": [
    {
      "_id": "...",
      "userId": "...",
      "fuelType": "Petrol",
      "quantity": 20,
      "status": "pending",
      ...
    }
  ]
}
```

---

### 2. Create a New Order (Protected)
**Endpoint:** `POST /api/orders`

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{
    \"fuelType\": \"Petrol\",
    \"quantity\": 20,
    \"deliveryAddress\": {
      \"street\": \"123 Main St\",
      \"city\": \"New York\",
      \"state\": \"NY\",
      \"zipCode\": \"10001\",
      \"coordinates\": {
        \"lat\": 40.7128,
        \"lng\": -74.0060
      }
    },
    \"scheduledTime\": \"2026-02-02T10:00:00Z\",
    \"vehicleDetails\": {
      \"type\": \"Car\",
      \"model\": \"Toyota Camry\",
      \"licensePlate\": \"ABC123\"
    }
  }"
```

**Expected Response:**
```json
{
  "message": "Order created successfully",
  "order": { ... }
}
```

---

### 3. Get Order History (Protected)
**Endpoint:** `GET /api/orders/history`

```bash
curl -X GET http://localhost:3000/api/orders/history \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "orders": [
    {
      "_id": "...",
      "status": "completed",
      "completedAt": "2026-02-01T15:30:00Z",
      ...
    }
  ]
}
```

---

### 4. Get Specific Order by ID (Protected)
**Endpoint:** `GET /api/orders/:orderId`

```bash
curl -X GET http://localhost:3000/api/orders/ORDER_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "order": {
    "_id": "ORDER_ID_HERE",
    "userId": "...",
    "fuelType": "Petrol",
    "quantity": 20,
    "status": "pending",
    ...
  }
}
```

---

### 5. Update Order Status (Protected)
**Endpoint:** `PATCH /api/orders/:orderId/status`

```bash
curl -X PATCH http://localhost:3000/api/orders/ORDER_ID_HERE/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"in-progress\"
  }"
```

**Possible Status Values:**
- `pending`
- `confirmed`
- `in-progress`
- `completed`
- `cancelled`

**Expected Response:**
```json
{
  "message": "Order status updated successfully",
  "order": { ... }
}
```

---

## Review Routes

### 1. Get All Approved Reviews (Public)
**Endpoint:** `GET /api/reviews`

```bash
curl -X GET http://localhost:3000/api/reviews
```

**Expected Response:**
```json
{
  "reviews": [
    {
      "_id": "...",
      "userId": "...",
      "userName": "John Doe",
      "rating": 5,
      "comment": "Excellent service!",
      "status": "approved",
      "createdAt": "2026-02-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Create a New Review (Public)
**Endpoint:** `POST /api/reviews`

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Jane Smith\",
    \"email\": \"jane.smith@example.com\",
    \"rating\": 5,
    \"comment\": \"Amazing service! Fast delivery and professional staff.\",
    \"orderId\": \"ORDER_ID_HERE\"
  }"
```

**Expected Response:**
```json
{
  "message": "Review submitted successfully and is pending approval",
  "review": { ... }
}
```

---

## Contact Routes

### 1. Send Contact Message (Public)
**Endpoint:** `POST /api/contact`

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Alice Johnson\",
    \"email\": \"alice.johnson@example.com\",
    \"subject\": \"Inquiry about services\",
    \"message\": \"I would like to know more about your fuel delivery services in my area.\"
  }"
```

**Expected Response:**
```json
{
  "message": "Email sent successfully"
}
```

---

## Testing Workflow

### Step 1: Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Test123\",\"phone\":\"+1234567890\",\"role\":\"customer\"}"
```

### Step 2: Login and Save Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123\"}"
```

**Copy the `token` from the response and use it in subsequent requests.**

### Step 3: Create an Order (Replace YOUR_ACCESS_TOKEN_HERE)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"fuelType\":\"Petrol\",\"quantity\":20,\"deliveryAddress\":{\"street\":\"123 Main St\",\"city\":\"NYC\",\"state\":\"NY\",\"zipCode\":\"10001\"}}"
```

### Step 4: Get All Orders
```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Step 5: Create a Review
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"rating\":5,\"comment\":\"Great service!\"}"
```

---

## Notes

1. **Authentication Required**: Routes marked as **(Protected)** require a valid JWT token in the `Authorization` header.
2. **Token Format**: Use `Bearer YOUR_TOKEN` format in the Authorization header.
3. **Content-Type**: Always include `Content-Type: application/json` header for POST/PUT/PATCH requests.
4. **Replace Placeholders**: 
   - `YOUR_ACCESS_TOKEN_HERE` - Replace with actual JWT token from login
   - `YOUR_REFRESH_TOKEN_HERE` - Replace with actual refresh token from login
   - `ORDER_ID_HERE` - Replace with actual order ID from database

---

## Health Check

Test if the server is running:

```bash
curl -X GET http://localhost:3000/
```

**Expected Response:**
```json
{
  "message": "FuelMate API is running 🚀"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "No token provided" 
}
```

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong!",
  "error": "Error details (in development mode)"
}
```

---

**Last Updated:** February 1, 2026  
**API Version:** 1.0  
**Server Port:** 3000
