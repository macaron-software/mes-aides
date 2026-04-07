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
};

/** Maps country code → data file basename when they differ */
const CC_TO_FILE = { gb: 'uk' };

/**
 * Monthly income thresholds (local currency) used to assess income-tested aids.
 * Values approximate national poverty/minimum-income lines (2026 data).
 */
const INCOME_THRESHOLDS = {
  de: 1600, es: 1200, it: 1200, pt:  950, be: 1500,
  nl: 1400, se:18000, dk:20000, fi: 1600, at: 1400,
  ch: 3500, no:20000, gb: 1200, pl: 4000,
};

/** More lenient threshold for "low_income" criteria (housing benefits etc.) */
const LOW_INCOME_THRESHOLDS = {
  de: 2500, es: 2000, it: 2000, pt: 1500, be: 2500,
  nl: 2200, se:28000, dk:30000, fi: 2500, at: 2200,
  ch: 5500, no:32000, gb: 2000, pl: 6000,
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
    document.dispatchEvent(
      new CustomEvent('eu-simulator:' + event, { detail, bubbles: true })
    );
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
      .sort((a, b) =>
        (b.montant_max_eur || b.montant_max || 0) -
        (a.montant_max_eur || a.montant_min || 0)
      );
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
    const income    = Number(profile.income)     || 0;
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
      if (c.startsWith('residence_'))              return true;
      if (c === 'income_below_threshold' ||
          c === 'isee_below_threshold')             return income <= threshold;
      if (c === 'low_income')                       return income <= lowThreshold;
      if (c === 'income_above_threshold')           return income > threshold;  // e.g. NO dagpenger
      if (c === 'savings_below_16000')              return true;                // no savings input
      if (c === 'age_15_65')                        return age >= 15 && age <= 65;
      if (c === 'age_18')                           return age >= 18;
      if (c === 'age_30')                           return age >= 30;
      if (c.startsWith('child_under_'))             return hasChildren;
      if (c === 'involuntary_unemployment')         return isUnemployed;
      if (c === 'active_job_search')                return isUnemployed;
      if (c === 'labour_market_available')          return isUnemployed;
      if (c === 'all_other_benefits_exhausted' ||
          c === 'all_other_options_exhausted')      return isUnemployed && income <= threshold;
      if (c === 'student')                          return isStudent;
      if (c === 'not_in_full_time_education')       return !isStudent;
      if (c === 'employed_parent')                  return employment === 'employed' && hasChildren;
      if (c === 'receiving_ahv_or_iv')              return isRetired || isDisabled;
      if (c === 'renter')                           return housing === 'rented' || housing === 'social';
      if (c === 'renter_or_owner')                  return true;
      if (c === 'family_with_minors_or_disabled')   return hasChildren || isDisabled;
      if (c === 'single_parent_or_low_income')      return situation === 'single_parent' || income <= threshold;
      if (c === 'registration_padron')              return true;
      // contribution-based: assume eligible if previously/currently active
      if (c.startsWith('contribution_'))            return ['employed','unemployed','self_employed'].includes(employment);
      // union membership: assume eligible if worked
      if (c.startsWith('union_member_'))            return ['employed','unemployed'].includes(employment);
      return true; // unknown criterion — open-world
    });
  }

  /** @private */
  _formatAid(aid) {
    const maxAmt = aid.montant_max_eur || aid.montant_max || 0;
    const minAmt = aid.montant_min_eur || aid.montant_min || 0;
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

window.EUSimulator  = EUSimulator;
window.formatAmount = formatAmount;
