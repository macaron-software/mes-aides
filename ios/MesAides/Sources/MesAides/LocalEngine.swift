import Foundation

// Pont vers le moteur Rust via UniFFI.
// 0 reseau, 28 aides, baremes 2026 complets.

enum LocalEngine {

    static func run(_ s: SituationForm) -> SimulationResultDTO {
        let ffiSit = FfiSituation(
            age: UInt8(clamping: s.age),
            situationFamiliale: s.en_couple ? "couple" : s.situation_familiale,
            nbEnfants: UInt8(clamping: s.nb_enfants),
            agesEnfants: Data(s.ages_enfants.map { UInt8(clamping: $0) }),
            logement: s.locataire ? "locataire" : s.logement,
            loyerMensuel: s.loyer_mensuel,
            codePostal: s.code_postal,
            zoneApl: (s.zone ?? s.zone_apl).map { UInt8(clamping: $0) },
            revenusNetsMensuels: s.salaire_net_mensuel > 0 ? s.salaire_net_mensuel : s.revenus_nets_mensuels,
            revenusConjoint: s.autres_revenus > 0 ? s.autres_revenus : s.revenus_conjoint,
            patrimoineEstime: s.patrimoine > 0 ? s.patrimoine : s.patrimoine_estime,
            ald: s.ald,
            rqth: s.handicap || s.rqth,
            invalidite: s.invalidite,
            dependance: s.dependance,
            gir: s.gir.map { UInt8(clamping: $0) },
            cmuC: s.cmu_c,
            emploi: s.emploi_status_raw.isEmpty ? s.emploi : s.emploi_status_raw,
            ancienneteEmploiMois: UInt32(s.anciennete_emploi_mois),
            heuresSemaine: s.heures_semaine,
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
