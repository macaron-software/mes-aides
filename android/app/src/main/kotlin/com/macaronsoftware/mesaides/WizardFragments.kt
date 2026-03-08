package com.macaronsoftware.mesaides

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.NumberPicker
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.setFragmentResult

// ─── Situation step ──────────────────────────────────────────────────────────

class SituationFragment : Fragment() {
    private val vm: SimulatorViewModel by activityViewModels()

    override fun onCreateView(i: LayoutInflater, c: ViewGroup?, s: Bundle?) =
        i.inflate(R.layout.fragment_situation, c, false)

    override fun onViewCreated(v: View, s: Bundle?) {
        v.findViewById<Button>(R.id.btnNext).setOnClickListener {
            setFragmentResult("next", bundleOf())
        }
    }
}

// ─── Logement step ───────────────────────────────────────────────────────────

class LogementFragment : Fragment() {
    private val vm: SimulatorViewModel by activityViewModels()

    override fun onCreateView(i: LayoutInflater, c: ViewGroup?, s: Bundle?) =
        i.inflate(R.layout.fragment_logement, c, false)

    override fun onViewCreated(v: View, s: Bundle?) {
        v.findViewById<Button>(R.id.btnNext).setOnClickListener {
            setFragmentResult("next", bundleOf())
        }
        v.findViewById<Button>(R.id.btnBack).setOnClickListener {
            setFragmentResult("back", bundleOf())
        }
    }
}

// ─── Revenus step ────────────────────────────────────────────────────────────

class RevenusFragment : Fragment() {
    private val vm: SimulatorViewModel by activityViewModels()

    override fun onCreateView(i: LayoutInflater, c: ViewGroup?, s: Bundle?) =
        i.inflate(R.layout.fragment_revenus, c, false)

    override fun onViewCreated(v: View, s: Bundle?) {
        v.findViewById<Button>(R.id.btnNext).setOnClickListener {
            setFragmentResult("next", bundleOf())
        }
        v.findViewById<Button>(R.id.btnBack).setOnClickListener {
            setFragmentResult("back", bundleOf())
        }
    }
}

// ─── Sante step ──────────────────────────────────────────────────────────────

class SanteFragment : Fragment() {
    private val vm: SimulatorViewModel by activityViewModels()

    override fun onCreateView(i: LayoutInflater, c: ViewGroup?, s: Bundle?) =
        i.inflate(R.layout.fragment_sante, c, false)

    override fun onViewCreated(v: View, s: Bundle?) {
        v.findViewById<Button>(R.id.btnNext).setOnClickListener {
            setFragmentResult("next", bundleOf())
        }
        v.findViewById<Button>(R.id.btnBack).setOnClickListener {
            setFragmentResult("back", bundleOf())
        }
    }
}

// ─── Emploi step ─────────────────────────────────────────────────────────────

class EmploiFragment : Fragment() {
    private val vm: SimulatorViewModel by activityViewModels()

    override fun onCreateView(i: LayoutInflater, c: ViewGroup?, s: Bundle?) =
        i.inflate(R.layout.fragment_emploi, c, false)

    override fun onViewCreated(v: View, s: Bundle?) {
        // last step — btnNext triggers simulate
        v.findViewById<Button>(R.id.btnNext).setOnClickListener {
            setFragmentResult("next", bundleOf())
        }
        v.findViewById<Button>(R.id.btnBack).setOnClickListener {
            setFragmentResult("back", bundleOf())
        }
    }
}
