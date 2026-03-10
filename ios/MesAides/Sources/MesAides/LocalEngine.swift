import Foundation

// Pont vers le moteur Rust via UniFFI.
// 0 reseau, 28 aides, baremes 2026 complets.

enum LocalEngine {

    static func run(_ s: SituationForm) -> SimulationResultDTO {
        let ffiSit = Situation(
            age: UInt8(clamping: s.age),
            situationFamiliale: s.situation_familiale,
            nbEnfants: UInt8(clamping: s.nb_enfants),
            agesEnfants: s.ages_enfants.map { UInt8(clamping: $0) },
            logement: s.logement,
            loyerMensuel: s.loyer_mensuel,
            codePostal: s.code_postal,
            zoneApl: s.zone_apl.map { UInt8(clamping: $0) },
            revenusNetsMensuels: s.revenus_nets_mensuels,
            revenusConjoint: s.revenus_conjoint,
            patrimoineEstime: s.patrimoine_estime,
            ald: s.ald,
            rqth: s.rqth,
            invalidite: s.invalidite,
            dependance: s.dependance,
            gir: s.gir.map { UInt8(clamping: $0) },
            cmuC: s.cmu_c,
            emploi: s.emploi,
            ancienneteEmploiMois: UInt32(s.anciennete_emploi_mois),
            heureSemaine: s.heures_semaine,
            primoAccedant: s.primo_accedant,
            etudiantBoursier: s.etudiant_boursier
        )

        let ffiResult = simulate(situation: ffiSit)

        let aides = ffiResult.aidesEligibles.map { a in
            AideResultDTO(
                aideId: a.aideId,
                nom: a.aideId,
                eligible: a.eligible,
                montantMensuel: a.montantMensuel,
                raisons: a.raisons,
                etapes: (0..<Int(a.nbEtapes)).map { i in
                    EtapeDTO(titre: "Etape \(i + 1)", description: "", lien: "")
                },
                lienOfficiel: "https://www.service-public.fr"
            )
        }

        return SimulationResultDTO(
            aidesEligibles: aides,
            totalMensuel: ffiResult.totalMensuel
        )
    }
}
