import SwiftUI

struct PrimaryButton: View {
    var title: LocalizedStringKey
    var systemImage: String?
    var isLoading = false
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if isLoading {
                    ProgressView().tint(.white)
                } else if let systemImage {
                    Image(systemName: systemImage)
                }
                Text(title).fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .frame(minHeight: 52)
            .foregroundStyle(.white)
            .background(SmartFareColor.primaryBlue, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .buttonStyle(.plain)
        .pressableScale()
        .accessibilityAddTraits(.isButton)
    }
}

struct SecondaryButton: View {
    var title: LocalizedStringKey
    var systemImage: String?
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if let systemImage { Image(systemName: systemImage) }
                Text(title).fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .frame(minHeight: 50)
            .foregroundStyle(SmartFareColor.primaryBlue)
            .background(SmartFareColor.primaryBlue.opacity(0.1), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .buttonStyle(.plain)
        .pressableScale()
    }
}

struct SmartTextField: View {
    var title: LocalizedStringKey
    var systemImage: String
    @Binding var text: String
    var keyboard: UIKeyboardType = .default
    var secure = false
    @State private var visible = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.subheadline.weight(.medium)).foregroundStyle(.secondary)
            HStack(spacing: 12) {
                Image(systemName: systemImage).foregroundStyle(.secondary)
                if secure && !visible {
                    SecureField(title, text: $text)
                } else {
                    TextField(title, text: $text)
                        .keyboardType(keyboard)
                        .textInputAutocapitalization(.never)
                }
                if secure {
                    Button { visible.toggle() } label: {
                        Image(systemName: visible ? "eye.slash" : "eye").foregroundStyle(.secondary)
                    }
                }
            }
            .padding()
            .background(.background, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(.separator.opacity(0.45), lineWidth: 1))
        }
    }
}

struct BalanceCard: View {
    var wallet: Wallet

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Current Balance")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.75))
                    Text(SmartFareFormatter.rupees(wallet.balance))
                        .font(.system(.largeTitle, design: .rounded).weight(.bold))
                        .contentTransition(.numericText())
                }
                Spacer()
                NFCStatusView(isEnabled: wallet.nfcEnabled)
            }

            HStack {
                Label(wallet.commuterID, systemImage: "person.text.rectangle")
                Spacer()
                StatusBadge(title: wallet.isVerified ? "Verified" : "Pending", color: wallet.isVerified ? SmartFareColor.successGreen : SmartFareColor.warningAmber)
            }
            .font(.caption.weight(.medium))
            .foregroundStyle(.white.opacity(0.9))
        }
        .padding(22)
        .background(
            LinearGradient(colors: [SmartFareColor.primaryBlue, SmartFareColor.secondaryTeal], startPoint: .topLeading, endPoint: .bottomTrailing),
            in: RoundedRectangle(cornerRadius: 24, style: .continuous)
        )
        .shadow(color: SmartFareColor.primaryBlue.opacity(0.25), radius: 20, y: 12)
        .accessibilityElement(children: .combine)
    }
}

struct NFCStatusView: View {
    var isEnabled: Bool

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "wave.3.right.circle.fill")
            Text(isEnabled ? "NFC On" : "NFC Off")
        }
        .font(.caption.weight(.semibold))
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(.white.opacity(0.17), in: Capsule())
        .foregroundStyle(.white)
    }
}

struct StatusBadge: View {
    var title: String
    var color: Color

    var body: some View {
        Text(title)
            .font(.caption.weight(.bold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(color.opacity(0.14), in: Capsule())
            .foregroundStyle(color)
    }
}

struct RouteCard: View {
    var route: BusRoute

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(route.number)
                    .font(.headline.weight(.bold))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(SmartFareColor.primaryBlue.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                    .foregroundStyle(SmartFareColor.primaryBlue)
                VStack(alignment: .leading) {
                    Text(route.name).font(.headline)
                    Text("\(route.origin) to \(route.destination)").font(.subheadline).foregroundStyle(.secondary)
                }
                Spacer()
                Text(SmartFareFormatter.rupees(route.fare)).font(.headline).foregroundStyle(SmartFareColor.primaryBlue)
            }
            HStack {
                Label(route.estimatedDuration, systemImage: "clock")
                Spacer()
                Label("\(route.activeBusCount) active", systemImage: "bus")
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .smartCard()
    }
}

struct TransactionCard: View {
    var transaction: Transaction

    private var color: Color {
        transaction.amount >= 0 ? SmartFareColor.successGreen : SmartFareColor.errorRed
    }

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: transaction.type == .recharge ? "plus.circle.fill" : "bus.fill")
                .font(.title2)
                .foregroundStyle(color)
                .frame(width: 42, height: 42)
                .background(color.opacity(0.12), in: Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(transaction.route).font(.subheadline.weight(.semibold))
                Text(SmartFareFormatter.shortDate.string(from: transaction.date))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(SmartFareFormatter.rupees(transaction.amount))
                .font(.subheadline.weight(.bold))
                .foregroundStyle(color)
        }
        .smartCard()
    }
}

struct SectionHeader: View {
    var title: LocalizedStringKey
    var actionTitle: LocalizedStringKey?
    var action: (() -> Void)?

    var body: some View {
        HStack {
            Text(title).font(.title3.weight(.bold))
            Spacer()
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(SmartFareColor.primaryBlue)
            }
        }
    }
}

