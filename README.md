# TransitPro: Smart NFC Transit System

TransitPro is a comprehensive NFC-based transit management system designed to modernize public transportation. It consists of an Android application for bus conductors/drivers and a robust Node.js backend for secure transaction processing and real-time tracking.

## Key Features

### Android Application
*   **NFC Tap Processing**: Real-time reading of passenger transit cards to handle "Tap-In" and "Tap-Out" events.
*   **Dynamic Fare Calculation**: Automatically calculates fares based on distance traveled using the **Haversine Formula**.
*   **GPS Tracking & Stop Detection**: Identifies the nearest bus stop dynamically. When the bus is within 10 meters of a stop, the UI updates to show the bus has reached that location.
*   **NFC Tools**: Includes an NFC Scanner to read card data and an NFC Writer to configure new passenger IDs.
*   **Secure Authentication**: Strict single-device login policy. Logging in on a new device automatically invalidates the session on the previous device.
*   **History & Reports**: View a detailed log of all transactions and export them as professional PDF documents.

### Backend System
*   **Secure API**: RESTful API built with Express.js, protected by JWT (JSON Web Tokens).
*   **Session Management**: Database-backed session tracking that records every login and logout with timestamps.
*   **Server-Side Revocation**: Provides the ability to instantly kill a session, enhancing security against token theft.
*   **Audit Trail**: Maintains logs of all passenger taps and bus movements for administrative review.

## Architecture & Technology Stack

### Frontend (Android)
*   **Language**: Kotlin
*   **Networking**: Retrofit 2 & OkHttp 3
*   **Location**: Google Play Services (Fused Location Provider)
*   **NFC**: Android NFC Adapter (NDEF & Tech Discovered)
*   **UI**: Material Design, CardViews, Lottie-style animations, and RecyclerViews.

### Backend
*   **Environment**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Atlas) with Mongoose ODM
*   **Security**: JWT for stateless auth with database-side validation.

## System Requirements
*   **Android**: Device with NFC hardware support and Android 8.0 (Oreo) or higher.
*   **Server**: Node.js 16+ and a MongoDB cluster.

## Setup & Installation

### Backend Setup
1.  Navigate to the `backend/` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in `.env`:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    PORT=5000
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```

### Android App Setup
1.  Open the project in Android Studio.
2.  Configure the API endpoint in `RetrofitClient.kt`:
    ```kotlin
    private const val BASE_URL = "http://your_server_ip:5000/"
    ```
3.  Ensure the Android device and the server are on the same network (or use a public URL/tunnel).
4.  Build and Run the application.

## Project Structure
*   `app/src/main/java/.../nfcreader/`
    *   `MainActivity.kt`: Core NFC reading and tap logic.
    *   `RoutesActivity.kt`: Real-time tracking and stop detection.
    *   `HistoryActivity.kt`: Transaction logs and PDF generation.
    *   `SettingsActivity.kt`: App configuration and NFC Scanner.
    *   `NfcWriteActivity.kt`: Passenger ID configuration tool.
*   `backend/`
    *   `middleware/auth.js`: Security gatekeeper for API calls.
    *   `routes/auth.js`: Handles Login/Logout and session invalidation.
    *   `routes/taps.js`: Processes transit transactions.
    *   `models/Session.js`: Database schema for tracking active devices.

## Security Measures
*   **Single Device Policy**: Prevents concurrent logins with the same ID.
*   **Database Validation**: Validates the token's active status in the database on every request, allowing for immediate session revocation.
*   **Haversine Precision**: Prevents fare fraud by using mathematical geolocation validation instead of relying solely on user-reported stops.

---
Developed by Grison Maharjan
