import SwiftUI
import PDFKit

/// Generates a PDF from simulation results and presents the share sheet
struct PDFExportView: View {
    let result: SimulationResultDTO
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            PDFKitView(data: makePDF())
                .navigationTitle("Mon rapport PDF")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Fermer") { dismiss() }
                    }
                    ToolbarItem(placement: .navigationBarTrailing) {
                        ShareLink(item: makePDF(), preview: SharePreview("mes-aides.pdf"))
                    }
                }
        }
    }

    private func makePDF() -> Data {
        let renderer = UIGraphicsPDFRenderer(bounds: CGRect(x: 0, y: 0, width: 595, height: 842))
        return renderer.pdfData { ctx in
            ctx.beginPage()
            let attrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 20),
                .foregroundColor: UIColor(red: 0.04, green: 0.43, blue: 0.31, alpha: 1)
            ]
            "Mes Aides — Rapport personnalise".draw(at: CGPoint(x: 40, y: 40), withAttributes: attrs)

            let sub: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 14),
                .foregroundColor: UIColor.darkGray
            ]
            let totalStr = String(format: "Total estime : %.0f EUR/mois — %d aide(s)",
                                  result.totalMensuel, result.aidesEligibles.count)
            totalStr.draw(at: CGPoint(x: 40, y: 72), withAttributes: sub)

            var y: CGFloat = 110
            let bodyAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 11),
                .foregroundColor: UIColor.black
            ]
            for aide in result.aidesEligibles {
                if y > 780 { ctx.beginPage(); y = 40 }
                let montant = aide.montantMensuel.map { String(format: "  %.0f EUR/mois", $0) } ?? ""
                "• \(aide.nom)\(montant)".draw(at: CGPoint(x: 40, y: y), withAttributes: bodyAttrs)
                y += 18
                for (i, etape) in aide.etapes.prefix(3).enumerated() {
                    if y > 780 { ctx.beginPage(); y = 40 }
                    "    \(i + 1). \(etape.titre)".draw(at: CGPoint(x: 40, y: y), withAttributes: [
                        .font: UIFont.systemFont(ofSize: 9.5),
                        .foregroundColor: UIColor.gray,
                    ])
                    y += 14
                }
                y += 8
            }

            let footer: [NSAttributedString.Key: Any] = [
                .font: UIFont.italicSystemFont(ofSize: 9),
                .foregroundColor: UIColor.lightGray,
            ]
            "aides.macaron-software.com — Resultats indicatifs".draw(
                at: CGPoint(x: 40, y: 810), withAttributes: footer)
        }
    }
}

/// Wraps PDFKit PDFView in a SwiftUI view
struct PDFKitView: UIViewRepresentable {
    let data: Data

    func makeUIView(context: Context) -> PDFView {
        let pdfView = PDFView()
        pdfView.autoScales = true
        pdfView.document = PDFDocument(data: data)
        return pdfView
    }

    func updateUIView(_ uiView: PDFView, context: Context) {
        uiView.document = PDFDocument(data: data)
    }
}
