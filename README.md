# TransitPro: Smart NFC Transit System

TransitPro is a secure, NFC-based public transportation management system. It features an Android application for bus conductors/drivers, a React Native passenger app, and a robust Node.js backend (`nfc-backend`) that handles encrypted transaction processing, real-time tracking, and automated fare calculation.

## 🚀 Recent Updates (Development Log)

### 🆕 July 13, 2026: Multi-Route Expansion & Rebranding
*   **TransitPro Rebranding**: Successfully transitioned the entire system from "Transit Command" to **TransitPro**. Updated headers across all Android Activities and Passenger screens.
*   **Dynamic Route Allocation**: 
    *   Conductors are now assigned specific routes via the database (e.g., **0427** on Route 1, **0000** on Route 2).
    *   Android app automatically deep-populates route stops and coordinates upon login, eliminating manual selection.
*   **Enhanced Passenger Experience**:
    *   **Live Fare Calculator**: Passengers can now select pickup/drop stops on any route to see real-time estimated fares fetched from the backend.
    *   **Full Fare Matrix**: Backend now automatically generates and covers all possible intermediate stop combinations (e.g., Lagankhel to Jawalakhel), eliminating 404 errors for partial trips.
    *   **High-Performance Lookups**: Optimized fare search to query the centralized `seed-stops` collection for instant results.
    *   **Route Stop Timeline**: Added a vertical visualization of all stops on a selected route with color-coded start/end indicators.
*   **Data Integrity & Privacy**:
    *   **History Isolation**: Conductor shift logs are now strictly filtered by **Bus ID**.
    *   **Today's Logs Only**: Optimized the shift log view to only display taps from the current calendar day for better shift management.
    *   **Collection Alignment**: Integrated backend models with specific MongoDB collections like `routelocation` and `seed-stops` for perfect database structure alignment.
    *   **Unified Seeding**: Implemented `/api/seed-all` to perfectly synchronize stops, routes, and fares in a single transaction.

### 🛡️ Security & Encryption (Previous Week)
*   **Encrypted NFC ID System**: Implemented **AES-256-CBC** encryption for passenger IDs on physical NFC cards. IDs are encrypted via the backend before being written to ensure data on cards is unreadable without the system's secret key.
*   **Enhanced Authentication**: 
    *   Implemented a **Block-Strategy** single-device policy: Users can only be active on one device at a time; new logins are blocked if a session is already active.
    *   Added **Server-Side Session Revocation**: Every API request is now validated against the database to ensure the session is still active and has not been revoked.
    *   Implemented **1-Hour Session Expiration**: Automatic token expiration with database cleanup to enhance shift security.

### 🔌 Project Integration & Architecture
*   **Monorepo Restructuring**: Successfully merged the standalone bus conductor backend and passenger frontend into the main project folder.
*   **Modular Routing**: Isolated bus-specific logic under the `/api/bus` prefix to prevent conflicts with main system passenger features.
*   **Database Isolation**: Migrated all bus-related data to dedicated MongoDB collections (`bususers`, `bussessions`, `bustaps`, `bustrips`, `fares`).

### 📍 Advanced Geolocation & Tracking
*   **Haversine Precision**: Integrated the **Haversine Formula** for absolute mathematical precision in detecting the nearest bus stops and calculating trip distances.
*   **Real-Time Stop Detection**: 
    *   Added a **50m arrival threshold** with dual-state UI indicators: **Nearest Stop** (Orange) vs. **Bus at Stop** (Blue).
    *   **GPS Bug Fix**: Resolved an issue where tap-out locations would sometimes mirror tap-in data by forcing a high-accuracy fresh GPS poll at the exact moment of every tap.
*   **Dynamic Route Refresh**: Added a manual refresh button on the Routes page to allow conductors to force a GPS sync if needed.

