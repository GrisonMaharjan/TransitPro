import SwiftUI

struct RootView: View {
    @EnvironmentObject private var auth: AuthViewModel

    var body: some View {
        Group {
            if auth.isAuthenticated {
                MainTabShell()
                    .transition(.opacity.combined(with: .scale(scale: 0.98)))
            } else {
                AuthenticationFlowView()
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.86), value: auth.isAuthenticated)
    }
}

struct MainTabShell: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        ZStack(alignment: .bottom) {
            NavigationStack {
                Group {
                    switch appState.selectedTab {
                    case .home:
                        HomeDashboardView()
                    case .history:
                        TransactionHistoryView()
                    case .nfc:
                        NFCPaymentView()
                    case .routes:
                        RoutesView()
                    case .settings:
                        SettingsView()
                    }
                }
                .navigationBarTitleDisplayMode(.inline)
            }

            SmartTabBar(selection: $appState.selectedTab)
        }
        .ignoresSafeArea(.keyboard, edges: .bottom)
    }
}

struct SmartTabBar: View {
    @Binding var selection: MainTab

    var body: some View {
        HStack {
            tab(.home, "house.fill", "Home")
            tab(.history, "clock.arrow.circlepath", "History")

            Button {
                selection = .nfc
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            } label: {
                VStack(spacing: 5) {
                    Image(systemName: "wave.3.right.circle.fill")
                        .font(.system(size: 32, weight: .bold))
                    Text("Tap")
                        .font(.caption2.weight(.bold))
                }
                .foregroundStyle(.white)
                .frame(width: 72, height: 72)
                .background(
                    LinearGradient(colors: [SmartFareColor.primaryBlue, SmartFareColor.secondaryTeal], startPoint: .topLeading, endPoint: .bottomTrailing),
                    in: Circle()
                )
                .shadow(color: SmartFareColor.primaryBlue.opacity(0.32), radius: 16, y: 8)
                .offset(y: -24)
                .accessibilityLabel("NFC Tap")
            }
            .buttonStyle(.plain)

            tab(.routes, "map.fill", "Routes")
            tab(.settings, "gearshape.fill", "Settings")
        }
        .padding(.horizontal, 14)
        .padding(.top, 12)
        .padding(.bottom, 8)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .padding(.horizontal, 12)
        .padding(.bottom, 8)
    }

    private func tab(_ tab: MainTab, _ icon: String, _ label: String) -> some View {
        Button {
            selection = tab
        } label: {
            VStack(spacing: 5) {
                Image(systemName: icon).font(.system(size: 18, weight: .semibold))
                Text(label).font(.caption2.weight(.medium))
            }
            .frame(maxWidth: .infinity)
            .foregroundStyle(selection == tab ? SmartFareColor.primaryBlue : .secondary)
            .frame(minHeight: 52)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

