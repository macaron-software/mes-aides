package com.macaronsoftware.mesaides

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

// MARK: — Models

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

data class EtapeModel(
    val titre: String,
    val description: String,
    val lien: String,
)

data class AideResultModel(
    @SerializedName("aide_id") val aideId: String,
    val nom: String,
    val eligible: Boolean,
    @SerializedName("montant_mensuel") val montantMensuel: Double?,
    val raisons: List<String>,
    val etapes: List<EtapeModel>,
    @SerializedName("lien_officiel") val lienOfficiel: String,
)

data class SimulationResultModel(
    @SerializedName("aides_eligibles") val aidesEligibles: List<AideResultModel>,
    @SerializedName("total_mensuel") val totalMensuel: Double,
)

// MARK: — Retrofit API

interface MesAidesApi {
    @POST("api/simulate")
    suspend fun simulate(@Body situation: SituationModel): SimulationResultModel
}

// MARK: — ViewModel

class SimulatorViewModel(app: Application) : AndroidViewModel(app) {

    val situation = MutableLiveData(SituationModel())
    val result = MutableLiveData<SimulationResultModel?>()
    val error = MutableLiveData<String?>()

    // Set API_BASE_URL in BuildConfig or gradle.properties for production (default: emulator localhost)
    private val apiBaseUrl = BuildConfig.API_BASE_URL.ifEmpty { "http://10.0.2.2:3001/" }

    private val api: MesAidesApi by lazy {
        Retrofit.Builder()
            .baseUrl(apiBaseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(MesAidesApi::class.java)
    }

    fun simulate() {
        val sit = situation.value ?: return
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val res = api.simulate(sit)
                result.postValue(res)
                error.postValue(null)
            } catch (e: Exception) {
                Log.e("SimulatorViewModel", "simulate failed", e)
                error.postValue(e.message)
            }
        }
    }
}
