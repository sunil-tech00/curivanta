// Deterministic clean-up of what the model extracted, applied before anything reaches the
// form or the analysis: rounding (no 3.2799999713897705), an inverter evidence check, and
// escalator cadence + notes derived from the document's own sentences.

const DECIMALS = {
  // quote
  system_size_kw: 2, panel_count: 0, battery_kwh: 1, battery_price: 2, quoted_annual_production_kwh: 0,
  cash_price: 2, financed_price: 2, loan_apr_pct: 2, loan_term_years: 0, monthly_loan_payment: 2,
  dealer_fee_amount: 2, lease_monthly_payment: 2, ppa_rate_per_kwh: 4, lease_escalator_pct: 2,
  minimum_bill_escalator_pct: 2, workmanship_warranty_years: 0, customer_annual_usage_kwh: 0,
  customer_utility_rate_per_kwh: 4, agreement_term_years: 0, tpo_minimum_monthly_bill: 2,
  flex_allowance_kwh: 0, escalator_interval_years: 0, minimum_bill_interval_years: 0, battery_service_monthly: 2,
  // bill
  monthly_kwh: 0, annual_kwh: 0, avg_rate_per_kwh: 4, bill_total: 2
};

export function roundFields(f) {
  for (const [k, d] of Object.entries(DECIMALS)) {
    if (typeof f[k] === "number" && Number.isFinite(f[k])) f[k] = Number(f[k].toFixed(d));
  }
  return f;
}

// An inverter is only kept if the model quotes a document sentence that is about an inverter
// and names the same brand. A battery sentence ("1 x Tesla Powerwall") never qualifies.
const INVERTER_WORDS = /\b(inverters?|micro-?inverters?|solaredge|enphase|iq\s?[78]|se\d{3,5}|sma|sunny boy|fronius|generac|sol-?ark|apsystems|hoymiles|goodwe|solis|huawei)\b/i;
const IGNORE = new Set(["x", "or", "similar", "equivalent", "and", "the", "inverter", "inverters", "micro", "string"]);

function brandToken(value) {
  return String(value)
    .replace(/^\s*\d+\s*[x×]\s*/i, "")
    .split(/[\s,/()]+/)
    .find((w) => /[a-z]{2,}/i.test(w) && !IGNORE.has(w.toLowerCase())) || "";
}

export function checkInverter(f) {
  const evidence = String(f.inverter_evidence || "");
  delete f.inverter_evidence;
  if (!f.inverter) return f;
  const token = brandToken(f.inverter);
  const aboutInverter = INVERTER_WORDS.test(evidence);
  const batteryOnly = /powerwall|battery|batteries|storage/i.test(evidence) && !/inverter/i.test(evidence);
  const namesBrand = token && evidence.toLowerCase().includes(token.toLowerCase());
  if (!aboutInverter || batteryOnly || !namesBrand) delete f.inverter;
  return f;
}

// Cadence comes from the document's wording, not from the model's guess.
const BIENNIAL = /\bevery\s+(other|second|two|2)\s+years?\b|\bbienni(al|ally)\b/i;
const ANNUAL = /\b(per|each|every)\s+year\b|\bannual(ly)?\b|\byearly\b|\/\s?(yr|year)\b/i;
const cadence = (s) => (!s ? null : BIENNIAL.test(s) ? 2 : ANNUAL.test(s) ? 1 : null);
export const cadenceText = (n) => (n === 2 ? "every other year" : n === 1 ? "every year" : "on the schedule in the agreement");

const ESCALATOR_NOTE = /(escalat|increas)/i;
const ABOUT_PAYMENTS = /(minimum (monthly )?bill|flex rate|ppa rate|per[- ]kwh rate|monthly payment|lease payment|payments?|both)/i;
const fmtPct = (x) => `${Number(x).toFixed(2)}%`;

export function deriveEscalators(f) {
  const rateCad = cadence(f.rate_escalator_evidence);
  const billCad = cadence(f.bill_escalator_evidence);
  delete f.rate_escalator_evidence;
  delete f.bill_escalator_evidence;
  if (rateCad) f.escalator_interval_years = rateCad;
  if (billCad) f.minimum_bill_interval_years = billCad;

  const hybrid = typeof f.tpo_minimum_monthly_bill === "number";
  const ratePct = f.lease_escalator_pct;
  const billPct = f.minimum_bill_escalator_pct ?? (hybrid ? ratePct : undefined);
  const lines = [];
  if (hybrid) {
    if (billPct) lines.push(`Minimum bill escalates ${fmtPct(billPct)} ${cadenceText(f.minimum_bill_interval_years ?? billCad ?? null)}`);
    if (ratePct && f.ppa_rate_per_kwh) lines.push(`Flex rate escalates ${fmtPct(ratePct)} ${cadenceText(f.escalator_interval_years ?? null)}`);
  } else if (ratePct) {
    const what = f.ppa_rate_per_kwh ? "PPA rate" : "Payment";
    lines.push(`${what} escalates ${fmtPct(ratePct)} ${cadenceText(f.escalator_interval_years ?? null)}`);
  }
  if (lines.length && Array.isArray(f.notes)) {
    // Replace the model's escalator wording with sentences built from the fields.
    f.notes = [lines.join("; ") + ".", ...f.notes.filter((n) => !(ESCALATOR_NOTE.test(n) && ABOUT_PAYMENTS.test(n)))];
  }
  return f;
}

export function normalizeExtraction(kind, fields) {
  roundFields(fields);
  if (kind === "quote") {
    checkInverter(fields);
    deriveEscalators(fields);
  }
  return fields;
}
