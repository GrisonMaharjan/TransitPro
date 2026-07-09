import SwiftUI

struct NFCPaymentView: View {
    @EnvironmentObject private var nfc: NFCPaymentViewModel
    @EnvironmentObject private var wallet: WalletViewModel
    @State private var pulse = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer(minLength: 10)
            illustration
            content
            Spacer()
        }
        .padding(22)
        .padding(.bottom, 86)
        .background(SmartFareColor.appBackground.ignoresSafeArea())
        .onChange(of: nfc.state) { _, state in
            if case .success(let result) = state {
                wallet.applyNFCPayment(result)
            }
        }
    }

    private var illustration: some View {
        ZStack {
            if case .scanning = nfc.state {
                ForEach(0..<3, id: \.self) { index in
                    Circle()
                        .stroke(SmartFareColor.primaryBlue.opacity(0.24), lineWidth: 2)
                        .frame(width: 170 + CGFloat(index * 42), height: 170 + CGFloat(index * 42))
                        .scaleEffect(pulse ? 1.12 : 0.86)
                        .opacity(pulse ? 0 : 1)
                        .animation(.easeOut(duration: 1.45).repeatForever().delay(Double(index) * 0.18), value: pulse)
                }
            }
            RoundedRectangle(cornerRadius: 36, style: .continuous)
                .fill(.background)
                .frame(width: 154, height: 220)
                .overlay {
                    VStack(spacing: 14) {
                        Image(systemName: "iphone.gen3")
                            .font(.system(size: 56))
                            .foregroundStyle(SmartFareColor.primaryBlue)
                        Image(systemName: "wave.3.right")
                            .font(.title)
                            .foregroundStyle(SmartFareColor.secondaryTeal)
                    }
                }
                .shadow(color: .black.opacity(0.08), radius: 18, y: 10)
        }
        .frame(height: 270)
        .onAppear { pulse = true }
    }

    @ViewBuilder
    private var content: some View {
        switch nfc.state {
        case .idle:
            VStack(spacing: 14) {
                Text("NFC Ready")
                    .font(.title.weight(.bold))
                Text("Hold your iPhone near the bus validator to confirm boarding and deduct fare securely.")
                    .font(.body)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                PrimaryButton(title: "Start NFC Scan", systemImage: "wave.3.right.circle") {
                    Task { await nfc.startScan(currentBalance: wallet.wallet.balance) }
                }
            }
        case .scanning:
            VStack(spacing: 14) {
                ProgressView()
                    .controlSize(.large)
                    .tint(SmartFareColor.primaryBlue)
                Text("Hold phone near validator")
                    .font(.title3.weight(.bold))
                Text("Keep the top of your iPhone close to the validator until confirmation appears.")
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .transition(.opacity)
        case .success(let result):
            VStack(spacing: 16) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 68))
                    .foregroundStyle(SmartFareColor.successGreen)
                    .symbolEffect(.bounce)
                Text("Boarding Confirmed")
                    .font(.title.weight(.bold))
                nfcDetail("Fare Deducted", SmartFareFormatter.rupees(result.fare))
                nfcDetail("Previous Balance", SmartFareFormatter.rupees(result.previousBalance))
                nfcDetail("New Balance", SmartFareFormatter.rupees(result.newBalance))
                nfcDetail("Bus Route", result.route)
                nfcDetail("Terminal ID", result.terminalID)
                PrimaryButton(title: "Scan Again", systemImage: "arrow.clockwise") {
                    nfc.reset()
                }
            }
            .smartCard()
            .transition(.scale.combined(with: .opacity))
        case .failure(let message):
            VStack(spacing: 14) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 58))
                    .foregroundStyle(SmartFareColor.errorRed)
                Text("NFC Error")
                    .font(.title.weight(.bold))
                Text(message)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                PrimaryButton(title: "Retry", systemImage: "arrow.clockwise") {
                    Task { await nfc.startScan(currentBalance: wallet.wallet.balance) }
                }
            }
            .smartCard()
        }
    }

    private func nfcDetail(_ title: String, _ value: String) -> some View {
        HStack {
            Text(title).foregroundStyle(.secondary)
            Spacer()
            Text(value).fontWeight(.semibold)
        }
        .font(.subheadline)
    }
}

