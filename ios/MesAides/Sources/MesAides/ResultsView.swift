import SwiftUI

/// Simulation results list sorted by descending monthly amount
struct ResultsView: View {
    @EnvironmentObject var store: SimulatorStore
    @State private var showPDF = false

    var body: some View {
        Group {
            if store.isLoading {
                ProgressView("Analyse en cours...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let result = store.result {
                resultContent(result)
            } else {
                Text("Aucun resultat disponible.")
                    .foregroundColor(.secondary)
            }
        }
        .navigationTitle("Mes aides")
        .navigationBarTitleDisplayMode(.large)
        .sheet(isPresented: $showPDF) {
            if let result = store.result {
                PDFExportView(result: result)
            }
        }
    }

    @ViewBuilder
    private func resultContent(_ result: SimulationResultDTO) -> some View {
        VStack(spacing: 0) {
            // Summary banner
            HStack {
                VStack(alignment: .leading) {
                    Text("Total estime")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(String(format: "%.0f EUR/mois", result.totalMensuel))
                        .font(.system(size: 26, weight: .bold))
                        .foregroundColor(Color(hex: "#0B6E4F"))
                }
                Spacer()
                Button {
                    showPDF = true
                } label: {
                    Label("PDF", systemImage: "arrow.down.doc.fill")
                        .font(.caption)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color(hex: "#D97706"))
            }
            .padding()
            .background(Color(hex: "#E8F5F0"))

            // Aids list
            List(result.aidesEligibles) { aide in
                NavigationLink {
                    AideDetailView(aide: aide)
                } label: {
                    AideRow(aide: aide)
                }
            }
            .listStyle(.plain)
        }
    }
}

struct AideRow: View {
    let aide: AideResultDTO

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(aide.nom)
                    .font(.headline)
                if let raison = aide.raisons.first {
                    Text(raison)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
            }
            Spacer()
            if let montant = aide.montantMensuel, montant > 0 {
                Text(String(format: "%.0f€", montant))
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(Color(hex: "#0B6E4F"))
            } else {
                Text("Variable")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