### 💳 Transaction & Data Management
*   **Precise Fare Matrix**: Replaced distance estimates with a dedicated **Fare Matrix** system. Fares are now pulled from a database collection seeded from a real-world Sajha Yatayat price list.
*   **Automatic Balance Deduction**: The system now verifies passenger balance before Tap-In and automatically deducts the precise stage-based fare upon Tap-Out.
*   **Reward Points System**: Passengers now earn reward points based on trip fares (e.g., 2 points for fares > Rs. 30). These points build user "trust" within the system.
*   **Refined Emergency Credit**: Passengers with insufficient balance (below Rs. 18) can take a one-time "Rescue Ride" if they have 5+ reward points. The system allows a debt of up to Rs. 100, which must be cleared before the next trip.
*   **Automated ID Generation**: Passengers are now automatically assigned unique, non-replicable **UserIds** and **NFCIDs** during registration.
*   **NFC Card Blocking**: Added a remote kill-switch for lost cards. Passengers can now block their NFC card from the app (requires password verification) to prevent unauthorized use.
*   **Writer Verification**: The NFC Writer tool now verifies that a passenger exists in the main database before allowing a conductor to configure a new transit card.

### 📱 User Interface (UX)
*   **Passenger UI Restoration**: Fully restored the professional high-contrast Dashboard and Profile UI, ensuring all features (Quick Actions, Recent Activity) are functional and synced with live data.
*   **Card Management (Block NFC)**: Added a dedicated screen for managing NFC status, displaying weekly tap statistics, and allowing secure blocking/unblocking of lost cards.
*   **ID Visibility**: User and NFC IDs are now prominently displayed in the passenger profile and dashboard for easy reference.
*   **Automated Reset**: The bus conductor app now automatically resets its "Ready to Tap" state after a successful read to minimize processing errors.

## 📱 Android Features
*   **Encrypted Tapping**: Securely processes Tap-In/Out events with real-time passenger validation.
*   **NFC Tools**: Includes a secure card writer (with backend encryption) and a diagnostic NFC scanner.
*   **Reports**: Generates professional PDF trip history reports for administrative auditing.

## 🛠️ Backend Architecture (nfc-backend)
*   **Framework**: Express.js with modular route structures.
*   **Security**: JWT + Database-backed session validation.
*   **Encryption**: Node.js `crypto` for AES-256 handling.
*   **Database**: MongoDB Atlas for persistence and SQLite for local caching.

## 📦 Package Manifest (Versions)

### 1. Android App (Bus Side)
*   **Kotlin**: 2.2.10
*   **Retrofit**: 2.9.0
*   **Google Play Services Location**: 21.3.0
*   **AndroidX Core KTX**: 1.10.1

### 2. Backend (nfc-backend)
*   **Node.js**: 16+
*   **Express**: 5.2.1
*   **Mongoose (MongoDB)**: 9.7.3
*   **JSONWebToken**: 9.0.3

### 3. Passenger Frontend (nfc-frontend)
*   **Expo**: ~54.0.0 (SDK 54)
*   **React**: 19.1.0
*   **React Native**: 0.81.5
*   **Redux Toolkit**: ^2.0.0

## ⚙️ Setup & Configuration

### 🌐 Network Configuration (IP Address)
If you move between different networks (e.g., Home vs. Office), you must update the backend IP address in the following **two files** to ensure the apps can communicate with the server:

1.  **Android Bus App**:  
    `app/src/main/java/com/transitpro/nfcreader/api/RetrofitClient.kt`  
    *Update the `BASE_URL` constant.*

2.  **Passenger App (Frontend)**:  
    `nfc-frontend/src/constants/config.js`  
    *Update the IP address in the `resolveBaseUrl` function.*

### 1. Backend (.env)
```env
PORT=3000
MONGO_URI=mongodb+srv://.../nfc-system
JWT_SECRET=your_jwt_secret
```

## 🛡️ Security Measures
1.  **Card Encryption**: Plain-text IDs never touch the physical card (AES-256-CBC).
2.  **Anti-Fraud**: Mathematical Haversine verification prevents manual stop entry errors.
3.  **Session Kill**: Logging out on the app instantly invalidates the token on the server.
4.  **Device Locking**: One active session per account at any time for bus user.

---
Developed by Grison Maharjan
