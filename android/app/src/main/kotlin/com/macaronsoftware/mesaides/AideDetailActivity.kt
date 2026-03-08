package com.macaronsoftware.mesaides

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/** Détail d'une aide — données passées en mémoire via companion, pas de sérialisation */
class AideDetailActivity : AppCompatActivity() {

    companion object {
        private var pendingAide: AideResultModel? = null

        fun newIntent(ctx: Context, aide: AideResultModel): Intent {
            pendingAide = aide
            return Intent(ctx, AideDetailActivity::class.java)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_aide_detail)

        val aide = pendingAide ?: return
        pendingAide = null

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
