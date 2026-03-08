package com.macaronsoftware.mesaides

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

// Modèles

data class SituationModel(
    val age: Int = 30,
    val en_couple: Boolean = false,
    val nb_enfants: Int = 0,
    val handicap: Boolean = false,
    val locataire: Boolean = true,
    val loyer_mensuel: Double = 700.0,
    val zone: Int = 2,
    val salaire_net_mensuel: Double = 0.0,
    val autres_revenus: Double = 0.0,
    val patrimoine: Double = 0.0,
    val ald: Boolean = false,
    val dependance: Boolean = false,
    val cmu_c: Boolean = false,
    val emploi_status_raw: String = "SansSituation",
    val etudiant_boursier: Boolean = false,
)

data class EtapeModel(val titre: String, val description: String, val lien: String)

data class AideResultModel(
    val aideId: String,
    val nom: String,
    val eligible: Boolean,
    val montantMensuel: Double?,
    val raisons: List<String>,
    val etapes: List<EtapeModel>,
    val lienOfficiel: String,
)

data class SimulationResultModel(
    val aidesEligibles: List<AideResultModel>,
    val totalMensuel: Double,
)

// Moteur de calcul local — barèmes 2026
// Aucun réseau, aucun stockage, aucune donnée transmise.

object LocalEngine {

    fun run(s: SituationModel): SimulationResultModel {
        val rev = s.salaire_net_mensuel + s.autres_revenus
        val aides = mutableListOf<AideResultModel>()

        // RSA
        if (s.emploi_status_raw != "Salarie" && s.emploi_status_raw != "Retraite" && rev < 1102) {
            val base = if (s.en_couple) 1041.0 else if (s.nb_enfants > 0) 777.0 else 635.71
            val montant = maxOf(0.0, base - rev * 0.68)
            aides += aide("rsa", "Revenu de Solidarité Active (RSA)", montant, listOf(
                "Rendez-vous CAF", "Dossier RSA", "Contrat engagement", "Versement mensuel", "Actualisation trimestrielle"))
        }

        // APL
        if (s.locataire && s.loyer_mensuel > 100) {
            val plafonds = listOf(380.0, 290.0, 250.0)
            val base = plafonds.getOrElse(s.zone - 1) { 250.0 }
            val montant = maxOf(0.0, base - rev * 0.2)
            if (montant > 15)
                aides += aide("apl", "Aide Personnalisée au Logement (APL)", montant, listOf(
                    "Simulation CAF", "Dossier en ligne", "Vérification contrat bail", "Versement mensuel"))
        }

        // Prime d'activité
        if (s.emploi_status_raw == "Salarie" && rev > 0 && rev < 1900) {
            val montant = maxOf(0.0, 354.0 - maxOf(0.0, rev - 1063) * 0.38)
            aides += aide("prime-activite", "Prime d'Activité", montant, listOf(
                "Simulation CAF", "Dossier en ligne", "Actualisation mensuelle"))
        }

        // AAH
        if (s.handicap && rev < 1016) {
            val montant = if (s.en_couple) maxOf(0.0, 1016.85 - rev) else 1016.85
            aides += aide("aah", "Allocation aux Adultes Handicapés (AAH)", montant, listOf(
                "Dossier MDPH", "Reconnaissance handicap", "Demande CAF", "Commission CDAPH", "Notification", "Versement"))
        }

        // Chèque énergie
        if (rev < 2500) {
            val montant = if (rev < 1000) 277.0 / 12 else 200.0 / 12
            aides += aide("cheque-energie", "Chèque Énergie", montant, listOf(
                "Attribution automatique (courrier)"))
        }

        // CSS (ex-CMU-C)
        if (!s.cmu_c && rev < 900) {
            aides += aide("css", "Complémentaire Santé Solidaire (CSS)", 0.0, listOf(
                "Dossier Ameli", "Validation revenus", "Carte vitale mise à jour"))
        }

        // ALS (si pas d'APL)
        if (s.locataire && aides.none { it.aideId == "apl" } && rev < 1200) {
            val montant = maxOf(0.0, 200.0 - rev * 0.1)
            aides += aide("als", "Allocation de Logement Social (ALS)", montant, listOf(
                "Dossier CAF", "Justificatif bail", "Versement mensuel"))
        }

        val sorted = aides.sortedByDescending { it.montantMensuel ?: 0.0 }
        val total  = sorted.mapNotNull { it.montantMensuel }.sum()
        return SimulationResultModel(aidesEligibles = sorted, totalMensuel = total)
    }

    private fun aide(id: String, nom: String, montant: Double, steps: List<String>) =
        AideResultModel(
            aideId = id,
            nom = nom,
            eligible = true,
            montantMensuel = if (montant > 0) montant else null,
            raisons = emptyList(),
            etapes = steps.mapIndexed { i, t -> EtapeModel("Étape ${i + 1}", t, "") },
            lienOfficiel = "https://www.service-public.fr"
        )
}

// ViewModel — calcul local uniquement, aucun réseau

class SimulatorViewModel : ViewModel() {

    val situation = MutableLiveData(SituationModel())
    val result    = MutableLiveData<SimulationResultModel?>()

    /** Calcul instantané dans le thread courant — pas d'IO, pas de réseau */
    fun simulate() {
        result.value = LocalEngine.run(situation.value ?: SituationModel())
    }
}
