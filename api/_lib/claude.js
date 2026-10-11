import Anthropic from "@anthropic-ai/sdk";
import { normalizeExtraction } from "./normalize.js";

const MODEL = "claude-opus-5-5";
const REPORT_EFFORT = "medium";
// Server-side fallback: if a request is declined, the API retries it on Anthropic's
// recommended fallback model instead of returning a refusal.
const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };

let client;
// Org-level API keys must name a workspace; workspace-scoped keys don't need this.
const getClient = () => (client ??= new Anthropic(
  process.env.ANTHROPIC_WORKSPACE_ID
    ? { defaultHeaders: { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } }
    : {}
));

// Structured outputs cap schema complexity (16 union-typed fields, 24 optional, and a
// compile budget), so extraction returns a list of {field, value} pairs instead of one
// nullable property per number. All properties are required; missing data is just absent
// from the list. flatten() turns the pairs back into a plain object.
const obj = (properties) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false
});
const pairs = (names, valueType) => ({
  type: "array",
  items: obj({ field: { type: "string", enum: names }, value: { type: valueType } })
});
const strings = { type: "array", items: { type: "string" } };

const QUOTE_NUMBERS = [
  "system_size_kw", "panel_count", "battery_kwh", "battery_price", "quoted_annual_production_kwh",
  "cash_price", "financed_price", "loan_apr_pct", "loan_term_years", "monthly_loan_payment",
  "dealer_fee_amount", "lease_monthly_payment", "ppa_rate_per_kwh", "lease_escalator_pct",
  "workmanship_warranty_years", "customer_annual_usage_kwh", "customer_utility_rate_per_kwh",
  "agreement_term_years", "tpo_minimum_monthly_bill", "flex_allowance_kwh", "escalator_interval_years",
  "battery_service_monthly", "minimum_bill_escalator_pct"
];
const QUOTE_TEXT = ["installer_name", "panel", "inverter", "battery", "state",
  "inverter_evidence", "rate_escalator_evidence", "bill_escalator_evidence"];
const BILL_NUMBERS = ["monthly_kwh", "annual_kwh", "avg_rate_per_kwh", "bill_total"];
const BILL_TEXT = ["utility_name", "state", "rate_plan"];

export const QUOTE_SCHEMA = obj({
  is_solar_quote: { type: "boolean" },
  mentions_federal_tax_credit: { type: "boolean" },
  includes_battery: { type: "boolean" },
  numbers: pairs(QUOTE_NUMBERS, "number"),
  text: pairs(QUOTE_TEXT, "string"),
  notes: strings
});

export const BILL_SCHEMA = obj({
  is_utility_bill: { type: "boolean" },
  numbers: pairs(BILL_NUMBERS, "number"),
  text: pairs(BILL_TEXT, "string"),
  notes: strings
});

export function flatten({ numbers = [], text = [], ...rest }) {
  const out = { ...rest };
  for (const { field, value } of [...numbers, ...text]) {
    if (!(field in out) && value !== "" && value !== null) out[field] = value;
  }
  return out;
}

