import Foundation

protocol AuthServicing {
    func signIn(identifier: String, password: String) async throws -> User
    func register(_ request: RegisterRequest) async throws -> User
    func requestOTP(identifier: String) async throws
    func verifyOTP(_ otp: String) async throws
    func resetPassword(_ password: String) async throws
}

struct RegisterRequest {
    var fullName: String
    var phone: String
    var email: String
    var password: String
}

enum AuthError: LocalizedError {
    case invalidCredentials
    case validation(String)

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid credentials. Please check your email and password."
        case .validation(let message):
            return message
        }
    }
}

final class MockAuthService: AuthServicing {
    private var accounts: [String: (user: User, password: String)] = [
        "nipun@example.com": (SampleData.passenger, "Password123"),
        "9800000000": (SampleData.passenger, "Password123")
    ]

    func signIn(identifier: String, password: String) async throws -> User {
        try await Task.sleep(nanoseconds: 450_000_000)
        let key = identifier.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard let account = accounts[key], account.password == password else {
            throw AuthError.invalidCredentials
        }
        return account.user
    }

    func register(_ request: RegisterRequest) async throws -> User {
        try await Task.sleep(nanoseconds: 600_000_000)
        let user = User(id: UUID(), fullName: request.fullName, phone: request.phone, email: request.email, commuterID: "BPN-\(Int.random(in: 1000...9999))-NP", verified: true)
        accounts[request.email.lowercased()] = (user, request.password)
        accounts[request.phone] = (user, request.password)
        return user
    }

    func requestOTP(identifier: String) async throws { try await Task.sleep(nanoseconds: 350_000_000) }
    func verifyOTP(_ otp: String) async throws { try await Task.sleep(nanoseconds: 350_000_000) }
    func resetPassword(_ password: String) async throws { try await Task.sleep(nanoseconds: 350_000_000) }
}

protocol WalletServicing {
    func loadWallet() async throws -> Wallet
    func loadTransactions() async throws -> [Transaction]
    func recharge(amount: Decimal, method: String) async throws -> Transaction
    func deductFare(amount: Decimal, route: String) async throws -> Wallet
}

final class MockWalletService: WalletServicing {
    private var wallet = SampleData.wallet
    private var transactions = SampleData.transactions

    func loadWallet() async throws -> Wallet {
        try await Task.sleep(nanoseconds: 250_000_000)
        return wallet
    }

    func loadTransactions() async throws -> [Transaction] {
        try await Task.sleep(nanoseconds: 250_000_000)
        return transactions
    }

    func recharge(amount: Decimal, method: String) async throws -> Transaction {
        try await Task.sleep(nanoseconds: 700_000_000)
        wallet.balance += amount
        let transaction = Transaction(id: UUID(), date: .now, route: "Wallet Top Up", amount: amount, type: .recharge, status: "Success", method: method)
        transactions.insert(transaction, at: 0)
        return transaction
    }

    func deductFare(amount: Decimal, route: String) async throws -> Wallet {
        try await Task.sleep(nanoseconds: 300_000_000)
        guard wallet.balance >= amount else { throw AuthError.validation("Insufficient balance. Please top up your wallet.") }
        wallet.balance -= amount
        transactions.insert(.init(id: UUID(), date: .now, route: route, amount: -amount, type: .travel, status: "Success", method: "NFC"), at: 0)
        return wallet
    }
}

protocol RouteServicing {
    func loadRoutes() async throws -> [BusRoute]
}

final class MockRouteService: RouteServicing {
    func loadRoutes() async throws -> [BusRoute] {
        try await Task.sleep(nanoseconds: 300_000_000)
        return SampleData.routes
    }
}

