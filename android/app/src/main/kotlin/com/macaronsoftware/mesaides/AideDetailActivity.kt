package com.macaronsoftware.mesaides

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.gson.Gson

/** Step-by-step guide for one aid */
class AideDetailActivity : AppCompatActivity() {

    companion object {
        private const val KEY_AIDE = "aide_json"

        fun newIntent(ctx: Context, aide: AideResultModel): Intent =
            Intent(ctx, AideDetailActivity::class.java).apply {
                putExtra(KEY_AIDE, Gson().toJson(aide))
            }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_aide_detail)

        val json = intent.getStringExtra(KEY_AIDE) ?: return
        val aide = Gson().fromJson(json, AideResultModel::class.java)

        title = aide.nom

        val container = findViewById<LinearLayout>(R.id.stepsContainer)

        aide.etapes.forEachIndexed { idx, etape ->
            val tv = TextView(this).apply {
                text = "${idx + 1}. ${etape.titre}\n${etape.description}"
                setPadding(0, 16, 0, 16)
                textSize = 14f
            }
            container.addView(tv)
        }
    }
}
