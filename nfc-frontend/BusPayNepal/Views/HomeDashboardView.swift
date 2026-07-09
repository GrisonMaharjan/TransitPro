import SwiftUI

struct HomeDashboardView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @EnvironmentObject private var appState: AppState
    @EnvironmentObject private var wallet: WalletViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                header
                BalanceCard(wallet: wallet.wallet)

                quickActions

                HStack(spacing: 14) {
                    statCard(title: "Total Trips", value: "\(SampleData.trips.count)", icon: "bus.fill")
                    statCard(title: "Amount Spent", value: SmartFareFormatter.rupees(100), icon: "creditcard.fill")
                }

                SectionHeader(title: "Recent Trips", actionTitle: "View All") {
                    appState.selectedTab = .history
                }

                VStack(spacing: 12) {
                    ForEach(SampleData.trips) { trip in
                        TripRow(trip: trip)
                    }
                }
            }
            .padding(20)
            .padding(.bottom, 96)
        }
        .task { await wallet.load() }
        .background(SmartFareColor.appBackground.ignoresSafeArea())
    }

    private var header: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Namaste, \(auth.currentUser?.fullName.components(separatedBy: " ").first ?? "Passenger")")
                    .font(.title2.weight(.bold))
                Text("Rapid Transit, Seamless Payments")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: "person.crop.circle.fill")
                .font(.system(size: 44))
                .foregroundStyle(SmartFareColor.primaryBlue)
                .accessibilityLabel("Profile")
        }
        .padding(.top, 12)
    }

    private var quickActions: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionHeader(title: "Quick Actions")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                actionTile("Scan NFC", "wave.3.right.circle.fill", SmartFareColor.primaryBlue) { appState.selectedTab = .nfc }
                actionTile("Top Up Wallet", "plus.circle.fill", SmartFareColor.secondaryTeal) { appState.selectedTab = .settings }
                actionTile("View Routes", "map.fill", SmartFareColor.warningAmber) { appState.selectedTab = .routes }
                actionTile("History", "clock.arrow.circlepath", SmartFareColor.successGreen) { appState.selectedTab = .history }
            }
        }
    }

    private func actionTile(_ title: String, _ icon: String, _ color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 14) {
                Image(systemName: icon)
                    .font(.title2.weight(.semibold))
                    .frame(width: 46, height: 46)
                    .background(color.opacity(0.14), in: RoundedRectangle(cornerRadius: 14))
                    .foregroundStyle(color)
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .smartCard()
        }
        .buttonStyle(.plain)
        .pressableScale()
    }

    private func statCard(title: String, value: String, icon: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(SmartFareColor.primaryBlue)
                .frame(width: 38, height: 38)
                .background(SmartFareColor.primaryBlue.opacity(0.12), in: Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(value).font(.headline.weight(.bold))
                Text(title).font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
        }
        .smartCard()
    }
}

struct TripRow: View {
    var trip: Trip

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "bus")
                .foregroundStyle(SmartFareColor.primaryBlue)
                .frame(width: 42, height: 42)
                .background(SmartFareColor.primaryBlue.opacity(0.12), in: Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(trip.route).font(.subheadline.weight(.semibold))
                Text(SmartFareFormatter.shortDate.string(from: trip.date))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 5) {
                Text(SmartFareFormatter.rupees(trip.fare))
                    .font(.subheadline.weight(.bold))
                StatusBadge(title: trip.status, color: SmartFareColor.successGreen)
            }
        }
        .smartCard()
    }
}

