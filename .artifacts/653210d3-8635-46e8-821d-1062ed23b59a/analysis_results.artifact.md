# Assignment Requirement Analysis: ITS64704

This document maps the **ITS64704 Software Testing** assignment requirements to the **TransitPro** project features.

## 1. Scope & Mapping (STP Context)

| Requirement Category | TransitPro Feature / Mapping |
| :--- | :--- |
| **Testing Levels** | |
| Unit Testing | Haversine formula (distance), AES encryption logic, Fare calculation utility. |
| Integration Testing | Android App <-> Backend API (Tap events), Frontend <-> Backend (Wallet/History). |
| System Testing | Full trip lifecycle (Tap-In/Out), Security (Encryption), Performance (GPS poll speed). |
| UAT | "Rescue Ride" scenario, Card blocking flow, Conductor shift management. |
| **System Test Categories** | |
| Security | AES-256 card encryption, JWT session management, One-device policy. |
| Usability | High-contrast UI, Privacy Mode (eye icon), Stop detection UI (Orange/Blue). |
| Performance | API response time for Taps, GPS detection accuracy threshold (50m). |
| Compatibility | Android (Bus side) vs. React Native (Passenger side) interoperability. |
| **Verification (Reviews)** | Code review of `RetrofitClient.kt`, `MainActivity.kt`, and `server.js`. |

## 2. Test Case Strategy (Traceability)

The assignment emphasizes **SRS-traceable** test cases. Since we are using the project as the SRS, here are key "Requirements" we will test:

1.  **REQ-NFC-01**: The system MUST encrypt passenger IDs using AES-256-CBC before writing to NFC cards.
2.  **REQ-GPS-02**: The system MUST detect the nearest stop with a 50m threshold.
3.  **REQ-FARE-03**: The system MUST automatically deduct the precise fare based on the Fare Matrix upon Tap-Out.
4.  **REQ-SEC-04**: The system MUST block multiple concurrent logins for the same bus conductor.
5.  **REQ-PRV-05**: The system MUST allow users to hide sensitive wallet data using Privacy Mode.

## 3. Postman Integration Plan

Postman will be used for **Integration and System Testing** of the following endpoints:
- `POST /api/bus/login`: Verify token generation and security.
- `POST /api/bus/tap`: Verify fare calculation logic and state transitions (Tap-In -> Tap-Out).
- `GET /api/bus/history`: Verify data isolation by Bus ID.

---
### Next Steps
1.  **Draft STP**: Create the full Software Test Plan document.
2.  **Generate Test Cases**: Write at least 20-30 detailed test cases covering all levels.
3.  **Simulate Execution**: Log results for the Execution Report.
