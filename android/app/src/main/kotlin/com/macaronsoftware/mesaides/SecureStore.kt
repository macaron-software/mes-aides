package com.macaronsoftware.mesaides

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import org.json.JSONObject

/// AES-256 encrypted storage for user situation data.
/// All data stays on-device, encrypted by Android Keystore.
object SecureStore {

    private const val FILE_NAME = "mesaides_secure_prefs"
    private const val KEY_SITUATION = "situation_json"

    private fun prefs(context: Context): SharedPreferences {
        val masterKey = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        return EncryptedSharedPreferences.create(
            FILE_NAME,
            masterKey,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun save(context: Context, situation: SituationModel) {
        val json = JSONObject().apply {
            put("age", situation.age)
            put("situation_familiale", situation.situationFamiliale)
            put("nb_enfants", situation.nbEnfants)
            put("logement", situation.logement)
            put("loyer_mensuel", situation.loyerMensuel)
            put("revenus_nets_mensuels", situation.revenusNetsMensuels)
            put("revenus_conjoint", situation.revenusConjoint)
            put("patrimoine_estime", situation.patrimoineEstime)
            put("ald", situation.ald)
            put("rqth", situation.rqth)
            put("invalidite", situation.invalidite)
            put("dependance", situation.dependance)
            put("cmu_c", situation.cmuC)
            put("emploi", situation.emploi)
            put("anciennete_emploi_mois", situation.ancienneteEmploiMois)
            put("heures_semaine", situation.heuresSemaine)
            put("primo_accedant", situation.primoAccedant)
            put("etudiant_boursier", situation.etudiantBoursier)
        }
        prefs(context).edit().putString(KEY_SITUATION, json.toString()).apply()
    }

    fun load(context: Context): SituationModel? {
        val raw = prefs(context).getString(KEY_SITUATION, null) ?: return null
        return try {
            val j = JSONObject(raw)
            SituationModel(
                age = j.optInt("age", 30),
                situationFamiliale = j.optString("situation_familiale", "celibataire"),
                nbEnfants = j.optInt("nb_enfants", 0),
                logement = j.optString("logement", "locataire"),
                loyerMensuel = j.optDouble("loyer_mensuel", 700.0),
                revenusNetsMensuels = j.optDouble("revenus_nets_mensuels", 0.0),
                revenusConjoint = j.optDouble("revenus_conjoint", 0.0),
                patrimoineEstime = j.optDouble("patrimoine_estime", 0.0),
                ald = j.optBoolean("ald", false),
                rqth = j.optBoolean("rqth", false),
                invalidite = j.optBoolean("invalidite", false),
                dependance = j.optBoolean("dependance", false),
                cmuC = j.optBoolean("cmu_c", false),
                emploi = j.optString("emploi", "sans_situation"),
                ancienneteEmploiMois = j.optInt("anciennete_emploi_mois", 0),
                heuresSemaine = j.optDouble("heures_semaine", 0.0),
                primoAccedant = j.optBoolean("primo_accedant", false),
                etudiantBoursier = j.optBoolean("etudiant_boursier", false),
            )
        } catch (_: Exception) { null }
    }

    fun delete(context: Context) {
        prefs(context).edit().remove(KEY_SITUATION).apply()
    }
}
