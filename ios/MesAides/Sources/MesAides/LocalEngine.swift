import Foundation

// Moteur de calcul local — barèmes 2026
// Aucun réseau, aucun stockage, aucune donnée transmise.

enum LocalEngine {

    static func run(_ s: SituationForm) -> SimulationResultDTO {
        var aides: [AideResultDTO] = []
        let rev = s.salaire_net_mensuel + s.autres_revenus

        // RSA
        if s.emploi_status_raw != "Salarie" && s.emploi_status_raw != "Retraite" && rev < 1102 {
            let base = s.en_couple ? 1041.0 : (s.nb_enfants > 0 ? 777.0 : 635.71)
            let montant = max(0, base - rev * 0.68)
            aides.append(aide("rsa", "Revenu de Solidarité Active (RSA)", montant, "revenus",
                steps: ["Rendez-vous CAF", "Dossier RSA", "Contrat engagement", "Versement mensuel", "Actualisation trimestrielle"]))
        }

        // APL
        if s.locataire && s.loyer_mensuel > 100 {
            let plafonds = [380.0, 290.0, 250.0]
            let base = s.zone < 3 ? plafonds[s.zone - 1] : plafonds[2]
            let montant = max(0, base - rev * 0.2)
            if montant > 15 {
                aides.append(aide("apl", "Aide Personnalisée au Logement (APL)", montant, "logement",
                    steps: ["Simulation CAF", "Dossier en ligne", "Vérification contrat bail", "Versement mensuel"]))
            }
        }

        // Prime d'activité
        if s.emploi_status_raw == "Salarie" && rev > 0 && rev < 1900 {
            let montant = max(0, 354 - max(0, rev - 1063) * 0.38)
            aides.append(aide("prime-activite", "Prime d'Activité", montant, "revenus",
                steps: ["Simulation CAF", "Dossier en ligne", "Actualisation mensuelle"]))
        }

        // AAH
        if s.handicap && rev < 1016 {
            let montant = s.en_couple ? max(0, 1016.85 - rev) : 1016.85
            aides.append(aide("aah", "Allocation aux Adultes Handicapés (AAH)", montant, "handicap",
                steps: ["Dossier MDPH", "Reconnaissance handicap", "Demande CAF", "Commission CDAPH", "Notification", "Versement"]))
        }

        // Chèque énergie
        if rev < 2500 {
            let montant = rev < 1000 ? 277.0 / 12 : 200.0 / 12
            aides.append(aide("cheque-energie", "Chèque Énergie", montant, "energie",
                steps: ["Attribution automatique (courrier)"]))
        }

        // CSS (ex-CMU-C)
        if !s.cmu_c && rev < 900 {
            aides.append(aide("css", "Complémentaire Santé Solidaire (CSS)", 0, "sante",
                steps: ["Dossier Ameli", "Validation revenus", "Carte vitale mise à jour"]))
        }

        // ALS (si APL non obtenu)
        if s.locataire && !aides.contains(where: { $0.aideId == "apl" }) && rev < 1200 {
            let montant = max(0, 200.0 - rev * 0.1)
            aides.append(aide("als", "Allocation de Logement Social (ALS)", montant, "logement",
                steps: ["Dossier CAF", "Justificatif bail", "Versement mensuel"]))
        }

        let sorted = aides.sorted { ($0.montantMensuel ?? 0) > ($1.montantMensuel ?? 0) }
        let total  = sorted.compactMap { $0.montantMensuel }.reduce(0, +)
        return SimulationResultDTO(aidesEligibles: sorted, totalMensuel: total)
    }

    private static func aide(
        _ id: String, _ nom: String, _ montant: Double, _ categorie: String,
        steps: [String]
    ) -> AideResultDTO {
        AideResultDTO(
            aideId: id,
            nom: nom,
            eligible: true,
            montantMensuel: montant > 0 ? montant : nil,
            raisons: [],
            etapes: steps.enumerated().map { i, t in
                EtapeDTO(titre: "Étape \(i + 1)", description: t, lien: "")
            },
            lienOfficiel: "https://www.service-public.fr"
        )
    }
}
