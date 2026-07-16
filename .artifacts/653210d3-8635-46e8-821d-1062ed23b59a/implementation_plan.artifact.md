# Implementation Plan: Bus App Unit Testing & Execution Report

This plan focuses on performing unit testing for the **TransitPro Bus Side Application** only, identifying 3 working features and 1 complicated feature.

## User Review Required

> [!NOTE]
> I will generate a comprehensive **Test Execution Report** in Markdown format, structured exactly like the tables in your provided screenshots. You can easily copy this into a Word/Doc file for your final submission.

## Proposed Changes

### 1. Research & Feature Identification
- [x] **Working Feature 1**: Bus Conductor Login (Authentication logic).
- [x] **Working Feature 2**: Haversine Formula (GPS distance calculation accuracy).
- [x] **Working Feature 3**: Route Data Loading (JSON parsing and state initialization).
- [x] **Complicated Feature**: Encrypted NFC Payload Extraction (Handling NDEF records and byte-to-string conversion).

### 2. Unit Test Implementation
- [ ] Create `BusAppUnitTest.kt` in `app/src/test/java/com/example/transitpro/` to programmatically verify the features.
- [ ] Implement tests for:
    - `haversine` accuracy checks.
    - Login response model parsing.
    - NDEF payload decoding simulation.

### 3. Test Execution & Reporting
- [ ] Execute the tests and capture results (Pass/Fail/Time).
- [ ] Generate the **Test Summary** table.
- [ ] Generate the **Test Execution Results** table (TC01-TC05).
- [ ] Generate the **Defects/Issues Found** table.
- [ ] Generate the **Test Environment Details** table.

## Verification Plan

### Automated Tests
- Run the newly created `BusAppUnitTest.kt` using `gradlew test`.
- Verify all assertions pass for the "working" features.
