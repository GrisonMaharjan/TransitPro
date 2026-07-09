import SwiftUI
import SwiftData

@main
struct BusPayNepalApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var authViewModel = AuthViewModel(authService: MockAuthService())
    @StateObject private var walletViewModel = WalletViewModel(walletService: MockWalletService())
    @StateObject private var routeViewModel = RoutesViewModel(routeService: MockRouteService())
    @StateObject private var nfcViewModel = NFCPaymentViewModel(nfcService: CoreNFCService())
    @AppStorage("appearance.darkMode") private var darkMode = false

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
                .environmentObject(authViewModel)
                .environmentObject(walletViewModel)
                .environmentObject(routeViewModel)
                .environmentObject(nfcViewModel)
                .preferredColorScheme(darkMode ? .dark : nil)
                .dynamicTypeSize(...DynamicTypeSize.accessibility3)
        }
        .modelContainer(for: [StoredTransaction.self, StoredTrip.self])
    }
}

