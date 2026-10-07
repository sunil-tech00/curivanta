// Solar quote math for the AI review. Formulas follow solar-quote-toolkit-v1.xlsx
// (2-Comparison) and Solar-Sizing-Calculator.xlsx (2-Results); cell refs noted inline.
// The AI only extracts numbers and writes prose — every figure in a report comes from here.

export const SUN_HOURS = {
  "Alabama": 4.5, "Alaska": 2.5, "Arizona": 6.5, "Arkansas": 4.7, "California": 5.5,
  "Colorado": 5.4, "Connecticut": 4.0, "Delaware": 4.3, "District of Columbia": 4.2, "Florida": 5.2,
  "Georgia": 4.6, "Hawaii": 5.5, "Idaho": 4.8, "Illinois": 4.0, "Indiana": 4.1,
  "Iowa": 4.3, "Kansas": 5.0, "Kentucky": 4.3, "Louisiana": 4.7, "Maine": 3.8,
  "Maryland": 4.2, "Massachusetts": 3.9, "Michigan": 3.8, "Minnesota": 4.0, "Mississippi": 4.6,
  "Missouri": 4.6, "Montana": 4.6, "Nebraska": 4.9, "Nevada": 6.0, "New Hampshire": 3.9,
  "New Jersey": 4.1, "New Mexico": 6.2, "New York": 3.8, "North Carolina": 4.5, "North Dakota": 4.4,
  "Ohio": 3.9, "Oklahoma": 5.1, "Oregon": 3.8, "Pennsylvania": 3.8, "Rhode Island": 4.0,
  "South Carolina": 4.6, "South Dakota": 4.6, "Tennessee": 4.4, "Texas": 5.3, "Utah": 5.5,
  "Vermont": 3.8, "Virginia": 4.2, "Washington": 3.5, "West Virginia": 3.9, "Wisconsin": 3.9,
  "Wyoming": 5.2
};

export const DEFAULTS = { derate: 0.8, degradation: 0.005, years: 25 };

const LIMITS = {
  dealerFee: 0.15,        // financed > 15% over cash (toolkit B21)
  dealerFeeNotice: 0.03,  // smaller financed-over-cash gaps still worth naming
  production: 1.10,       // quoted > 110% of expected (toolkit B22)
  escalator: 0.029,       // lease/PPA escalator above 2.9%/yr (toolkit B23)
  ppwHigh: 3.5,           // top of typical US residential cash $/W
  oversize: 1.2,          // expected production > 120% of usage
  undersize: 0.6          // expected production < 60% of usage
};

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const pos = (v) => (num(v) !== null && v > 0 ? v : null);

