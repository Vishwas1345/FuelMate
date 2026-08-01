# 🚀 FuelMate: Comprehensive Project Overview

## 1. Executive Summary
**FuelMate** is a state-of-the-art on-demand fuel delivery management system. It bridges the gap between stranded or busy vehicle owners and professional fuel delivery services. Born from a real-world struggle and evolved into a flagship academic innovation, FuelMate offers 24/7 "Fuel Intelligence" to ensure no one remains stranded without energy.

---

## 2. The Roots & Origins
### 🎬 The Origin Story
- **2024: The Spark** – Born from a personal struggle of being stranded with an empty tank during a daily commute to college. The founder had to push his vehicle miles to the nearest pump, sparking the idea: *"Why shouldn’t help come to you?"*
- **2025: The Blueprint** – The concept was formalized with system architecture, detailed planning, and initial development.
- **2026: The Revival** – FuelMate evolved into a flagship college project, turning frustration into a polished, working reality with a full engineering team.

### 🏛️ Academic Context
- **Institution**: Bhagwan Mahavir College of Computer Application (BMCCA), affiliated with **Bhagwan Mahavir University**.
- **Project Type**: Final Year Flagship Project.
- **Project Guide**: Assistant Professor **Divyarani Rauta** (10+ years of experience in Computer Science & Engineering, mentor to 100+ projects).

### 👥 The Engineering Team
- **Vishwas Tiwari**: Founder, AI/ML & Backend Engineer.
- **Sneha Tejaswi**: Team Leader & Deployment Engineer.
- **Ashish Patel**: Frontend Engineer.
- **Vishakha Mishra**: Database Engineer.
- **Krushangi Panchal**: Documentation Manager.

---

## 3. Vision & Principles
### 🎯 Mission
To ensure no one has to endure the struggle of being stranded without fuel. We strive to transform vehicle refueling from a chore into a seamless, on-demand service.

### 🔭 Vision
To become the global standard for academic innovation in logistics, demonstrating how smart technology can solve daily real-world problems.

### ⚖️ Core Values
1. **Customer Empathy**: Born from struggle, we build solutions that truly help.
2. **Sustainable Future**: Route optimization to minimize carbon footprint.
3. **Accessibility**: Bringing energy to wherever you are, whenever you need it.
4. **Student Innovation**: Pushing the boundaries of traditional logistics with fresh perspectives.

---

## 4. Feature Ecosystem
### 👤 Customer Features
- **Real-time GPS Ordering**: Pinpoint location for precise delivery.
- **Multiple Payment Options**: Secure transactions via cards, wallets, or Cash on Delivery (COD).
- **Order Tracking**: Live GPS monitoring of the delivery vehicle.
- **Vehicle Profiles**: Save multiple vehicles (cars, bikes, trucks) for quick ordering.
- **Address Book**: Save home, office, and frequent locations.
- **History & Analytics**: Track fuel consumption and spending patterns.

### 🏪 Station (Partner) Features
- **Order Management Dashboard**: Real-time incoming order tracking.
- **Operational Control**: Manage fuel prices, inventory, and delivery personnel.
- **Revenue Analytics**: Track sales and growth metrics.
- **Fleet Management**: Manage delivery trucks and drivers.

### 🚚 Delivery Personnel Features
- **Route Optimization**: Smart navigation to minimize delivery time.
- **Order Assignment**: Seamless handover from station to driver.
- **Earnings Dashboard**: Track performance and delivery bonuses.

---

## 5. The Ordering Workflow
FuelMate simplifies fuel delivery into a "3-Step Magic" process:

1. **Order Placement**: 
   - User selects fuel type (**Petrol/Diesel**).
   - Specifies quantity (liters).
   - Selects delivery location and vehicle.
   - Views a transparent bill (Fuel Cost + Platform Fee + Delivery Logistics).
2. **Real-Time Tracking**:
   - Once confirmed, the order moves from `pending` to `confirmed`.
   - The user monitors the delivery truck via a live GPS Mapbox view.
   - Status updates: `in-transit` -> `approaching` -> `arrived`.
3. **Safe Handover**:
   - Professional delivery partner arrives and refills the vehicle using certified equipment.
   - Payment is settled (if not prepaid), and the order is marked `delivered`.

---

## 6. Technology Stack
### Frontend
- **Framework**: React 18.3 (Vite).
- **Language**: TypeScript (Type safety).
- **Styling**: Tailwind CSS & Vanilla CSS for premium aesthetics.
- **UI Components**: shadcn/ui (Radix UI based).
- **Maps**: Mapbox GL.
- **State Management**: TanStack Query (React Query) & React Context.

### Backend
- **Environment**: Node.js.
- **Framework**: Express.js.
- **Database**: MongoDB (NoSQL) with Mongoose ODM.
- **Cache / In-Memory Store**: Redis (via ioredis) — OTP storage and analytics caching.
- **Authentication**: JWT (JSON Web Tokens) stored in HTTP-only cookies.
- **Encryption**: bcrypt for password hashing.
- **AI**: Gemini AI Integration (for the Customer Assistant).

---

## 7. System Architecture
The project follows a modular **Client-Server Architecture**:
- **Modular Routes**: Separation of concerns between Auth, Orders, Users, Reviews, and Chat.
- **Logging System**: Winston (Server) and loglevel (Client) for professional error tracking and audit logs.
- **Security**: Helmet.js for HTTP headers and Rate Limiter to prevent API abuse.

---

## 8. User Onboarding Flow
1. **Identity Selection**: User chooses between "I need fuel" or "I am a Fuel Partner".
2. **Data Capture**:
   - **Customer**: Name, Phone, Vehicle Details, and GPS-detected address.
   - **Station**: Business name, GSTIN, Fuel Provider (HP, Shell, etc.), and Station GPS.
3. **Profile Polish**: Image upload with a built-in cropper for professional profile photos.

---

## 9. FuelMate AI Assistant
The platform features an intelligent assistant that:
- Provides 24/7 service information.
- Explains features and the ordering workflow.
- Embeds project "Roots" (Founder, College details) into its knowledge base.
- Uses **Gemini 2.5 Flash Lite** for fast, conversational responses.

---
**Made with ❤️ by the FuelMate Team**
