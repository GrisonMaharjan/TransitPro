import Foundation
import SwiftData

struct User: Identifiable, Codable, Hashable {
    let id: UUID
    var fullName: String
    var phone: String
    var email: String
    var commuterID: String
    var verified: Bool
    var profileImageName: String?
}

struct DriverProfile: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var phone: String
    var email: String
    var busPlateNumber: String
    var licenseNumber: String
    var verificationStatus: VerificationStatus
}

enum VerificationStatus: String, Codable, CaseIterable {
    case notVerified = "Not Verified"
    case pending = "Pending Verification"
    case approved = "Approved"
}

struct Wallet: Codable, Hashable {
    var balance: Decimal
    var commuterID: String
    var isVerified: Bool
    var nfcEnabled: Bool
}

enum TransactionType: String, Codable, CaseIterable {
    case all = "All"
    case recharge = "Recharge"
    case travel = "Travel"
    case refund = "Refund"
}

struct Transaction: Identifiable, Codable, Hashable {
    let id: UUID
    var date: Date
    var route: String
    var amount: Decimal
    var type: TransactionType
    var status: String
    var method: String
}

struct Trip: Identifiable, Codable, Hashable {
    let id: UUID
    var route: String
    var date: Date
    var fare: Decimal
    var status: String
    var terminalID: String
}

struct BusRoute: Identifiable, Codable, Hashable {
    let id: UUID
    var number: String
    var name: String
    var origin: String
    var destination: String
    var fare: Decimal
    var estimatedDuration: String
    var activeBusCount: Int
    var stops: [String]
}

struct NFCPaymentResult: Identifiable, Hashable {
    let id = UUID()
    var route: String
    var terminalID: String
    var fare: Decimal
    var previousBalance: Decimal
    var newBalance: Decimal
    var scannedAt: Date
}

@Model
final class StoredTransaction {
    var id: UUID
    var date: Date
    var route: String
    var amount: Decimal
    var typeRawValue: String
    var status: String
    var method: String

    init(transaction: Transaction) {
        self.id = transaction.id
        self.date = transaction.date
        self.route = transaction.route
        self.amount = transaction.amount
        self.typeRawValue = transaction.type.rawValue
        self.status = transaction.status
        self.method = transaction.method
    }
}

@Model
final class StoredTrip {
    var id: UUID
    var route: String
    var date: Date
    var fare: Decimal
    var status: String
    var terminalID: String

    init(trip: Trip) {
        self.id = trip.id
        self.route = trip.route
        self.date = trip.date
        self.fare = trip.fare
        self.status = trip.status
        self.terminalID = trip.terminalID
    }
}

enum SampleData {
    static let passenger = User(
        id: UUID(),
        fullName: "Nipun Shakya",
        phone: "9800000000",
        email: "nipun@example.com",
        commuterID: "BPN-2048-77",
        verified: true,
        profileImageName: nil
    )

    static let wallet = Wallet(balance: 1250, commuterID: "BPN-2048-77", isVerified: true, nfcEnabled: true)

    static let routes: [BusRoute] = [
        .init(id: UUID(), number: "01", name: "Ratnapark - Bouddha", origin: "Ratnapark", destination: "Bouddha", fare: 45, estimatedDuration: "32 min", activeBusCount: 12, stops: ["Ratnapark", "Putalisadak", "Gaushala", "Bouddha"]),
        .init(id: UUID(), number: "04", name: "Lagankhel - Chabahil", origin: "Lagankhel", destination: "Chabahil", fare: 55, estimatedDuration: "44 min", activeBusCount: 8, stops: ["Lagankhel", "Jawalakhel", "Tripureshwor", "Chabahil"]),
        .init(id: UUID(), number: "12", name: "Kalanki - Airport", origin: "Kalanki", destination: "Airport", fare: 65, estimatedDuration: "50 min", activeBusCount: 6, stops: ["Kalanki", "Kalimati", "New Baneshwor", "Airport"])
    ]

    static let trips: [Trip] = [
        .init(id: UUID(), route: "Ratnapark - Bouddha", date: .now.addingTimeInterval(-3600), fare: 45, status: "Completed", terminalID: "TERM-BP-014"),
        .init(id: UUID(), route: "Lagankhel - Chabahil", date: .now.addingTimeInterval(-86400), fare: 55, status: "Completed", terminalID: "TERM-LG-022")
    ]

    static let transactions: [Transaction] = [
        .init(id: UUID(), date: .now.addingTimeInterval(-600), route: "Wallet Top Up", amount: 500, type: .recharge, status: "Success", method: "Khalti"),
        .init(id: UUID(), date: .now.addingTimeInterval(-3600), route: "Ratnapark - Bouddha", amount: -45, type: .travel, status: "Success", method: "NFC"),
        .init(id: UUID(), date: .now.addingTimeInterval(-172800), route: "Refund", amount: 25, type: .refund, status: "Success", method: "System")
    ]
}

