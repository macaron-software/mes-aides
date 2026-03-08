package com.macaronsoftware.mesaides

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.commit
import androidx.lifecycle.ViewModelProvider

/** 5-step wizard host activity */
class SimulatorActivity : AppCompatActivity() {

    lateinit var viewModel: SimulatorViewModel

    companion object {
        fun newIntent(ctx: Context) = Intent(ctx, SimulatorActivity::class.java)
        private val STEPS = listOf(
            SituationFragment(),
            LogementFragment(),
            RevenusFragment(),
            SanteFragment(),
            EmploiFragment(),
        )
    }

    private var currentStep = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_simulator)

        viewModel = ViewModelProvider(this)[SimulatorViewModel::class.java]

        showStep(0)

        supportFragmentManager.setFragmentResultListener("next", this) { _, _ ->
            if (currentStep < STEPS.size - 1) showStep(currentStep + 1)
            else {
                viewModel.simulate()
                startActivity(ResultsActivity.newIntent(this))
            }
        }

        supportFragmentManager.setFragmentResultListener("back", this) { _, _ ->
            if (currentStep > 0) showStep(currentStep - 1)
        }
    }

    private fun showStep(idx: Int) {
        currentStep = idx
        supportFragmentManager.commit {
            setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
            replace(R.id.fragmentContainer, STEPS[idx])
        }
    }
}
