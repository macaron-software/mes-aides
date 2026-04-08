/**
 * @fileoverview EU Eligibility Simulator Engine
 * Loads per-country JSON data and computes aid eligibility from user profile.
 * All amounts come from /data/aids_{cc}.json — never hardcoded here.
 */
'use strict';

/* ── Currency config ─────────────────────────────────────────────────────── */

/** @type {Object<string,{symbol:string,locale:string,suffix:boolean}>} */
const EU_CURRENCIES = {
  gb: { symbol: '£',   locale: 'en-GB', suffix: false },
  se: { symbol: 'kr',  locale: 'sv-SE', suffix: true  },
  dk: { symbol: 'kr',  locale: 'da-DK', suffix: true  },
  no: { symbol: 'kr',  locale: 'nb-NO', suffix: true  },
  ch: { symbol: 'CHF', locale: 'de-CH', suffix: false },
  pl: { symbol: 'zł',  locale: 'pl-PL', suffix: true  },
  /* World */
  jp: { symbol: '¥',   locale: 'ja-JP', code: 'JPY', suffix: false },
  ca: { symbol: 'CA$', locale: 'en-CA', code: 'CAD', suffix: false },
  mx: { symbol: 'MX$', locale: 'es-MX', code: 'MXN', suffix: false },
  us: { symbol: '$',   locale: 'en-US', code: 'USD', suffix: false },
  cn: { symbol: '¥',   locale: 'zh-CN', code: 'CNY', suffix: false },
  au: { symbol: 'A$',  locale: 'en-AU', code: 'AUD', suffix: false },
  br: { symbol: 'R$',  locale: 'pt-BR', code: 'BRL', suffix: false },
  ar: { symbol: 'AR$', locale: 'es-AR', code: 'ARS', suffix: false },
  tr: { symbol: '₺',   locale: 'tr-TR', code: 'TRY', suffix: false },
  za: { symbol: 'R',   locale: 'en-ZA', code: 'ZAR', suffix: false },
  nz: { symbol: 'NZ$', locale: 'en-NZ', code: 'NZD', suffix: false },
  /* Asia expansion */
  in: { symbol: '₹',   locale: 'en-IN', code: 'INR', suffix: false },
  kr: { symbol: '₩',   locale: 'ko-KR', code: 'KRW', suffix: false },
  sg: { symbol: 'S$',  locale: 'en-SG', code: 'SGD', suffix: false },
  /* EMEA expansion */
  ru: { symbol: '₽',   locale: 'ru-RU', code: 'RUB', suffix: false },
  ua: { symbol: '₴',   locale: 'uk-UA', code: 'UAH', suffix: false },
  il: { symbol: '₪',   locale: 'he-IL', code: 'ILS', suffix: false },
  /* LatAm expansion */
  co: { symbol: '$',   locale: 'es-CO', code: 'COP', suffix: false },
  cl: { symbol: '$',   locale: 'es-CL', code: 'CLP', suffix: false },
  pe: { symbol: 'S/',  locale: 'es-PE', code: 'PEN', suffix: false },
};

/** Maps country code → data file basename when they differ */
const CC_TO_FILE = { gb: 'uk' };

/**
 * Maps country code → local currency amount field suffix.
 * Countries not listed here use 'eur' (stored as montant_max_eur).
 */
const CURRENCY_AMOUNT_FIELD = {
  us: 'usd', ca: 'cad', au: 'aud',
  jp: 'jpy', mx: 'mxn', cn: 'cny', br: 'brl', ar: 'ars',
  tr: 'try', za: 'zar', nz: 'nzd',
  /* Asia expansion */
  in: 'inr', kr: 'krw', sg: 'sgd',
  /* EMEA expansion */
  ru: 'rub', ua: 'uah', il: 'ils',
  /* LatAm expansion */
  co: 'cop', cl: 'clp', pe: 'pen',
};

/**
 * Monthly income thresholds (local currency) used to assess income-tested aids.
 * Values approximate national poverty/minimum-income lines (2026 data).
 */