export const EXTRACT_SYSTEM = `You read residential solar documents and extract numbers for an independent quote review.

Rules:
- Extract only what the document states. Put each value you find in "numbers" or "text" as {field, value}; leave out anything the document doesn't show. Never estimate or infer a missing number.
- Money is in US dollars as plain numbers (24999.00, not "$24,999"). Percentages are numbers in percent (5.99 for 5.99%).
- System size is DC kilowatts. If only panel count and wattage are given, multiply them (e.g. 18 × 400 W = 7.2 kW) — that one calculation is allowed.
- cash_price is the full price before incentives. If the quote shows only a price "after tax credit" or "net cost", put the pre-incentive price if it is shown anywhere, otherwise leave it out.
- financed_price is the total loan amount or financed system price, if different from cash.
- battery_kwh is the total usable storage capacity quoted (e.g. 13.5 for one Tesla Powerwall 3); battery is the make/model and count (e.g. "1 x Tesla Powerwall 3"). battery_price is the battery's own price in dollars only if the quote lists it separately; cash_price stays the full system price.
- dealer_fee_amount is a dealer fee, financing fee, or rate buy-down fee in dollars, only if the document states it.
- For a lease, fill lease_monthly_payment (first-year monthly) and lease_escalator_pct; leave out the loan fields.
- For a PPA (you pay per kWh produced), fill ppa_rate_per_kwh (first-year $/kWh, e.g. 0.21), lease_escalator_pct (the escalator percentage), and lease_monthly_payment only if the quote shows an estimated first-year monthly amount.
- Hybrid third-party-owned plans (e.g. Sunrun "Flex"): a fixed minimum monthly bill PLUS a per-kWh rate for energy above a baseline. Put the minimum bill in tpo_minimum_monthly_bill (not lease_monthly_payment), the per-kWh rate in ppa_rate_per_kwh, the documented extra kWh allowance per year in flex_allowance_kwh, the per-kWh rate's escalator in lease_escalator_pct, and the minimum bill's own escalator in minimum_bill_escalator_pct.
- Escalator evidence: copy, word for word, the document sentence that states how the per-kWh rate or lease payment escalates into rate_escalator_evidence, and (for hybrid plans) the sentence about the minimum bill's escalation into bill_escalator_evidence. Keep the cadence words exactly as written ("every other year", "annually").
- agreement_term_years is the term of a lease, PPA or hybrid agreement in years (e.g. 25). loan_term_years is only for loans.
- Escalator cadence: extract it exactly as the document states it. escalator_interval_years is 1 when the escalator applies every year ("per year", "annually") and 2 when it applies every other year ("every other year", "biennially"). For PPA and hybrid plans it describes the per-kWh rate (PPA rate or Flex rate); a hybrid plan's minimum monthly bill is treated as escalating yearly. For a lease it describes the monthly payment. Leave it out if there is no escalator. In notes, never simplify "every other year" to "per year".
- If the document does not explicitly name an inverter brand and model, leave inverter out. Never infer the inverter from the battery brand, the panel brand, or the installer name. A Tesla Powerwall is a battery, not an inverter. A missing inverter is missing data, not a guess. Example of what NOT to do: a document mentioning "Tesla Powerwall" does not establish a Tesla inverter; output no inverter.
- inverter_evidence: when you fill inverter, copy word for word the document sentence or table row that names the inverter (it must contain the inverter's brand). Without such a sentence, leave both out.
- includes_battery is true if the quote or agreement includes a battery (any make or model), even when its capacity isn't stated. Fill battery_kwh only if the capacity is written in the document; never look it up from the model name. battery_service_monthly is a separate or bundled monthly battery charge in dollars, only if stated.
- mentions_federal_tax_credit is true if the quote applies or advertises a federal tax credit / ITC / 30% credit in its pricing or savings.
- For a utility bill: monthly_kwh is the usage for this bill period; if a 12-month usage history is shown, put the 12-month total in annual_kwh. avg_rate_per_kwh is total charges divided by kWh if not stated.
- state is the full US state name of the service address (e.g. "California"), on a quote or a bill.
- On a quote, customer_annual_usage_kwh and customer_utility_rate_per_kwh are the homeowner's current yearly usage and electricity rate if the quote states them (installers often size the system from these). Don't confuse them with the system's production.
- Do not extract names, street addresses, account numbers, or phone numbers.
- notes: short items a homeowner should know that don't fit a field (prepayment penalties, dealer fees mentioned, escalators, production guarantees, unusual terms). Empty array if none.
- Write notes without em dashes (—); use commas, colons or separate sentences.
- If the document is not the expected type, set is_solar_quote / is_utility_bill to false and leave out the other fields.`;

