import Foundation
import Combine

// MARK: - DTOs (mirroring Rust JSON output from /api/simulate)

struct EtapeDTO: Identifiable, Codable {
    var id = UUID()
    let titre: String
    let description: String
    let lien: String

    enum CodingKeys: String, CodingKey {
        case titre, description, lien
    }
}

struct AideResultDTO: Identifiable, Codable {
    var id = UUID()
    let aideId: String
    let nom: String
    let eligible: Bool
    let montantMensuel: Double?
    let raisons: [String]
    let etapes: [EtapeDTO]
    let lienOfficiel: String

    enum CodingKeys: String, CodingKey {
        case aideId = "aide_id"
        case nom, eligible
        case montantMensuel = "montant_mensuel"
        case raisons, etapes
        case lienOfficiel = "lien_officiel"
    }
}

struct SimulationResultDTO: Codable {
    let aidesEligibles: [AideResultDTO]
    let totalMensuel: Double

    enum CodingKeys: String, CodingKey {
        case aidesEligibles = "aides_eligibles"
        case totalMensuel   = "total_mensuel"
    }
}

// MARK: - Situation form model

struct SituationForm: Codable {
    var age: Int = 30
    var en_couple: Bool = false
    var nb_enfants: Int = 0
    var handicap: Bool = false
    var locataire: Bool = true
    var loyer_mensuel: Double = 700
    var zone: Int = 2
    var salaire_net_mensuel: Double = 0
    var autres_revenus: Double = 0
    var patrimoine: Double = 0
    var ald: Bool = false
    var dependance: Bool = false
    var cmu_c: Bool = false
    var emploi_status_raw: String = "SansSituation"
    var etudiant_boursier: Bool = false
}

// MARK: - Store

@MainActor
final class SimulatorStore: ObservableObject {
    @Published var situation = SituationForm()
    @Published var currentStep = 0
    @Published var result: SimulationResultDTO?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // Set API_BASE_URL in Info.plist or build settings for production
    private let baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3001"

    func simulate() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let url = URL(string: "\(baseURL)/api/simulate")!
                var req = URLRequest(url: url)
                req.httpMethod = "POST"
                req.setValue("application/json", forHTTPHeaderField: "Content-Type")
                req.httpBody = try JSONEncoder().encode(situation)

                let (data, _) = try await URLSession.shared.data(for: req)
                let decoded = try JSONDecoder().decode(SimulationResultDTO.self, from: data)
                result = decoded
            } catch {
                errorMessage = error.localizedDescription
            }
            isLoading = false
        }
    }
}

// MARK: - Color helper

extension Color {
    init(hex: String) {
        var hex = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if hex.hasPrefix("#") { hex.removeFirst() }
        let val = UInt64(hex, radix: 16) ?? 0
        let r = Double((val >> 16) & 0xFF) / 255
        let g = Double((val >>  8) & 0xFF) / 255
        let b = Double((val      ) & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
