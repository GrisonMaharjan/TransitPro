# TransitPro: Smart NFC Transit System

TransitPro is a secure, NFC-based public transportation management system. It features an Android application for bus conductors/drivers and a robust Node.js backend (`nfc-backend`) that handles encrypted transaction processing, real-time tracking, and automated fare calculation.

## 🚀 Recent Updates (Weekly Log)

This week, the system underwent significant security and architecture upgrades:

*   **🛡️ Encrypted NFC Ecosystem**: Implemented **AES-256-CBC** encryption for passenger IDs. Data written to physical cards is now secure and unreadable without backend keys.
*   **🔌 Backend Integration**: Successfully merged the standalone bus backend into the main `NFC-CAPSTONE` project. All transit logic is now modularized under the `/api/bus` prefix.
*   **🔒 Strict Session Security**: 
    *   Implemented a **Block-Strategy** single-device policy (one active login per bus).
    *   Added a strict **1-hour session expiration** to ensure security during shifts.
    *   Enabled **Server-Side Revocation**, validating every API request against the database active-session status.
*   **📍 Dynamic Route Tracking**: 
    *   Upgraded the Routes UI with dual-state tracking.
    *   Added a **Nearest Stop** indicator (Orange) and a **Bus at Stop** arrival status (Blue, 50m threshold).
    *   Optimized GPS polling with the **Haversine Formula** for mathematical precision.
*   **📝 Passenger ID System**: 
    *   Automated unique **UserId** and **NFCID** generation during passenger registration.
    *   Integrated passenger verification into the NFC Writer to prevent configuring cards for non-existent users.
*   **🏗️ Database Isolation**: Created dedicated MongoDB collections (`bususers`, `bussessions`, `bustaps`, `bustrips`) to ensure total data separation from the main system.

## 📱 Android Features
*   **Encrypted Tapping**: Securely processes Tap-In/Out events with real-time passenger validation.
*   **Intelligent UI**: Home screen automatically resets after taps to minimize conductor error.
*   **NFC Tools**: Includes a secure card writer (with backend encryption) and a diagnostic NFC scanner.
*   **Reports**: Generates professional PDF trip history reports for administrative auditing.

## 🛠️ Backend Architecture (nfc-backend)
*   **Framework**: Express.js with a modular route structure.
*   **Security**: JWT for stateless authentication + Database-backed session validation.
*   **Encryption**: Node.js `crypto` module for AES-256 handling.
*   **Database**: MongoDB Atlas for persistence and SQLite for local caching.

## 📋 System Requirements
*   **Android**: NFC-enabled device running Android 8.0+.
*   **Server**: Node.js 16+ and access to the `nfc-system` MongoDB cluster.

## 📂 Project Structure
*   **`app/`**: Android application for bus conductors/drivers (Kotlin).
*   **`nfc-backend/`**: Integrated Node.js backend for all transit logic and passenger management.
*   **`nfc-frontend/`**: React Native / Expo application for passenger wallet management and registration.

## ⚙️ Setup & Configuration

### 1. Backend (.env)
```env
PORT=3000
MONGO_URI=mongodb+srv://.../nfc-system
JWT_SECRET=your_jwt_secret
NFC_ENCRYPTION_KEY=your_aes_key
```

### 2. Android App (RetrofitClient.kt)
```kotlin
private const val BASE_URL = "http://your_server_ip:3000/"
```

## 🛡️ Security Measures
1.  **Card Encryption**: Plain-text IDs never touch the physical card.
2.  **Anti-Fraud**: Mathematical Haversine verification prevents manual stop entry errors.
3.  **Session Kill**: Logging out on the app instantly invalidates the token on the server.

---
Developed by Grison Maharjan