const REPORT_SCHEMA = obj({
  verdict: { type: "string", enum: ["sign", "renegotiate", "walk_away"] },
  headline: { type: "string" },
  summary: { type: "string" },
  recommended_quote: { type: "string" },
  quotes: {
    type: "array",
    items: obj({
      label: { type: "string" },
      verdict: { type: "string", enum: ["sign", "renegotiate", "walk_away"] },
      findings: { type: "array", items: { type: "string" } },
      talking_points: { type: "array", items: { type: "string" } }
    })
  },
  questions_to_ask: { type: "array", items: { type: "string" } },
  caveats: { type: "array", items: { type: "string" } }
});

const REPORT_SYSTEM = `You are an independent solar advisor writing a quote review for a homeowner. You work for the homeowner, not any installer, and you're direct about bad deals.

You receive computed metrics as JSON. Every number in them is authoritative. Use only numbers that appear in that JSON — never calculate a new figure yourself (no multiplying, projecting, or estimating bills or payments), and never invent prices, savings, or market data. If a number you'd like isn't there, describe it in words or say what the homeowner should ask for.

Units: write per-kWh costs in cents using the *_cents fields (e.g. "23.8¢/kWh"), money as whole dollars (e.g. "$64,772"), and ratios as percentages.

How to judge:
- True cost per kWh (25-year cost ÷ 25-year production) is the main comparison across cash, loan, and lease. Lower wins. If vs_utility_rate is near or above 1, solar costs about as much as buying from the utility — a weak deal.
- Treat high-severity flags (dealer fees, inflated production, escalators above 2.9%, counting the expired 25D tax credit) as serious.
- Leases and PPAs are third-party owned: the installer keeps any tax credits, so don't treat that as a problem. For a PPA, payments follow production at a per-kWh rate; compare ppa_rate_cents_year1 and ppa_rate_cents_final_year with utility_rate_cents, and note that the monthly figures use our production estimate rather than the installer's.
- Hybrid plans (payment_type "tpo_hybrid", e.g. Sunrun Flex) charge a fixed minimum monthly bill plus a per-kWh rate for extra energy. Use minimum_bill_year1 and minimum_bill_final_year, flex_rate_cents_year1 and flex_rate_cents_final_year. Escalator timing comes only from the fields: escalator_interval_years is the per-kWh rate's, minimum_bill_interval_years is the minimum bill's (1 = every year, 2 = every other year). When they differ, describe each separately; never merge them into one "both escalate per year" statement, and never say "per year" for an every-other-year escalator.
- agreement_term_years, when present, is the length of a lease, PPA or hybrid agreement.
- usage_coverage is production divided by the homeowner's annual usage; usage_coverage_basis says whether it uses the installer's quoted production ("quoted") or our estimate ("estimated"). Quote that percentage as given, never recompute it.
- If inverter is missing, the document doesn't name one: say so plainly and suggest asking which inverter will be installed.
- Lease and PPA offers often come without a cash price, and in some areas a lease is the only option offered. Don't treat a missing cash price on a lease or PPA as a problem, and don't make asking for one a talking point.
- Write without em dashes (—). Use commas, colons, parentheses or separate sentences instead.
- Batteries: under California's NEM 3.0, solar sent to the grid earns far less than power costs to buy, so storing midday solar for evening use drives savings. Use the battery metrics (battery_kwh, battery_vs_daily_use, usage.battery_for_one_day_backup_kwh, ppw_solar_only) and battery flags to say whether the quote's battery choice fits this home — including when no battery is quoted. Don't invent battery prices, savings, or backup hours.
- extra_cost_vs_paying_cash, when present, is the clearest way to show what financing or leasing costs over buying outright.
- Verdicts: "sign" only when the price is reasonable and there are no high-severity flags; "renegotiate" when the deal is fixable with specific asks; "walk_away" when the economics or terms are fundamentally bad.

Writing:
- Plain English for a non-expert. Short sentences. No jargon without a quick explanation.
- headline: one sentence with the bottom line. summary: 2–4 sentences.
- findings: 2–5 per quote, each tied to a specific number from the metrics.
- talking_points: exact sentences the homeowner can say to the installer, specific to this quote.
- questions_to_ask: up to 6, most important first.
- caveats: what this review can't see (roof condition, shading, local rules). Keep it to 2–3.
- recommended_quote: the label of the best quote, or an empty string if none is worth signing.
This is an analysis, not financial or legal advice; don't add disclaimers beyond the caveats.`;

