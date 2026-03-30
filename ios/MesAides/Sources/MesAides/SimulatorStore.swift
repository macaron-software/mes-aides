import Foundation
import Combine
import SwiftUI

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
    var situation_familiale: String = "celibataire"
    var en_couple: Bool = false
    var nb_enfants: Int = 0
    var ages_enfants: [Int] = []
    var logement: String = "locataire"
    var locataire: Bool = true
    var loyer_mensuel: Double = 700
    var code_postal: String? = nil
    var zone_apl: Int? = 2
    var zone: Int? = 2
    var revenus_nets_mensuels: Double = 0
    var salaire_net_mensuel: Double = 0
    var revenus_conjoint: Double = 0
    var autres_revenus: Double = 0
    var patrimoine_estime: Double = 0
    var patrimoine: Double = 0
    var ald: Bool = false
    var rqth: Bool = false
    var handicap: Bool = false
    var invalidite: Bool = false
    var dependance: Bool = false
    var gir: Int? = nil
    var cmu_c: Bool = false
    var emploi: String = "sans_situation"
    var emploi_status_raw: String = "sans_situation"
    var anciennete_emploi_mois: Int = 0
    var heures_semaine: Double = 0
    var primo_accedant: Bool = false
    var etudiant_boursier: Bool = false
}

// MARK: - Store

@MainActor
final class SimulatorStore: ObservableObject {
    @Published var situation = SituationForm()
    @Published var currentStep = 0
    @Published var result: SimulationResultDTO?
    @Published var isLoading = false

    init() {
        if let saved = SecureStore.load() {
            situation = saved
        }
    }

    /// Calcul 100% local via Rust core -- 28 aides, baremes 2026, 0 reseau
    func simulate() {
        isLoading = true
        try? SecureStore.save(situation)
        result = LocalEngine.run(situation)
        isLoading = false
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
