import Foundation
import CoreNFC
import UIKit

protocol NFCServicing {
    func scanAndProcess(currentBalance: Decimal) async throws -> NFCPaymentResult
}

enum NFCServiceError: LocalizedError {
    case unavailable
    case insufficientBalance
    case cancelled

    var errorDescription: String? {
        switch self {
        case .unavailable:
            return "NFC is unavailable on this device or build. Please use an NFC-capable iPhone."
        case .insufficientBalance:
            return "Insufficient balance. Please top up your wallet and try again."
        case .cancelled:
            return "NFC scan was cancelled."
        }
    }
}

final class CoreNFCService: NSObject, NFCServicing, NFCNDEFReaderSessionDelegate {
    private var continuation: CheckedContinuation<NFCPaymentResult, Error>?
    private var currentBalance: Decimal = 0
    private var session: NFCNDEFReaderSession?

    func scanAndProcess(currentBalance: Decimal) async throws -> NFCPaymentResult {
        guard NFCNDEFReaderSession.readingAvailable else {
            #if targetEnvironment(simulator)
            try await Task.sleep(nanoseconds: 1_200_000_000)
            let fare: Decimal = 45
            guard currentBalance >= fare else { throw NFCServiceError.insufficientBalance }
            return NFCPaymentResult(
                route: "Ratnapark - Bouddha",
                terminalID: "TERM-BP-SIM",
                fare: fare,
                previousBalance: currentBalance,
                newBalance: currentBalance - fare,
                scannedAt: .now
            )
            #else
            throw NFCServiceError.unavailable
            #endif
        }

        self.currentBalance = currentBalance
        return try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            let session = NFCNDEFReaderSession(delegate: self, queue: nil, invalidateAfterFirstRead: true)
            session.alertMessage = "Hold your iPhone near the bus validator."
            self.session = session
            session.begin()
        }
    }

    func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
        if let continuation {
            self.continuation = nil
            continuation.resume(throwing: NFCServiceError.cancelled)
        }
    }

    func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
        let fare: Decimal = 45
        guard currentBalance >= fare else {
            session.invalidate(errorMessage: "Insufficient balance.")
            continuation?.resume(throwing: NFCServiceError.insufficientBalance)
            continuation = nil
            return
        }

        let result = NFCPaymentResult(
            route: "Ratnapark - Bouddha",
            terminalID: "TERM-BP-014",
            fare: fare,
            previousBalance: currentBalance,
            newBalance: currentBalance - fare,
            scannedAt: .now
        )
        session.alertMessage = "Boarding confirmed. Fare deducted."
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        continuation?.resume(returning: result)
        continuation = nil
    }
}