// Excel PMT(rate, nper, pv) sign-flipped: monthly payment on a loan of pv.
function payment(rate, nper, pv) {
  return rate === 0 ? pv / nper : (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}

export function paymentType(q) {
  if (pos(q.ppa_rate_per_kwh)) return "ppa";
  if (pos(q.lease_monthly_payment)) return "lease";
  if (pos(q.financed_price) || pos(q.monthly_loan_payment)) return "loan";
  return "cash";
}

export function analyzeQuote(q, a) {
  const kw = pos(q.system_size_kw);
  const cash = pos(q.cash_price);
  const financed = pos(q.financed_price);
  const type = paymentType(q);
  const r = {
    label: q.label, installer: q.installer_name || q.label, payment_type: type, system_size_kw: kw,
    panel: q.panel || null, inverter: q.inverter || null, battery_kwh: pos(q.battery_kwh),
    workmanship_warranty_years: pos(q.workmanship_warranty_years),
    document_notes: Array.isArray(q.notes) ? q.notes.slice(0, 10) : [],
    flags: []
  };
  if (!kw) {
    r.error = "Missing system size";
    return r;
  }
  const watts = kw * 1000;

  r.ppw_cash = cash ? cash / watts : null;                                         // B10
  r.ppw_financed = financed ? financed / watts : null;                             // B11
  r.dealer_fee_markup = cash && financed ? (financed - cash) / cash : null;        // B12
  r.expected_annual_kwh = kw * a.sunHours * 365 * a.derate;                        // B14
  r.quoted_annual_kwh = pos(q.quoted_annual_production_kwh);
  r.quoted_vs_expected = r.quoted_annual_kwh ? r.quoted_annual_kwh / r.expected_annual_kwh : null; // B15
  r.production_25yr_kwh = a.degradation > 0                                        // B17
    ? (r.expected_annual_kwh * (1 - Math.pow(1 - a.degradation, a.years))) / a.degradation
    : r.expected_annual_kwh * a.years;

  // B18: lease/PPA → escalating payments; loan → total of payments; otherwise cash price.
  const esc = num(q.lease_escalator_pct) !== null ? q.lease_escalator_pct / 100 : 0;
  const thirdPartyOwned = type === "lease" || type === "ppa";
  if (type === "ppa") {
    // A PPA bills per kWh produced, so price it on our production estimate, not the installer's.
    const rate = q.ppa_rate_per_kwh;
    let total = 0;
    for (let y = 0; y < a.years; y++) {
      total += rate * Math.pow(1 + esc, y) * r.expected_annual_kwh * Math.pow(1 - a.degradation, y);
    }
    r.cost_25yr = total;
    r.cost_basis = `${a.years} years of PPA payments at our production estimate`;
    r.ppa_rate_cents_year1 = Math.round(rate * 1000) / 10;
    r.ppa_rate_cents_final_year = Math.round(rate * Math.pow(1 + esc, a.years - 1) * 1000) / 10;
    r.monthly_payment_year1 = (rate * r.expected_annual_kwh) / 12;
    r.monthly_payment_final_year = (rate * Math.pow(1 + esc, a.years - 1) * r.expected_annual_kwh * Math.pow(1 - a.degradation, a.years - 1)) / 12;
    r.installer_monthly_estimate = pos(q.lease_monthly_payment);
    r.escalator_pct = esc * 100;
    if (a.utilityRate) r.ppa_rate_vs_utility_rate = rate / a.utilityRate;
  } else if (type === "lease") {
    const m = q.lease_monthly_payment;
    r.cost_25yr = esc === 0 ? m * 12 * a.years : (m * 12 * (Math.pow(1 + esc, a.years) - 1)) / esc;
    r.cost_basis = `${a.years} years of lease/PPA payments`;
    r.monthly_payment_year1 = m;
    r.monthly_payment_final_year = m * Math.pow(1 + esc, a.years - 1);
    r.escalator_pct = esc * 100;
  } else if (type === "loan" && pos(q.loan_term_years) && (financed || pos(q.monthly_loan_payment))) {
    const n = q.loan_term_years * 12;
    const monthly = pos(q.monthly_loan_payment) ??
      payment((num(q.loan_apr_pct) ?? 0) / 100 / 12, n, financed);
    r.monthly_payment = monthly;
    r.cost_25yr = monthly * n;
    r.cost_basis = "Total of loan payments";
  } else if (cash) {
    r.cost_25yr = cash;
    r.cost_basis = "Cash price";
  } else {
    r.cost_25yr = null;
    r.cost_basis = null;
  }
  r.cost_per_kwh = r.cost_25yr && r.production_25yr_kwh ? r.cost_25yr / r.production_25yr_kwh : null; // B19
  if (r.cost_25yr && cash && type !== "cash") r.extra_cost_vs_paying_cash = r.cost_25yr - cash;
  r.cost_per_kwh_cents = r.cost_per_kwh !== null ? Math.round(r.cost_per_kwh * 1000) / 10 : null;

  r.dealer_fee_stated = pos(q.dealer_fee_amount);
  if (r.dealer_fee_markup !== null && r.dealer_fee_markup > LIMITS.dealerFee) {
    r.flags.push({ id: "dealer_fee", severity: "high",
      text: `Financed price is ${pct(r.dealer_fee_markup)} above cash — likely dealer fees in the loan.` });
  } else if (type === "loan" && (r.dealer_fee_stated || (r.dealer_fee_markup ?? 0) > LIMITS.dealerFeeNotice)) {
    const fee = r.dealer_fee_stated ?? (financed - cash);
    r.flags.push({ id: "dealer_fee", severity: "medium",
      text: `Loan includes a $${Math.round(fee).toLocaleString("en-US")} dealer fee${r.dealer_fee_markup !== null ? ` (${pct(r.dealer_fee_markup)} over cash)` : ""} — you'd pay interest on it for the life of the loan.` });
  }
  if (r.quoted_vs_expected !== null && r.quoted_vs_expected > LIMITS.production) {
    r.flags.push({ id: "inflated_production", severity: "high",
      text: `Quoted production is ${pct(r.quoted_vs_expected)} of what this system size should produce — estimate looks inflated.` });
  }
  if (thirdPartyOwned && esc > LIMITS.escalator) {
    r.flags.push({ id: "escalator", severity: "high",
      text: `${(esc * 100).toFixed(1)}% annual escalator — ${type === "ppa" ? "your per-kWh rate" : "payments"} compound to ${pct(Math.pow(1 + esc, a.years - 1))} of today's by year ${a.years}.` });
  }
  if (r.ppw_cash !== null && r.ppw_cash > LIMITS.ppwHigh) {
    r.flags.push({ id: "high_price", severity: "medium",
      text: `$${r.ppw_cash.toFixed(2)}/W cash is above the typical $2.50–$3.50/W range.` });
  }
  if (!cash) {
    r.flags.push({ id: "no_cash_price", severity: "medium",
      text: "No cash price on the quote — ask for it in writing to compare fairly." });
  }
  if (q.mentions_federal_tax_credit && !thirdPartyOwned) {
    r.flags.push({ id: "tax_credit", severity: "high",
      text: "Quote counts a federal tax credit — the 30% homeowner credit (Section 25D) ended for systems installed after Dec 31, 2025." });
  }

  if (a.annualUsageKwh) {
    r.usage_coverage = r.expected_annual_kwh / a.annualUsageKwh;
    if (r.usage_coverage > LIMITS.oversize) {
      r.flags.push({ id: "oversized", severity: "medium",
        text: `Would produce ${pct(r.usage_coverage)} of your annual usage — under net-billing rules like NEM 3.0, extra exports earn little.` });
    } else if (r.usage_coverage < LIMITS.undersize) {
      r.flags.push({ id: "undersized", severity: "low",
        text: `Covers only ${pct(r.usage_coverage)} of your annual usage.` });
    }
  }
  if (a.utilityRate && r.cost_per_kwh !== null) {
    r.vs_utility_rate = r.cost_per_kwh / a.utilityRate;
  }
  if (a.annualUsageKwh && a.utilityRate) {
    const bill = (a.annualUsageKwh * a.utilityRate) / 12;
    const pay = r.monthly_payment_year1 ?? r.monthly_payment ?? null;
    if (pay) r.year1_payment_vs_current_bill = pay / bill;
    if (r.monthly_payment_final_year) r.final_year_payment_vs_current_bill = r.monthly_payment_final_year / bill;
  }
  return r;
}

// Sizing Calculator 2-Results, at 100% offset with 400 W panels.
export function recommendedSize(annualUsageKwh, sunHours, derate) {
  const kw = (annualUsageKwh / 12 / 30) / (sunHours * derate);                     // B5–B7 (sheet uses monthly ÷ 30)
  const panels = Math.ceil((kw * 1000) / 400 - 1e-9);                              // B8
  return { min_kw: kw, panels, kw: (panels * 400) / 1000 };                        // B9
}

export function analyze({ quotes, bill, state, sunHours, derate, degradation }) {
  const sh = pos(sunHours) ?? SUN_HOURS[state] ?? null;
  if (!sh) throw new Error("Need a state or peak sun hours.");
  const monthly = pos(bill?.monthly_kwh) ?? (pos(bill?.annual_kwh) ? bill.annual_kwh / 12 : null);
  const a = {
    sunHours: sh,
    derate: pos(derate) ?? DEFAULTS.derate,
    degradation: num(degradation) ?? DEFAULTS.degradation,
    years: DEFAULTS.years,
    annualUsageKwh: monthly ? monthly * 12 : null,
    utilityRate: pos(bill?.avg_rate_per_kwh)
  };
  const results = quotes.map((q) => analyzeQuote(q, a));
  const priced = results.filter((r) => r.cost_per_kwh !== null);
  const best = priced.length > 1 ? priced.reduce((x, y) => (y.cost_per_kwh < x.cost_per_kwh ? y : x)) : null;
  return {
    assumptions: { state: state || null, sun_hours: sh, derate: a.derate, degradation: a.degradation, years: a.years },
    usage: a.annualUsageKwh ? {
      monthly_kwh: monthly,
      annual_kwh: a.annualUsageKwh,
      utility_rate: a.utilityRate,
      utility_rate_cents: a.utilityRate ? Math.round(a.utilityRate * 1000) / 10 : null,
      current_monthly_bill_estimate: a.utilityRate ? (a.annualUsageKwh * a.utilityRate) / 12 : null,
      recommended: recommendedSize(a.annualUsageKwh, sh, a.derate)
    } : null,
    quotes: results,
    lowest_cost_per_kwh: best ? best.label : null
  };
}

function pct(x) {
  return `${Math.round(x * 100)}%`;
}
