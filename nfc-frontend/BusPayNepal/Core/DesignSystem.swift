import SwiftUI

enum SmartFareColor {
    static let primaryBlue = Color(hex: "2563EB")
    static let secondaryTeal = Color(hex: "14B8A6")
    static let successGreen = Color(hex: "22C55E")
    static let warningAmber = Color(hex: "F59E0B")
    static let errorRed = Color(hex: "EF4444")
    static let appBackground = Color(hex: "F8FAFC")
    static let cardBackground = Color.white
    static let primaryText = Color(hex: "111827")
    static let secondaryText = Color(hex: "6B7280")
    static let border = Color(hex: "E5E7EB")
}

enum SmartFareSpacing {
    static let xs: CGFloat = 6
    static let sm: CGFloat = 10
    static let md: CGFloat = 16
    static let lg: CGFloat = 24
    static let xl: CGFloat = 32
}

extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var value: UInt64 = 0
        scanner.scanHexInt64(&value)
        self.init(
            red: Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8) & 0xFF) / 255,
            blue: Double(value & 0xFF) / 255
        )
    }
}

extension View {
    func smartCard() -> some View {
        self
            .padding(SmartFareSpacing.md)
            .background(.background, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(.separator.opacity(0.35), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.05), radius: 12, y: 6)
    }

    func pressableScale() -> some View {
        modifier(PressableScaleModifier())
    }
}

struct PressableScaleModifier: ViewModifier {
    @GestureState private var pressed = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(pressed ? 0.97 : 1)
            .animation(.spring(response: 0.25, dampingFraction: 0.75), value: pressed)
            .gesture(DragGesture(minimumDistance: 0).updating($pressed) { _, state, _ in state = true })
    }
}

enum SmartFareFormatter {
    static func rupees(_ value: Decimal) -> String {
        "NPR \(NSDecimalNumber(decimal: value).intValue.formatted())"
    }

    static let shortDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}