async function call({ system, messages, schema, effort, label }) {
  const started = Date.now();
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    system,
    output_config: { effort, format: { type: "json_schema", schema } },
    messages
  });
  const u = response.usage || {};
  console.log(`[claude] ${label} ${effort} ${((Date.now() - started) / 1000).toFixed(1)}s in=${u.input_tokens} out=${u.output_tokens} stop=${response.stop_reason}`);
  if (response.stop_reason === "refusal") {
    throw Object.assign(new Error("The document couldn't be processed."), { status: 422, expose: true });
  }
  if (response.stop_reason === "max_tokens") {
    throw Object.assign(new Error("The response was cut off. Please try again."), { status: 502, expose: true });
  }
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return { data: JSON.parse(text), content: response.content };
}

export async function extractDocument({ kind, mediaType, data }) {
  const block = mediaType === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: mediaType, data } }
    : { type: "image", source: { type: "base64", media_type: mediaType, data } };
  const ask = kind === "bill"
    ? "Extract the utility bill fields from this document."
    : "Extract the solar quote fields from this document.";
  const { data: fields } = await call({
    system: EXTRACT_SYSTEM,
    messages: [{ role: "user", content: [block, { type: "text", text: ask }] }],
    schema: kind === "bill" ? BILL_SCHEMA : QUOTE_SCHEMA,
    effort: "low", // reading numbers off a page needs little reasoning; keeps uploads fast
    label: `extract-${kind}`
  });
  return normalizeExtraction(kind, flatten(fields));
}

export async function writeReport(metrics) {
  const messages = [{ role: "user", content: `Computed metrics:\n${JSON.stringify(metrics, null, 2)}\n\nWrite the review.` }];
  const first = await call({ system: REPORT_SYSTEM, messages, schema: REPORT_SCHEMA, effort: REPORT_EFFORT, label: "report" });
  const stray = unsupportedNumbers(first.data, metrics);
  if (!stray.length) return first.data;

  // One retry: name the figures that don't trace back to the metrics.
  console.warn("report used numbers not in metrics:", stray);
  const retry = await call({
    system: REPORT_SYSTEM,
    messages: [
      ...messages,
      { role: "assistant", content: first.content },
      { role: "user", content: `These figures in your review don't appear in the metrics: ${stray.join(", ")}. Rewrite the review using only numbers from the metrics JSON (round them as you like). Where a figure isn't available, describe it in words instead.` }
    ],
    schema: REPORT_SCHEMA,
    effort: REPORT_EFFORT,
    label: "report-retry"
  });
  const still = unsupportedNumbers(retry.data, metrics);
  if (still.length) console.warn("report still has unsupported numbers after retry:", still);
  return retry.data;
}

// Every number the metrics contain (including numbers inside note strings), plus
// percent/cent forms. A figure in the report must round to one of these.
function allowedNumbers(metrics) {
  const out = [];
  const walk = (v) => {
    if (typeof v === "number" && Number.isFinite(v)) out.push(v, v * 100);
    else if (typeof v === "string") for (const m of v.matchAll(NUMBER_RE)) out.push(toNumber(m[0]));
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(metrics);
  return out;
}

const NUMBER_RE = /\d[\d,]*(?:\.\d+)?/g;
const toNumber = (s) => parseFloat(s.replace(/,/g, ""));

function unsupportedNumbers(report, metrics) {
  const allowed = allowedNumbers(metrics);
  const text = JSON.stringify(report);
  const bad = new Set();
  for (const m of text.matchAll(NUMBER_RE)) {
    const n = toNumber(m[0]);
    if (n <= 12) continue; // small counts, years, and suggested targets like "0% or 1.9%"
    const ok = allowed.some((a) => Math.abs(n - a) <= Math.max(Math.abs(a) * 0.01, 0.51));
    if (!ok) bad.add(m[0]);
  }
  return [...bad];
}
