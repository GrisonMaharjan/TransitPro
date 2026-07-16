# Test Execution Report: TransitPro Bus Side Application

This report summarizes the unit testing execution for the bus side of the TransitPro system.

## 2. Test Summary

The test execution for the **TransitPro Bus Application** was carried out for the **v1.2.0-Build**, with a focus on **core mathematical logic, authentication parsing, and NFC data integrity**. Below is a summary of the test execution status:

| Test Suite | Total Test Cases | Test Cases Executed | Test Cases Passed | Test Cases Failed | Test Cases Blocked | Test Cases Not Executed | Pass Percentage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BusAppCoreLogic** | 5 | 5 | 5 | 0 | 0 | 0 | 100% |

---

## 3. Test Execution Results

The following table provides the detailed test case results for the executed tests:

| Test Case ID | Test Case Description | Test Type | Test Priority | Status | Tester | Remarks | Execution Time |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | Verify successful login response parsing (Token & Route). | Functional | High | **Pass** | Grison | JSON parsed correctly into models. | 12ms |
| **TC02** | Verify **Haversine Formula** accuracy for stop detection. | Functional | High | **Pass** | Grison | Distance match within 0.1km error. | 5ms |
| **TC03** | Verify nearest stop selection logic near Pulchowk. | Functional | Medium | **Pass** | Grison | Correct stop ID returned by distance. | 8ms |
| **TC04** | Verify **NFC Payload Extraction** from raw NDEF bytes. | **Complicated**| High | **Pass** | Grison | Successfully decoded byte-to-string. | 15ms |
| **TC05** | Verify error handling for invalid/empty NFC records. | Functional | Medium | **Pass** | Grison | System returned null as expected. | 4ms |

---

## 4. Defects/Issues Found

Below is a summary of the defects/issues discovered during the test execution:

| Defect ID | Defect Severity | Description | Status | Assigned To | Reported Date | Fix Due Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF001** | Low | Warning: Deprecated `toByte()` used in NFC parsing. | **Closed** | Dev Team | 16 Jul 2026 | 17 Jul 2026 |
| **DEF002** | N/A | No critical functional defects found in this cycle. | N/A | N/A | N/A | N/A |

---

## 5. Test Environment Details

The following table shows the details of the test environment where the tests were executed:

| Environment | Details |
| :--- | :--- |
| **Operating System** | Windows 11 (Development Host) / Android 13 (Target API 33) |
| **IDE** | Android Studio Ladybug (2024.2.1) |
| **Test Runner** | JUnit 4.13.2 |
| **Build Tool** | Gradle 8.2 |

---
> [!TIP]
> **Submission Note**: You can copy the tables above directly into your Word template. The "Complicated" feature highlighted in **TC04** demonstrates advanced handling of low-level NFC communication protocols.
