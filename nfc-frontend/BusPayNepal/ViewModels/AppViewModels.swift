import Foundation
import SwiftUI
import Combine

@MainActor
final class AppState: ObservableObject {
    @Published var selectedTab: MainTab = .home
    @Published var languageCode = "en"
}

enum MainTab: Hashable {
    case home
    case history
    case nfc
    case routes
    case settings
}

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var faceIDEnabled = false

    private let authService: AuthServicing

    init(authService: AuthServicing) {
        self.authService = authService
    }

    var isAuthenticated: Bool { currentUser != nil }

    func signIn(identifier: String, password: String) async {
        isLoading = true
        defer { isLoading = false }
        do {
            currentUser = try await authService.signIn(identifier: identifier, password: password)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func register(_ request: RegisterRequest) async {
        isLoading = true
        defer { isLoading = false }
        do {
            currentUser = try await authService.register(request)
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func logout() {
        currentUser = nil
    }
}

@MainActor
final class WalletViewModel: ObservableObject {
    @Published var wallet = SampleData.wallet
    @Published var transactions = SampleData.transactions
    @Published var isLoading = false
    @Published var selectedFilter: TransactionType = .all
    @Published var paymentStatus: PaymentStatus = .idle

    private let walletService: WalletServicing

    init(walletService: WalletServicing) {
        self.walletService = walletService
    }

    var filteredTransactions: [Transaction] {
        selectedFilter == .all ? transactions : transactions.filter { $0.type == selectedFilter }
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            wallet = try await walletService.loadWallet()
            transactions = try await walletService.loadTransactions()
        } catch {
            paymentStatus = .failed(error.localizedDescription)
        }
    }

    func recharge(amount: Decimal, method: String) async {
        paymentStatus = .processing
        do {
            let transaction = try await walletService.recharge(amount: amount, method: method)
            wallet.balance += amount
            transactions.insert(transaction, at: 0)
            paymentStatus = .success(transaction)
        } catch {
            paymentStatus = .failed(error.localizedDescription)
        }
    }

    func applyNFCPayment(_ result: NFCPaymentResult) {
        wallet.balance = result.newBalance
        transactions.insert(
            Transaction(id: UUID(), date: result.scannedAt, route: result.route, amount: -result.fare, type: .travel, status: "Success", method: "NFC"),
            at: 0
        )
    }
}

enum PaymentStatus: Equatable {
    case idle
    case processing
    case success(Transaction)
    case failed(String)
}

@MainActor
final class RoutesViewModel: ObservableObject {
    @Published var routes = SampleData.routes
    @Published var searchText = ""
    @Published var isLoading = false

    private let routeService: RouteServicing

    init(routeService: RouteServicing) {
        self.routeService = routeService
    }

    var filteredRoutes: [BusRoute] {
        guard !searchText.isEmpty else { return routes }
        return routes.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.number.localizedCaseInsensitiveContains(searchText) ||
            $0.stops.contains { $0.localizedCaseInsensitiveContains(searchText) }
        }
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            routes = try await routeService.loadRoutes()
        } catch {
            routes = SampleData.routes
        }
    }
}

@MainActor
final class NFCPaymentViewModel: ObservableObject {
    @Published var state: NFCScanState = .idle
    @Published var result: NFCPaymentResult?

    private let nfcService: NFCServicing

    init(nfcService: NFCServicing) {
        self.nfcService = nfcService
    }

    func startScan(currentBalance: Decimal) async {
        state = .scanning
        do {
            let result = try await nfcService.scanAndProcess(currentBalance: currentBalance)
            self.result = result
            state = .success(result)
        } catch {
            state = .failure(error.localizedDescription)
        }
    }

    func reset() {
        result = nil
        state = .idle
    }
}

enum NFCScanState: Equatable {
    case idle
    case scanning
    case success(NFCPaymentResult)
    case failure(String)
}