const INCOME_THRESHOLDS = {
  de: 1600, es: 1200, it: 1200, pt:  950, be: 1500,
  nl: 1400, se:18000, dk:20000, fi: 1600, at: 1400,
  ch: 3500, no:20000, gb: 1200, pl: 4000,
  /* FR: RSA eligibility threshold ~1200 EUR/month */
  fr: 1200,
  /* World (monthly net, local currency) */
  jp: 150000, ca: 2000, mx: 6000, us: 1800, cn: 3000, au: 2500, br: 1518, ar: 302000,
  tr: 2210400, za: 350000, nz: 150000,
  /* Asia expansion — monthly net, local currency */
  in: 15000, kr: 713102, sg: 2000,
  /* EMEA expansion — monthly net, local currency smallest unit */
  ru: 2216500, ua: 446200, il: 588000,
  /* LatAm expansion — monthly net, local currency */
  co: 130000000, cl: 21400000, pe: 100000,
};

/** More lenient threshold for "low_income" criteria (housing benefits etc.) */
const LOW_INCOME_THRESHOLDS = {
  de: 2500, es: 2000, it: 2000, pt: 1500, be: 2500,
  nl: 2200, se:28000, dk:30000, fi: 2500, at: 2200,
  ch: 5500, no:32000, gb: 2000, pl: 6000,
  /* FR: APL / CSS / housing benefits up to ~2000 EUR/month */
  fr: 2000,
  /* World */
  jp: 250000, ca: 3500, mx: 10000, us: 3000, cn: 5000, au: 4000, br: 3036, ar: 604000,
  tr: 4420800, za: 700000, nz: 300000,
  /* Asia expansion */
  in: 30000, kr: 1200000, sg: 4000,
  /* EMEA expansion */
  ru: 4433000, ua: 800000, il: 1000000,
  /* LatAm expansion */
  co: 260000000, cl: 42800000, pe: 200000,
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Format an amount in the country's local currency.
 * @param {number} amount
 * @param {string} cc - lowercase country code
 * @returns {string}
 */
function formatAmount(amount, cc) {
  if (amount == null || amount === 0) return '—';
  const cfg = EU_CURRENCIES[cc];
  const num = amount.toLocaleString(cfg ? cfg.locale : 'fr-FR');
  if (!cfg) return '\u20AC\u202F' + num;
  return cfg.suffix
    ? num + '\u202F' + cfg.symbol
    : cfg.symbol + '\u202F' + num;
}

/* ── EUSimulator class ───────────────────────────────────────────────────── */

class EUSimulator {
  /**
   * @param {string} countryCode - ISO 3166-1 alpha-2 lowercase (e.g. 'de')
   */
  constructor(countryCode) {
    this.cc      = countryCode.toLowerCase();
    this.data    = null;
    this.profile = {};
    this._listeners = {};
  }

  /** Fetch and parse country JSON data. Must be called before simulate(). */
  async init() {
    const base = CC_TO_FILE[this.cc] || this.cc;
    const url  = `/data/aids_${base}.json`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Cannot load ${url}: ${res.status}`);
    this.data = await res.json();
    return this;
  }

  /** Subscribe to simulator events. */
  on(event, cb) {
    (this._listeners[event] = this._listeners[event] || []).push(cb);
    return this;
  }

  /** @private */
  _emit(event, detail) {
    (this._listeners[event] || []).forEach(cb => cb(detail));
    if (typeof document !== 'undefined') {
      document.dispatchEvent(
        new CustomEvent('eu-simulator:' + event, { detail, bubbles: true })
      );
    }
  }

  /**
   * Run eligibility simulation against loaded country data.
   * @param {Object} profile - { income, age, situation, employment, housing }
   * @returns {Array} Matching aids sorted by max amount desc
   */
  simulate(profile) {
    this.profile = { ...profile, cc: this.cc };
    const results = (this.data?.aids || [])
      .filter(aid => this._checkEligibility(aid, this.profile))
      .map(aid => ({ ...aid, _formatted: this._formatAid(aid) }))
      .sort((a, b) => {
        const suffix = CURRENCY_AMOUNT_FIELD[this.cc] || 'eur';
        const bMax = b[`montant_max_${suffix}`] ?? b.montant_max_eur ?? b.montant_max ?? 0;
        const aMax = a[`montant_max_${suffix}`] ?? a.montant_max_eur ?? a.montant_max ?? 0;
        return bMax - aMax;
      });
    this._emit('result', { results, profile: this.profile, country: this.data });
    return results;
  }

  /**
   * Check whether a user profile satisfies all eligibility criteria for an aid.
   * Unknown criteria default to eligible (open-world assumption).
   * @private
   */
  _checkEligibility(aid, profile) {
    const criteria  = aid.eligibility_criteria || [];
    const cc        = this.cc;
    // income is provided in smallest currency unit (centimes/cents/øre etc.)
    // thresholds are in main currency unit → divide by 100
    const income    = (Number(profile.income)     || 0) / 100;
    const age       = Number(profile.age)        || 0;
    const situation = profile.situation          || 'single';
    const employment= profile.employment         || 'employed';
    const housing   = profile.housing            || 'rented';
    const threshold    = INCOME_THRESHOLDS[cc]    || 1500;
    const lowThreshold = LOW_INCOME_THRESHOLDS[cc] || 2500;
    const hasChildren  = ['family', 'single_parent'].includes(situation);
    const isStudent    = employment === 'student';
    const isUnemployed = employment === 'unemployed';
    const isDisabled   = employment === 'disabled';
    const isRetired    = employment === 'retired';

    return criteria.every(c => {
      // ── Residency (any prefix: residence_ or residency_) ────────────────
      if (c.startsWith('residence_') || c.startsWith('residency_')) return true;

      // ── Income ──────────────────────────────────────────────────────────
      if (c === 'income_below_threshold' ||
          c === 'isee_below_threshold')             return income <= threshold;
      if (c === 'low_income' ||
          c === 'income_threshold' ||
          c === 'income_below_threshold_rfr' ||
          c === 'income_below_threshold_for_self_employed' ||
          c === 'income_at_or_below_130pct_poverty' ||
          c === 'income_below_138pct_poverty_or_state_threshold' ||
          c === 'income_at_or_below_150pct_poverty' ||
          c === 'income_at_or_below_185pct_poverty' ||
          c === 'income_below_50pct_area_median' ||
          c === 'income_assets_tests_met' ||
          c === 'hold_concession_card_or_income_below_threshold') return income <= lowThreshold;
      if (c === 'income_above_threshold')           return income > threshold;
      if (c === 'savings_below_16000' ||
          c === 'assets_below_threshold' ||
          c === 'resources_below_2000_usd' ||
          c === 'resources_below_2750_usd')         return true; // no savings input

      // ── Age: fixed bounds ────────────────────────────────────────────────
      if (c === 'age_15_65')                        return age >= 15 && age <= 65;
      if (c === 'age_18' || c === 'age_min_18')     return age >= 18;
      if (c === 'age_19_plus')                      return age >= 19;
      if (c === 'age_30')                           return age >= 30;
      if (c === 'age_min_60' || c === 'age_60_plus')return age >= 60;
      if (c === 'age_62_plus')                      return age >= 62;
      if (c === 'age_min_65' || c === 'age_65_plus')return age >= 65;
      if (c === 'age_67_plus')                      return age >= 67;
      if (c === 'age_20_to_60')                     return age >= 20 && age <= 60;
      if (c === 'age_22_to_66')                     return age >= 22 && age <= 66;
      if (c === 'age_16_to_66')                     return age >= 16 && age <= 66;
      if (c === 'age_16_24')                        return age >= 16 && age <= 24;
      if (c === 'age_16_to_25')                     return age >= 16 && age <= 25;
      if (c === 'age_18_to_25')                     return age >= 18 && age <= 25;
      if (c === 'age_18_to_30')                     return age >= 18 && age <= 30;
      if (c === 'age_4_to_26')                      return age >= 4  && age <= 26;
      if (c === 'age_under_30_or_new_job')          return age < 30;
      if (c === 'age_under_60')                     return age < 60;
      if (c === 'age_under_65_at_access')           return age < 65;
      if (c === 'age_under_67')                     return age < 67;
      if (c === 'age_65_plus_or_blind_or_disabled' ||
          c === 'age_65_plus_or_qualifying_disability') return age >= 65 || isDisabled;
      if (c === 'age_min_70_or_disability')         return age >= 70 || isDisabled;

      // ── Children / family ────────────────────────────────────────────────
      if (c.startsWith('child_under_') ||
          c.startsWith('child_age_') ||
          c.startsWith('children_count_min_') ||
          c.startsWith('children_age_under_') ||
          c.startsWith('all_children_age_'))        return hasChildren;
      if (c === 'family_with_children' ||
          c === 'single_parent' ||
          c === 'youngest_child_under_8' ||
          c === 'no_alimony_received' ||
          c === 'primary_caregiver' ||
          c === 'parent_or_guardian' ||
          c === 'new_parent_or_expecting' ||
          c === 'stopped_working_for_birth_or_adoption' ||
          c === 'child_enrolled_school' ||
          c === 'immunisation_requirements_met' ||
          c === 'pregnant_postpartum_breastfeeding_or_infant_child_under_5' ||
          c === 'approved_childcare_provider' ||
          c === 'activity_test_met')                return hasChildren;

      // ── Employment / activity ────────────────────────────────────────────
      if (c === 'involuntary_unemployment' ||
          c === 'involuntary_job_loss' ||
          c === 'active_job_search' ||
          c === 'labour_market_available' ||
          c === 'available_for_work' ||
          c === 'mutual_obligations_met' ||
          c === 'seeking_employment' ||
          c === 'job_seeker' ||
          c === 'employable_but_without_work' ||
          c === 'participation_in_employment_activities') return isUnemployed;
      if (c === 'unemployed_or_temporarily_ill')    return isUnemployed || isDisabled;
      if (c === 'all_other_benefits_exhausted' ||
          c === 'all_other_options_exhausted')      return isUnemployed && income <= threshold;
      if (c === 'are_exhausted' ||
          c === 'worked_5_years_min' ||
          c === 'worked_contributing_period')       return ['employed','unemployed','self_employed'].includes(employment);
      if (c === 'student' ||
          c === 'enrolled_higher_education')        return isStudent;
      if (c === 'not_in_full_time_education')       return !isStudent;
      if (c === 'not_in_employment_or_training')    return !isStudent && employment !== 'employed';
      if (c === 'employed_parent')                  return employment === 'employed' && hasChildren;
      if (c === 'employed_or_self_employed' ||
          c === 'employed_or_via_ce' ||
          c === 'working_income' ||
          c === 'earned_income')                    return employment === 'employed';
      if (c === 'rsa_or_job_seeker')                return income <= threshold || isUnemployed;
      if (c === 'studying_training_or_job_seeking') return isStudent || isUnemployed;
      if (c === 'apprentice' ||
          c === 'apprentice_or_employer')           return true;

      // ── Pension / disability ─────────────────────────────────────────────
      if (c === 'receiving_ahv_or_iv')              return isRetired || isDisabled;
      if (c === 'full_rate_pension' ||
          c === 'retirement_pension_recipient')     return isRetired;
      if (c === 'low_pension_amount')               return isRetired && income <= threshold;
      if (c === 'invalidity_pension_recipient' ||
          c === 'disability_verified' ||
          c === 'permanent_disability' ||
          c === 'permanent_significant_disability' ||
          c === 'unable_to_work_15hr_per_week' ||
          c === 'disability_significant_activity_limitation' ||
          c === 'disability_rate_min_50pct' ||
          c === 'work_capacity_reduced_2_3')        return isDisabled;
      if (c === 'autonomy_loss_gir_1_to_4')         return isDisabled || age >= 60;
      if (c === 'aah_recipient' ||
          c === 'lives_alone' ||
          c === 'autonomous_housing')               return isDisabled;

      // ── Social aid recipient proxies (approximate by income) ─────────────
      if (c === 'rsa_or_ass_recipient' ||
          c === 'rsa_recipient' ||
          c === 'rsa_or_aah_recipient' ||
          c === 'rsa_or_aah_or_ass_recipient' ||
          c === 'rsa_or_aah_or_minimum_social_recipient' ||
          c === 'rsa_or_minimum_social_recipient')  return income <= threshold;
      // OAS is the CA universal senior pension — proxy: age 65+
      if (c === 'oas_recipient')                    return age >= 65;

      // ── Housing ─────────────────────────────────────────────────────────
      if (c === 'renter' ||
          c === 'tenant' ||
          c === 'tenant_or_roommate' ||
          c === 'paying_private_rent_above_threshold') return housing === 'rented' || housing === 'social';
      if (c === 'renter_or_owner')                  return true;
      if (c === 'owner_occupant' ||
          c === 'owner_occupant_or_landlord')       return housing === 'owned';
      if (c === 'not_in_public_housing' ||
          c === 'not_in_social_housing' ||
          c === 'eligible_priority_category')       return housing !== 'social';
      if (c === 'family_with_minors_or_disabled')   return hasChildren || isDisabled;
      if (c === 'single_parent_or_low_income')      return situation === 'single_parent' || income <= threshold;
      if (c === 'eligible_housing' ||
          c === 'main_residence' ||
          c === 'residential_electricity_customer') return true;
      if (c === 'housing_difficulty' ||
          c === 'housing_need' ||
          c === 'homeless_or_housing_risk' ||
          c === 'experiencing_homelessness_or_at_risk' ||
          c === 'high_support_needs')               return true;
      if (c === 'financial_hardship' ||
          c === 'energy_bill_overdue_or_at_risk')   return income <= lowThreshold;

      // ── Contribution-based ───────────────────────────────────────────────
      if (c.startsWith('contribution_'))            return ['employed','unemployed','self_employed'].includes(employment);
      if (c.startsWith('union_member_'))            return ['employed','unemployed'].includes(employment);
      if (c === 'cpp_contributions_made' ||
          c === 'insurable_hours_met' ||
          c === 'insurable_income_met' ||
          c === 'ss_contributions_paid' ||
          c === '40_work_credits_minimum')          return ['employed','unemployed','self_employed'].includes(employment);
      if (c === 'receiving_qualifying_income_support_payment') return income <= threshold;

      // ── Citizenship / identity ───────────────────────────────────────────
      if (c === 'registration_padron' ||
          c === 'canadian_citizen_or_legal_resident' ||
          c === 'australian_citizen_or_permanent_resident' ||
          c === 'citizenship_or_eligible_noncitizen' ||
          c === 'citizenship_or_eligible_status' ||
          c === 'us_citizen_or_permanent_resident_5yr' ||
          c === 'french_nationality_or_eu' ||
          c === '10yr_residency_after_age_18' ||
          c === 'australian_resident_10yr' ||
          c === 'resident_of_california' ||
          c === 'tax_return_filed' ||
          c === 'valid_ssn' ||
          c === 'valid_ssn_or_itin' ||
          c === 'child_has_valid_ssn')              return true;

      // ── Admin / process ──────────────────────────────────────────────────
      if (c === 'social_security_affiliation' ||
          c === 'complementary_health_insurance' ||
          c === 'waiting_list' ||
          c === 'work_participation_required' ||
          c === 'providing_constant_care' ||
          c === 'care_receiver_meets_disability_threshold' ||
          c === 'nutritional_risk' ||
          c === 'legal_proceeding' ||
          c === 'eligible_works' ||
          c === 'recent_hospitalization' ||
          c === 'return_home' ||
          c === 'emergency_situation' ||
          c === 'first_electric_vehicle' ||
          c === 'business_creation_project' ||
          c === 'viable_project' ||
          c === 'business_creation_or_takeover' ||
          c === 'excluded_from_bank_credit' ||
          c === 'divorce_or_separation' ||
          c === 'child_maintenance_order' ||
          c === 'crous_scholarship_recipient')      return true;

      return true; // unknown criterion — open-world assumption
    });
  }

  /** @private */
  _formatAid(aid) {
    const suffix = CURRENCY_AMOUNT_FIELD[this.cc] || 'eur';
    const maxAmt = aid[`montant_max_${suffix}`] ?? aid.montant_max_eur ?? aid.montant_max ?? 0;
    const minAmt = aid[`montant_min_${suffix}`] ?? aid.montant_min_eur ?? aid.montant_min ?? 0;
    const formatted =
      maxAmt > 0
        ? minAmt > 0 && minAmt < maxAmt
          ? `${formatAmount(minAmt, this.cc)} – ${formatAmount(maxAmt, this.cc)}`
          : formatAmount(maxAmt, this.cc)
        : null;
    return { amount: formatted, symbol: EU_CURRENCIES[this.cc]?.symbol || '€' };
  }

  /**
   * Parse a user profile from URL search params (used for sharing/seeding).
   * @param {URLSearchParams|string|Object} params
   * @returns {Object}
   */
  static profileFromParams(params) {
    if (!(params instanceof URLSearchParams)) {
      params = new URLSearchParams(
        typeof params === 'string' ? params : new URLSearchParams(params)
      );
    }
    return {
      income:     Number(params.get('income'))     || null,
      age:        Number(params.get('age'))        || null,
      situation:  params.get('situation')          || null,
      employment: params.get('employment')         || null,
      housing:    params.get('housing')            || null,
    };
  }

  /**
   * Factory for E2E test seeding: loads data and returns ready simulator.
   * @param {{ country:string, income?:number, age?:number, situation?:string, employment?:string, housing?:string }} seed
   * @returns {Promise<EUSimulator>}
   */
  static async loadFromSeed(seed) {
    const sim = new EUSimulator(seed.country || 'de');
    await sim.init();
    return sim;
  }
}

if (typeof window !== 'undefined') {
  window.EUSimulator  = EUSimulator;
  window.formatAmount = formatAmount;
}
if (typeof module !== 'undefined') {
  module.exports = { EUSimulator, formatAmount };
}
