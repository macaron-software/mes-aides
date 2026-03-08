package com.macaronsoftware.mesaides

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.text.NumberFormat
import java.util.Locale

/** Displays eligible aids sorted by monthly amount */
class ResultsActivity : AppCompatActivity() {

    companion object {
        fun newIntent(ctx: Context) = Intent(ctx, ResultsActivity::class.java)
    }

    private lateinit var viewModel: SimulatorViewModel
    private val fmt = NumberFormat.getNumberInstance(Locale.FRENCH)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_results)

        viewModel = ViewModelProvider(this)[SimulatorViewModel::class.java]

        viewModel.result.observe(this) { result ->
            result ?: return@observe

            val totalLabel = "Total estimé : ${fmt.format(result.totalMensuel.toLong())} €/mois"
            findViewById<TextView>(R.id.tvTotal).text = totalLabel

            val rv = findViewById<RecyclerView>(R.id.rvAides)
            rv.layoutManager = LinearLayoutManager(this)
            rv.adapter = AideAdapter(result.aidesEligibles) { aide ->
                startActivity(AideDetailActivity.newIntent(this, aide))
            }
        }


        findViewById<Button>(R.id.btnPdf).setOnClickListener {
            viewModel.result.value?.let { res ->
                PdfGenerator(this).generate(res)
            }
        }
    }
}

// MARK: — RecyclerView adapter

class AideAdapter(
    private val items: List<AideResultModel>,
    private val onClick: (AideResultModel) -> Unit,
) : RecyclerView.Adapter<AideAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvName: TextView = v.findViewById(R.id.tvName)
        val tvAmount: TextView = v.findViewById(R.id.tvAmount)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_aide, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val aide = items[position]
        holder.tvName.text = aide.nom
        holder.tvAmount.text = aide.montantMensuel
            ?.let { String.format("%.0f €/mois", it) }
            ?: "Variable"
        holder.itemView.setOnClickListener { onClick(aide) }
    }

    override fun getItemCount() = items.size
}
