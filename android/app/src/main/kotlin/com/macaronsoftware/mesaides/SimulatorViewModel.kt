package com.macaronsoftware.mesaides

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import uniffi.aides_core.Situation as FfiSituation
import uniffi.aides_core.simulate as ffiSimulate
import uniffi.aides_core.translate as ffiTranslate
import uniffi.aides_core.supportedLangs as ffiSupportedLangs
import uniffi.aides_core.listAides as ffiListAides

// Modeles

data class SituationModel(
    val age: Int = 30,
    val situationFamiliale: String = "celibataire",
    val nbEnfants: Int = 0,
    val agesEnfants: List<Int> = emptyList(),
    val logement: String = "locataire",
    val loyerMensuel: Double = 700.0,
    val codePostal: String? = null,
    val zoneApl: Int? = 2,
    val revenusNetsMensuels: Double = 0.0,
    val revenusConjoint: Double = 0.0,
    val patrimoineEstime: Double = 0.0,
    val ald: Boolean = false,
    val rqth: Boolean = false,
    val invalidite: Boolean = false,
    val dependance: Boolean = false,
    val gir: Int? = null,
    val cmuC: Boolean = false,
    val emploi: String = "sans_situation",
    val ancienneteEmploiMois: Int = 0,
    val heuresSemaine: Double = 0.0,
    val primoAccedant: Boolean = false,
    val etudiantBoursier: Boolean = false,
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

// Pont vers le moteur Rust via UniFFI JNI.
// 0 reseau, 28 aides, baremes 2026 complets.

object LocalEngine {

    fun run(s: SituationModel): SimulationResultModel {
        val ffiSit = FfiSituation(
            age = s.age.toUByte(),
            situationFamiliale = s.situationFamiliale,
            nbEnfants = s.nbEnfants.toUByte(),
            agesEnfants = s.agesEnfants.map { it.toUByte() },
            logement = s.logement,
            loyerMensuel = s.loyerMensuel,
            codePostal = s.codePostal,
            zoneApl = s.zoneApl?.toUByte(),
            revenusNetsMensuels = s.revenusNetsMensuels,
            revenusConjoint = s.revenusConjoint,
            patrimoineEstime = s.patrimoineEstime,
            ald = s.ald,
            rqth = s.rqth,
            invalidite = s.invalidite,
            dependance = s.dependance,
            gir = s.gir?.toUByte(),
            cmuC = s.cmuC,
            emploi = s.emploi,
            ancienneteEmploiMois = s.ancienneteEmploiMois.toUInt(),
            heureSemaine = s.heuresSemaine,
            primoAccedant = s.primoAccedant,
            etudiantBoursier = s.etudiantBoursier,
        )

        val ffiResult = ffiSimulate(ffiSit)

        val aides = ffiResult.aidesEligibles.map { a ->
            AideResultModel(
                aideId = a.aideId,
                nom = a.aideId,
                eligible = a.eligible,
                montantMensuel = a.montantMensuel,
                raisons = a.raisons,
                etapes = (0 until a.nbEtapes.toInt()).map { i ->
                    EtapeModel("Etape ${i + 1}", "", "")
                },
                lienOfficiel = "https://www.service-public.fr"
            )
        }

        return SimulationResultModel(
            aidesEligibles = aides,
            totalMensuel = ffiResult.totalMensuel
        )
    }
}

// Locale manager backed by Rust core (50 embedded locales, 0 network)

object LocaleManager {
    var currentLocale: String = "fr"

    fun t(key: String): String = ffiTranslate(currentLocale, key)
    fun t(key: String, lang: String): String = ffiTranslate(lang, key)
    fun availableLocales(): List<String> = ffiSupportedLangs()
}

// ViewModel -- calcul local via Rust core, 0 reseau

class SimulatorViewModel : ViewModel() {

    val situation = MutableLiveData(SituationModel())
    val result    = MutableLiveData<SimulationResultModel?>()

    fun simulate() {
        result.value = LocalEngine.run(situation.value ?: SituationModel())
    }
}
