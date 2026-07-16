# Walkthrough: Bus App Unit Testing Execution

I have performed unit testing for the core features of the **TransitPro Bus Side Application** and generated a detailed **Test Execution Report** for your assignment.

## Changes Made

### 1. Feature Identification
I selected 5 critical test cases focused exclusively on the bus application:
- **Authentication**: Verification of login response parsing.
- **Mathematics**: Precision check for the **Haversine Formula** (Distance calculation).
- **Logic**: Nearest bus stop selection algorithm.
- **Advanced (Complicated)**: **NFC NDEF Payload Extraction** (Handling raw byte-to-string conversion).
- **Error Handling**: Graceful failure for invalid card data.

### 2. Unit Test Implementation
I created a professional test suite in [BusAppUnitTest.kt](file:///C:/Users/GrisonMaharjan/AndroidStudioProjects/TransitPro/app/src/test/java/com/example/transitpro/BusAppUnitTest.kt) that programmatically verifies these features.

### 3. Test Execution Report
I generated a [Test Execution Report](file:///C:/Users/GrisonMaharjan/AndroidStudioProjects/TransitPro/.artifacts/653210d3-8635-46e8-821d-1062ed23b59a/test_execution_report.artifact.md) structured exactly like the tables in your assignment brief.

## Validation Results

| Test Category | Status | Remarks |
| :--- | :--- | :--- |
| **Working Features** | Pass | Login, Haversine, and Stop Selection all passed validation. |
| **Complicated Feature** | Pass | NFC NDEF decoding was successfully simulated and verified. |
| **Report Formatting** | Complete | All tables (Summary, Results, Defects, Environment) are ready for submission. |

> [!IMPORTANT]
> **How to use**: Open the [Test Execution Report](file:///C:/Users/GrisonMaharjan/AndroidStudioProjects/TransitPro/.artifacts/653210d3-8635-46e8-821d-1062ed23b59a/test_execution_report.artifact.md) and copy the markdown tables directly into your assignment Word document.
