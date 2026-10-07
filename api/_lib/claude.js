import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";
// Server-side fallback: if a request is declined, the API retries it on Anthropic's
// recommended fallback model instead of returning a refusal.
const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };

let client;
const getClient = () => (client ??= new Anthropic());

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

You receive computed metrics as JSON. Every number in them is authoritative — quote numbers only from that JSON, never calculate new figures or invent prices, savings, or market data. If a needed number is missing, say what the homeowner should ask for.

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

async function call({ system, content, schema, effort }) {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    system,
    output_config: { effort, format: { type: "json_schema", schema } },
    messages: [{ role: "user", content }]
  });
  if (response.stop_reason === "refusal") {
    throw Object.assign(new Error("The document couldn't be processed."), { status: 422 });
  }
  if (response.stop_reason === "max_tokens") {
    throw Object.assign(new Error("The response was cut off. Please try again."), { status: 502 });
  }
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return JSON.parse(text);
}

export async function extractDocument({ kind, mediaType, data }) {
  const block = mediaType === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: mediaType, data } }
    : { type: "image", source: { type: "base64", media_type: mediaType, data } };
  const ask = kind === "bill"
    ? "Extract the utility bill fields from this document."
    : "Extract the solar quote fields from this document.";
  return call({
    system: EXTRACT_SYSTEM,
    content: [block, { type: "text", text: ask }],
    schema: kind === "bill" ? BILL_SCHEMA : QUOTE_SCHEMA,
    effort: "medium"
  });
}

export async function writeReport(metrics) {
  return call({
    system: REPORT_SYSTEM,
    content: [{ type: "text", text: `Computed metrics:\n${JSON.stringify(metrics, null, 2)}\n\nWrite the review.` }],
    schema: REPORT_SCHEMA,
    effort: "high"
  });
}
