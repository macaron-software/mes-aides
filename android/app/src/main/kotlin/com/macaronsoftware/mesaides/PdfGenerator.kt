package com.macaronsoftware.mesaides

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.os.Environment
import java.io.File
import java.io.FileOutputStream

/** Generates a PDF report using Android PdfDocument API */
class PdfGenerator(private val context: Context) {

    fun generate(result: SimulationResultModel): File {
        val doc = PdfDocument()
        val paint = Paint().apply { textSize = 14f; color = Color.BLACK }
        val bold = Paint().apply { textSize = 16f; color = Color.parseColor("#0B6E4F"); isFakeBoldText = true }
        val small = Paint().apply { textSize = 11f; color = Color.GRAY }

        val page = doc.startPage(PdfDocument.PageInfo.Builder(595, 842, 1).create())
        val canvas: Canvas = page.canvas

        // Title
        canvas.drawText("Mes Aides — Rapport personnalise", 40f, 60f, bold)
        canvas.drawText(
            String.format("Total estime : %.0f EUR/mois — %d aide(s)",
                result.totalMensuel, result.aidesEligibles.size),
            40f, 84f, paint,
        )

        var y = 120f
        for (aide in result.aidesEligibles) {
            if (y > 780f) break
            val amount = aide.montantMensuel?.let { "  ${it.toLong()} EUR/mois" } ?: ""
            canvas.drawText("• ${aide.nom}$amount", 40f, y, paint)
            y += 18f
            for ((idx, etape) in aide.etapes.take(3).withIndex()) {
                if (y > 780f) break
                canvas.drawText("    ${idx + 1}. ${etape.titre}", 40f, y, small)
                y += 14f
            }
            y += 8f
        }

        canvas.drawText("aides.macaron-software.com — Resultats indicatifs", 40f, 820f, small)
        doc.finishPage(page)

        val dir = context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS)
            ?: context.filesDir
        val file = File(dir, "mes-aides.pdf")
        doc.writeTo(FileOutputStream(file))
        doc.close()
        return file
    }
}
