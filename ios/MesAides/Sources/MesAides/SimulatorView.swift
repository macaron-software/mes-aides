import SwiftUI

/// 5-step wizard mirroring the web simulator
struct SimulatorView: View {
    @EnvironmentObject var store: SimulatorStore
    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack(spacing: 0) {
            // Progress bar
            ProgressView(value: Double(store.currentStep + 1), total: 5.0)
                .tint(Color(hex: "#0B6E4F"))
                .padding(.horizontal, 20)
                .padding(.top, 12)

            Text("Etape \(store.currentStep + 1) / 5")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.top, 4)

            // Step content
            TabView(selection: $store.currentStep) {
                SituationStep().tag(0)
                LogementStep().tag(1)
                RevenusStep().tag(2)
                SanteStep().tag(3)
                EmploiStep().tag(4)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: store.currentStep)

            // Navigation buttons
            HStack(spacing: 16) {
                if store.currentStep > 0 {
                    Button("Precedent") {
                        withAnimation { store.currentStep -= 1 }
                    }
                    .buttonStyle(.bordered)
                }

                Spacer()

                if store.currentStep < 4 {
                    Button("Suivant") {
                        withAnimation { store.currentStep += 1 }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color(hex: "#0B6E4F"))
                } else {
                    NavigationLink {
                        ResultsView()
                    } label: {
                        Text("Voir mes aides")
                            .font(.headline)
                            .padding(.horizontal, 24)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color(hex: "#0B6E4F"))
                    .simultaneousGesture(TapGesture().onEnded { store.simulate() })
                }
            }
            .padding(20)
        }
        .navigationTitle("Simulateur")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Steps

struct SituationStep: View {
    @EnvironmentObject var store: SimulatorStore

    var body: some View {
        Form {
            Section("Votre situation") {
                Stepper("Age : \(store.situation.age) ans",
                        value: $store.situation.age, in: 16...99)
                Toggle("En couple", isOn: $store.situation.en_couple)
                Stepper("Enfants a charge : \(store.situation.nb_enfants)",
                        value: $store.situation.nb_enfants, in: 0...10)
                Toggle("Handicap reconnu (RQTH ou AAH)", isOn: $store.situation.handicap)
            }
        }
    }
}

struct LogementStep: View {
    @EnvironmentObject var store: SimulatorStore

    var body: some View {
        Form {
            Section("Logement") {
                Picker("Statut", selection: $store.situation.locataire) {
                    Text("Locataire").tag(true)
                    Text("Proprietaire / Heberge").tag(false)
                }
                .pickerStyle(.segmented)

                if store.situation.locataire {
                    HStack {
                        Text("Loyer mensuel (EUR)")
                        Spacer()
                        TextField("700", value: $store.situation.loyer_mensuel,
                                  format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                }

                Picker("Zone APL", selection: $store.situation.zone) {
                    Text("Zone 1 (Paris / Ile-de-France)").tag(1)
                    Text("Zone 2 (grandes villes)").tag(2)
                    Text("Zone 3 (autres)").tag(3)
                }
            }
        }
    }
}

struct RevenusStep: View {
    @EnvironmentObject var store: SimulatorStore

    var body: some View {
        Form {
            Section("Revenus") {
                HStack {
                    Text("Salaire net mensuel (EUR)")
                    Spacer()
                    TextField("1400", value: $store.situation.salaire_net_mensuel,
                              format: .number)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                }
                HStack {
                    Text("Autres revenus (EUR)")
                    Spacer()
                    TextField("0", value: $store.situation.autres_revenus,
                              format: .number)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                }
                HStack {
                    Text("Patrimoine mobilier (EUR)")
                    Spacer()
                    TextField("0", value: $store.situation.patrimoine,
                              format: .number)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                }
            }
        }
    }
}

struct SanteStep: View {
    @EnvironmentObject var store: SimulatorStore

    var body: some View {
        Form {
            Section("Sante") {
                Toggle("ALD (affection longue duree)", isOn: $store.situation.ald)
                Toggle("Dependance (GIR 1-4)", isOn: $store.situation.dependance)
                Toggle("Deja beneficiaire CSS/CMU-C", isOn: $store.situation.cmu_c)
            }
        }
    }
}

struct EmploiStep: View {
    @EnvironmentObject var store: SimulatorStore

    var body: some View {
        Form {
            Section("Situation professionnelle") {
                Picker("Statut emploi", selection: $store.situation.emploi_status_raw) {
                    Text("Salarie CDI/CDD").tag("Salarie")
                    Text("En recherche d'emploi").tag("Chomeur")
                    Text("Etudiant").tag("Etudiant")
                    Text("Retraite").tag("Retraite")
                    Text("Independant / TNS").tag("Independant")
                    Text("Sans activite").tag("SansSituation")
                }
                Toggle("Etudiant boursier", isOn: $store.situation.etudiant_boursier)
            }
        }
    }
}
