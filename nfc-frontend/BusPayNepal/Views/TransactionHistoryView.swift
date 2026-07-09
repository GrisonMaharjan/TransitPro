import SwiftUI

enum HistoryFilter: String, CaseIterable {
    case today = "Today"
    case week = "Week"
    case month = "Month"
}

struct TransactionHistoryView: View {
    @EnvironmentObject private var wallet: WalletViewModel
    @State private var filter: HistoryFilter = .week
    @State private var search = ""

    var filtered: [Transaction] {
        wallet.transactions.filter {
            (search.isEmpty || $0.route.localizedCaseInsensitiveContains(search) || $0.type.rawValue.localizedCaseInsensitiveContains(search))
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                TextField("Search transaction or route", text: $search)
                    .padding()
                    .background(.background, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(.separator.opacity(0.4)))
                Picker("Range", selection: $filter) {
                    ForEach(HistoryFilter.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)

                ForEach(filtered) { transaction in
                    TransactionCard(transaction: transaction)
                }
            }
            .padding(20)
            .padding(.bottom, 96)
        }
        .navigationTitle("History")
        .background(SmartFareColor.appBackground.ignoresSafeArea())
    }
}

