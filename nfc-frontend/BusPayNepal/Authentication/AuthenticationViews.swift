import PhotosUI
import SwiftUI

struct AuthenticationFlowView: View {
    var body: some View {
        NavigationStack {
            LoginView()
        }
    }
}

struct LoginView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @State private var identifier = ""
    @State private var password = ""
    @State private var showForgotPassword = false
    @State private var showError = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                authHeader

                VStack(spacing: 16) {
                    SmartTextField(title: "Email / Phone Number", systemImage: "person", text: $identifier, keyboard: .emailAddress)
                    SmartTextField(title: "Password", systemImage: "lock", text: $password, secure: true)

                    HStack {
                        Toggle("Face ID", isOn: $auth.faceIDEnabled)
                            .toggleStyle(.switch)
                        Spacer()
                        Button("Forgot Password?") { showForgotPassword = true }
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(SmartFareColor.primaryBlue)
                    }

                    PrimaryButton(title: "Sign In", systemImage: "arrow.right", isLoading: auth.isLoading) {
                        Task { await signIn() }
                    }
                    .disabled(auth.isLoading)

                    NavigationLink {
                        RegisterView()
                    } label: {
                        Text("Create a new account")
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                    }
                }
                .smartCard()
            }
            .padding(20)
        }
        .background(SmartFareColor.appBackground.ignoresSafeArea())
        .navigationDestination(isPresented: $showForgotPassword) { ForgotPasswordView() }
        .alert("Login Failed", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(auth.errorMessage ?? "Invalid credentials. Please check your email and password.")
        }
    }

    private var authHeader: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: "bus.doubledecker.fill")
                .font(.system(size: 48))
                .foregroundStyle(SmartFareColor.primaryBlue)
            Text("Bus Pay Nepal")
                .font(.largeTitle.weight(.bold))
            Text("Rapid Transit, Seamless Payments")
                .font(.headline)
                .foregroundStyle(.secondary)
        }
        .padding(.top, 32)
        .accessibilityElement(children: .combine)
    }

    private func signIn() async {
        guard !identifier.isEmpty, !password.isEmpty else {
            auth.errorMessage = "Please enter your email/phone and password."
            showError = true
            return
        }
        await auth.signIn(identifier: identifier, password: password)
        if auth.errorMessage != nil { showError = true }
    }
}

struct RegisterView: View {
    @EnvironmentObject private var auth: AuthViewModel
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var fullName = ""
    @State private var phone = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var acceptedTerms = false
    @State private var errorMessage: String?
    @State private var showError = false

    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                PhotosPicker(selection: $selectedPhoto, matching: .images) {
                    VStack(spacing: 10) {
                        Image(systemName: "camera.circle.fill")
                            .font(.system(size: 64))
                            .foregroundStyle(SmartFareColor.primaryBlue)
                        Text("Upload Profile Photo")
                            .font(.subheadline.weight(.semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .smartCard()
                }

                SmartTextField(title: "Full Name", systemImage: "person.text.rectangle", text: $fullName)
                SmartTextField(title: "Phone Number", systemImage: "phone", text: $phone, keyboard: .phonePad)
                SmartTextField(title: "Email", systemImage: "envelope", text: $email, keyboard: .emailAddress)
                SmartTextField(title: "Password", systemImage: "lock", text: $password, secure: true)
                SmartTextField(title: "Confirm Password", systemImage: "lock.rotation", text: $confirmPassword, secure: true)

                Toggle("I agree to the Terms and Conditions", isOn: $acceptedTerms)
                    .font(.subheadline)

                PrimaryButton(title: "Register", systemImage: "checkmark", isLoading: auth.isLoading) {
                    Task { await register() }
                }
            }
            .padding(20)
        }
        .navigationTitle("Create Account")
        .background(SmartFareColor.appBackground.ignoresSafeArea())
        .alert("Registration Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "Please check your details and try again.")
        }
    }

    private func register() async {
        guard !fullName.isEmpty, !phone.isEmpty, !email.isEmpty, !password.isEmpty, !confirmPassword.isEmpty else {
            return fail("All fields are required.")
        }
        guard email.contains("@"), email.contains(".") else { return fail("Please enter a valid email address.") }
        guard phone.count >= 10 else { return fail("Please enter a valid phone number.") }
        guard password.count >= 8, password.rangeOfCharacter(from: .uppercaseLetters) != nil, password.rangeOfCharacter(from: .decimalDigits) != nil else {
            return fail("Password must be at least 8 characters and include a number and uppercase letter.")
        }
        guard password == confirmPassword else { return fail("Passwords do not match. Please try again.") }
        guard acceptedTerms else { return fail("Please accept the Terms and Conditions.") }

        await auth.register(RegisterRequest(fullName: fullName, phone: phone, email: email, password: password))
        if let error = auth.errorMessage { fail(error) }
    }

    private func fail(_ message: String) {
        errorMessage = message
        showError = true
    }
}

struct ForgotPasswordView: View {
    @State private var step = 0
    @State private var identifier = ""
    @State private var otp = ""
    @State private var newPassword = ""

    var body: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: step == 3 ? "checkmark.seal.fill" : "key.fill")
                .font(.system(size: 56))
                .foregroundStyle(step == 3 ? SmartFareColor.successGreen : SmartFareColor.primaryBlue)
            Text(title).font(.title2.weight(.bold)).multilineTextAlignment(.center)
            if step == 0 {
                SmartTextField(title: "Phone or Email", systemImage: "person", text: $identifier)
            } else if step == 1 {
                SmartTextField(title: "OTP Code", systemImage: "number", text: $otp, keyboard: .numberPad)
            } else if step == 2 {
                SmartTextField(title: "New Password", systemImage: "lock", text: $newPassword, secure: true)
            }
            if step < 3 {
                PrimaryButton(title: step == 2 ? "Reset Password" : "Continue", systemImage: "arrow.right") {
                    withAnimation(.spring()) { step += 1 }
                }
            }
            Spacer()
        }
        .padding(20)
        .background(SmartFareColor.appBackground.ignoresSafeArea())
        .navigationTitle("Forgot Password")
    }

    private var title: String {
        ["Enter your phone or email", "Verify OTP", "Create new password", "Password reset successful"][step]
    }
}

