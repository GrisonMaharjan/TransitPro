import SwiftUI

struct WalletView: View {
    @EnvironmentObject private var wallet: WalletViewModel
    @State private var showRecharge = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                BalanceCard(wallet: wallet.wallet)
                PrimaryButton(title: "Recharge Wallet", systemImage: "plus.circle") { showRecharge = true }

                HStack(spacing: 12) {
                    summary("Recharge", wallet.transactions.filter { $0.type == .recharge }.count, SmartFareColor.successGreen)
                    summary("Travel", wallet.transactions.filter { $0.type == .travel }.count, SmartFareColor.primaryBlue)
                    summary("Refund", wallet.transactions.filter { $0.type == .refund }.count, SmartFareColor.warningAmber)
                }

                Picker("Filter", selection: $wallet.selectedFilter) {
                    ForEach(TransactionType.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)

                SectionHeader(title: "Recent Transactions")
                ForEach(wallet.filteredTransactions) { transaction in
                    TransactionCard(transaction: transaction)
                }
            }
            .padding(20)
            .padding(.bottom, 96)
        }
        .navigationTitle("Wallet")
        .background(SmartFareColor.appBackground.ignoresSafeArea())
        .sheet(isPresented: $showRecharge) { RechargeView() }
    }

    private func summary(_ title: String, _ value: Int, _ color: Color) -> some View {
        VStack(spacing: 6) {
            Text("\(value)").font(.title3.weight(.bold)).foregroundStyle(color)
            Text(title).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .smartCard()
    }
}

struct RechargeView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var wallet: WalletViewModel
    @State private var selectedAmount: Decimal = 500
    @State private var customAmount = ""
    @State private var method = "Khalti"
    @State private var showConfirmation = false

    private let amounts: [Decimal] = [100, 200, 500, 1000, 2000]
    private let methods = ["Khalti", "eSewa", "ConnectIPS"]

    var amount: Decimal {
        Decimal(string: customAmount) ?? selectedAmount
    }

    var serviceCharge: Decimal { 0 }
    var total: Decimal { amount + serviceCharge }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    SectionHeader(title: "Select Amount")
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(amounts, id: \.self) { item in
                            Button {
                                selectedAmount = item
                                customAmount = ""
                            } label: {
                                Text(SmartFareFormatter.rupees(item))
                                    .font(.subheadline.weight(.semibold))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(amount == item ? SmartFareColor.primaryBlue : .background, in: RoundedRectangle(cornerRadius: 14))
                                    .foregroundStyle(amount == item ? .white : .primary)
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    SmartTextField(title: "Custom Amount", systemImage: "number", text: $customAmount, keyboard: .numberPad)

                    SectionHeader(title: "Payment Method")
                    ForEach(methods, id: \.self) { item in
                        Button { method = item } label: {
                            HStack {
                                Image(systemName: item == "Khalti" ? "wallet.pass.fill" : item == "eSewa" ? "leaf.fill" : "building.columns.fill")
                                    .foregroundStyle(SmartFareColor.primaryBlue)
                                Text(item).fontWeight(.semibold)
                                Spacer()
                                Image(systemName: method == item ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(method == item ? SmartFareColor.successGreen : .secondary)
                            }
                            .smartCard()
                        }
                        .buttonStyle(.plain)
                    }

                    PrimaryButton(title: "Continue", systemImage: "arrow.right") { showConfirmation = true }
                }
                .padding(20)
            }
            .background(SmartFareColor.appBackground.ignoresSafeArea())
            .navigationTitle("Top Up Wallet")
            .toolbar { Button("Cancel") { dismiss() } }
            .navigationDestination(isPresented: $showConfirmation) {
                PaymentConfirmationView(amount: amount, serviceCharge: serviceCharge, total: total, method: method)
            }
        }
    }
}

struct PaymentConfirmationView: View {
    @EnvironmentObject private var wallet: WalletViewModel
    let amount: Decimal
    let serviceCharge: Decimal
    let total: Decimal
    let method: String

    var body: some View {
        VStack(spacing: 20) {
            VStack(spacing: 12) {
                paymentRow("Recharge Amount", SmartFareFormatter.rupees(amount))
                paymentRow("Service Charge", SmartFareFormatter.rupees(serviceCharge))
                paymentRow("Total Amount", SmartFareFormatter.rupees(total))
                paymentRow("Payment Method", method)
            }
            .smartCard()

            switch wallet.paymentStatus {
            case .idle:
                PrimaryButton(title: "Confirm Payment", systemImage: "checkmark") {
                    Task { await wallet.recharge(amount: amount, method: method) }
                }
                SecondaryButton(title: "Cancel Payment", systemImage: "xmark") {}
            case .processing:
                ProgressView("Processing Payment...")
                    .padding(30)
                    .frame(maxWidth: .infinity)
                    .smartCard()
            case .success(let transaction):
                PaymentSuccessView(transaction: transaction)
            case .failed(let reason):
                PaymentFailureView(reason: reason) {
                    Task { await wallet.recharge(amount: amount, method: method) }
                }
            }
            Spacer()
        }
        .padding(20)
        .background(SmartFareColor.appBackground.ignoresSafeArea())
        .navigationTitle("Confirm Payment")
    }

    private func paymentRow(_ title: String, _ value: String) -> some View {
        HStack {
            Text(title).foregroundStyle(.secondary)
            Spacer()
            Text(value).fontWeight(.semibold)
        }
    }
}

struct PaymentSuccessView: View {
    var transaction: Transaction

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: "checkmark.seal.fill").font(.system(size: 64)).foregroundStyle(SmartFareColor.successGreen)
            Text("Payment Successful").font(.title3.weight(.bold))
            Text("Amount Added: \(SmartFareFormatter.rupees(transaction.amount))")
            Text("Transaction ID: \(transaction.id.uuidString.prefix(8))")
            Text("Payment Method: \(transaction.method)")
            HStack {
                SecondaryButton(title: "View Transaction", systemImage: "doc.text") {}
                SecondaryButton(title: "Back Home", systemImage: "house") {}
            }
        }
        .smartCard()
    }
}

struct PaymentFailureView: View {
    var reason: String
    var retry: () -> Void

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: "xmark.octagon.fill").font(.system(size: 58)).foregroundStyle(SmartFareColor.errorRed)
            Text("Payment Failed").font(.title3.weight(.bold))
            Text(reason).foregroundStyle(.secondary).multilineTextAlignment(.center)
            PrimaryButton(title: "Retry Payment", systemImage: "arrow.clockwise", action: retry)
            SecondaryButton(title: "Contact Support", systemImage: "phone") {}
        }
        .smartCard()
    }
}

