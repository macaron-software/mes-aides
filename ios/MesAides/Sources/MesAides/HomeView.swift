import SwiftUI

/// Landing screen
struct HomeView: View {
    @EnvironmentObject var store: SimulatorStore

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Hero
                VStack(spacing: 12) {
                    Text("Vos droits en 3 minutes")
                        .font(.system(size: 28, weight: .bold))
                        .multilineTextAlignment(.center)
                    Text("Simulateur gratuit — 28 aides analysées — PDF offert")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 48)

                // Stats row
                HStack(spacing: 16) {
                    StatBadge(value: "28", label: "aides")
                    StatBadge(value: "10Mds€", label: "non reclamés")
                    StatBadge(value: "3min", label: "pour savoir")
                }

                // CTA
                NavigationLink {
                    SimulatorView()
                } label: {
                    Text("Tester mon eligibilite")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(hex: "#0B6E4F"))
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .padding(.horizontal, 24)

                Spacer(minLength: 40)
            }
            .padding(.horizontal, 20)
        }
        .navigationTitle("Mes Aides")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                LanguagePicker()
            }
        }
    }
}

struct StatBadge: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(Color(hex: "#0B6E4F"))
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(hex: "#E8F5F0"))
        .cornerRadius(10)
    }
}
