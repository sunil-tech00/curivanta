import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";
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

const n = { type: ["number", "null"] };
const s = { type: ["string", "null"] };
const obj = (properties) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false
});

const QUOTE_SCHEMA = obj({
  is_solar_quote: { type: "boolean" },
  installer_name: s,
  system_size_kw: n,
  panel: s,
  panel_count: n,
  inverter: s,
  battery_kwh: n,
  quoted_annual_production_kwh: n,
  cash_price: n,
  financed_price: n,
  loan_apr_pct: n,
  loan_term_years: n,
  monthly_loan_payment: n,
  lease_monthly_payment: n,
  lease_escalator_pct: n,
  workmanship_warranty_years: n,
  mentions_federal_tax_credit: { type: "boolean" },
  notes: { type: "array", items: { type: "string" } }
});

const BILL_SCHEMA = obj({
  is_utility_bill: { type: "boolean" },
  utility_name: s,
  state: s,
  rate_plan: s,
  monthly_kwh: n,
  annual_kwh: n,
  avg_rate_per_kwh: n,
  bill_total: n,
  notes: { type: "array", items: { type: "string" } }
});

const EXTRACT_SYSTEM = `You read residential solar documents and extract numbers for an independent quote review.

Rules:
- Extract only what the document states. Use null for anything not shown; never estimate or infer a missing number.
- Money is in US dollars as plain numbers (24999.00, not "$24,999"). Percentages are numbers in percent (5.99 for 5.99%).
- System size is DC kilowatts. If only panel count and wattage are given, multiply them (e.g. 18 × 400 W = 7.2 kW) — that one calculation is allowed.
- cash_price is the full price before incentives. If the quote shows only a price "after tax credit" or "net cost", put the pre-incentive price if it is shown anywhere, otherwise null.
- financed_price is the total loan amount or financed system price, if different from cash.
- For a lease or PPA, fill lease_monthly_payment (first-year monthly) and lease_escalator_pct; leave loan fields null.
- mentions_federal_tax_credit is true if the quote applies or advertises a federal tax credit / ITC / 30% credit in its pricing or savings.
- For a utility bill: monthly_kwh is the usage for this bill period; if a 12-month usage history is shown, put the 12-month total in annual_kwh. avg_rate_per_kwh is total charges divided by kWh if not stated.
- state is the full US state name of the service address (e.g. "California").
- Do not extract names, street addresses, account numbers, or phone numbers.
- notes: short items a homeowner should know that don't fit a field (prepayment penalties, dealer fees mentioned, escalators, production guarantees, unusual terms). Empty array if none.
- If the document is not the expected type, set is_solar_quote / is_utility_bill to false and leave the rest null.`;

const REPORT_SCHEMA = obj({
  verdict: { type: "string", enum: ["sign", "renegotiate", "walk_away"] },
  headline: { type: "string" },
  summary: { type: "string" },
  recommended_quote: s,
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
- Verdicts: "sign" only when the price is reasonable and there are no high-severity flags; "renegotiate" when the deal is fixable with specific asks; "walk_away" when the economics or terms are fundamentally bad.

Writing:
- Plain English for a non-expert. Short sentences. No jargon without a quick explanation.
- headline: one sentence with the bottom line. summary: 2–4 sentences.
- findings: 2–5 per quote, each tied to a specific number from the metrics.
- talking_points: exact sentences the homeowner can say to the installer, specific to this quote.
- questions_to_ask: up to 6, most important first.
- caveats: what this review can't see (roof condition, shading, local rules). Keep it to 2–3.
- recommended_quote: the label of the best quote, or null if none is worth signing.
This is an analysis, not financial or legal advice; don't add disclaimers beyond the caveats.`;

async function call({ system, messages, schema, effort }) {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    system,
    output_config: { effort, format: { type: "json_schema", schema } },
    messages
  });
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
    effort: "medium"
  });
  return fields;
}

export async function writeReport(metrics) {
  const messages = [{ role: "user", content: `Computed metrics:\n${JSON.stringify(metrics, null, 2)}\n\nWrite the review.` }];
  const first = await call({ system: REPORT_SYSTEM, messages, schema: REPORT_SCHEMA, effort: "high" });
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
    effort: "high"
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
