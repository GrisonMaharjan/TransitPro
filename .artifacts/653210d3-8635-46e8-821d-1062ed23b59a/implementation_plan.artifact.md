# Implementation Plan: ITS64704 Software Testing Assignment

This plan outlines the steps to produce the required Software Test Plan (STP) and Test Execution Report for the TransitPro project, adhering to the ITS64704 assignment requirements.

## User Review Required

> [!IMPORTANT]
> The assignment requires "derived from the SRS". Since I don't have a formal SRS document, I will use the current project's features and `README.md` as the source of truth for requirements.
>
> [!NOTE]
> I will generate the content in Markdown format, which you can then copy into the provided Word templates for the final PDF submission.

## Proposed Changes

### 1. Research & Analysis
- [ ] Finalize mapping of TransitPro features to Testing Levels (Unit, Integration, System, UAT).
- [ ] Identify key System Test categories relevant to TransitPro (Security, Usability, Performance, Compatibility).

### 2. Software Test Plan (STP) [NEW] [SoftwareTestPlan.md](file:///C:/Users/GrisonMaharjan/AndroidStudioProjects/TransitPro/docs/testing/SoftwareTestPlan.md)
- [ ] **Overview & Context**: Define scope, in/out features.
- [ ] **Test Strategy**: Define entry/exit criteria for Unit, Integration, System, and UAT.
- [ ] **Test Management**: Define roles (Conductor, Passenger, Admin) and RACI.
- [ ] **Schedule**: Draft a realistic timeline for testing.

### 3. Test Case Development [NEW] [TestCases.md](file:///C:/Users/GrisonMaharjan/AndroidStudioProjects/TransitPro/docs/testing/TestCases.md)
- [ ] **Unit Tests**: Focus on critical logic (Haversine formula, AES encryption).
- [ ] **Integration Tests**: Focus on API interactions (Postman tests).
- [ ] **System Tests**:
    - Security (Unauthorized access, data encryption).
    - Usability (UI indicators, privacy mode).
    - Performance (Tap response time).
- [ ] **UAT**: End-to-end trip flow (Tap-In -> Travel -> Tap-Out).

### 4. Test Execution & Reporting [NEW] [TestExecutionReport.md](file:///C:/Users/GrisonMaharjan/AndroidStudioProjects/TransitPro/docs/testing/TestExecutionReport.md)
- [ ] Run unit tests (where possible).
- [ ] Simulate API tests using the provided endpoints.
- [ ] Log results, calculate pass rates, and document defects (simulated or real).

## Verification Plan

### Automated Tests
- Run `gradlew test` for Unit tests in the Android app.
- (Optional) Use a Node.js test runner for backend integration tests.

### Manual Verification
- Verify that all test cases trace back to the project features mentioned in `README.md`.
