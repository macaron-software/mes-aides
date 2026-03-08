import SwiftUI

/// Step-by-step guide for a single aid + link to official forms
struct AideDetailView: View {
    let aide: AideResultDTO

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text(aide.nom)
                        .font(.title2.bold())
                    if let montant = aide.montantMensuel, montant > 0 {
                        Text(String(format: "Montant estime : %.0f EUR/mois", montant))
                            .font(.subheadline)
                            .foregroundColor(Color(hex: "#0B6E4F"))
                    }
                    if !aide.raisons.isEmpty {
                        Text(aide.raisons.joined(separator: "\n"))
                            .font(.footnote)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(hex: "#E8F5F0"))
                .cornerRadius(12)

                // Demarche steps
                if !aide.etapes.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Comment faire votre demande")
                            .font(.headline)

                        ForEach(Array(aide.etapes.enumerated()), id: \.offset) { idx, etape in
                            HStack(alignment: .top, spacing: 12) {
                                Text("\(idx + 1)")
                                    .font(.system(.caption, design: .rounded).bold())
                                    .frame(width: 24, height: 24)
                                    .background(Color(hex: "#0B6E4F"))
                                    .foregroundColor(.white)
                                    .clipShape(Circle())
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(etape.titre)
                                        .font(.subheadline.bold())
                                    Text(etape.description)
                                        .font(.footnote)
                                        .foregroundColor(.secondary)
                                    if let url = URL(string: etape.lien), !etape.lien.isEmpty {
                                        Link("Acceder au formulaire", destination: url)
                                            .font(.caption)
                                            .foregroundColor(Color(hex: "#0B6E4F"))
                                    }
                                }
                            }
                        }
                    }
                    .padding()
                }

                // Official link
                if let url = URL(string: aide.lienOfficiel), !aide.lienOfficiel.isEmpty {
                    Link(destination: url) {
                        Label("Site officiel", systemImage: "link")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(hex: "#0B6E4F"))
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .padding(.horizontal)
                }

                Spacer(minLength: 32)
            }
            .padding()
        }
        .navigationTitle(aide.nom)
        .navigationBarTitleDisplayMode(.inline)
    }
}
