import { allowPost, checkAccess, tooMany, hasPasscode } from "../_lib/http.js";
import { allow } from "../_lib/limit.js";
import { analyze } from "../_lib/solar.js";

// Free teaser before checkout: which red flags the confirmed numbers trigger. Code only —
// no AI call — and only flag titles plus the single most serious finding are returned;
// the full report adds the verdict, 25-year costs and talking points.
const TITLES = {
  dealer_fee: "Dealer fee built into the loan",
  inflated_production: "Production estimate looks inflated",
  escalator: "High escalator",
  high_price: "Price above the typical range",
  no_cash_price: "No cash price on the quote",
  tax_credit: "Counts a tax credit that has ended",
  battery_unpriced: "Battery isn't priced separately",
  battery_large: "Battery larger than you can use daily",
  no_battery_nem3: "No battery under NEM 3.0",
  oversized: "System larger than your usage",
  undersized: "System covers little of your usage"
};
const RANK = { high: 0, medium: 1, low: 2 };
// Within a severity, the findings that usually cost the homeowner most come first.
const IMPACT = ["escalator", "dealer_fee", "tax_credit", "inflated_production", "high_price", "oversized",
  "no_battery_nem3", "battery_large", "no_cash_price", "battery_unpriced", "undersized"];
const order = (x, y) => RANK[x.severity] - RANK[y.severity] || IMPACT.indexOf(x.id) - IMPACT.indexOf(y.id);

export default function handler(req, res) {
  if (!allowPost(req, res) || !checkAccess(req, res)) return;
  if (!hasPasscode(req) && !allow(req, "preview", 60, 10 * 60 * 1000)) return tooMany(res);
  const { quotes, bill, state, sunHours } = req.body ?? {};
  if (!Array.isArray(quotes) || quotes.length < 1 || quotes.length > 3) {
    return res.status(400).json({ error: "Add 1 to 3 quotes." });
  }
  let metrics;
  try {
    metrics = analyze({
      quotes: quotes.map((q, i) => ({ ...q, label: `Quote ${String.fromCharCode(65 + i)}` })),
      bill, state, sunHours
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const all = [];
  const out = metrics.quotes.map((q, i) => {
    const flags = (q.flags || [])
      .slice()
      .sort(order)
      .map((f) => ({ title: TITLES[f.id] || "Issue to check", severity: f.severity }));
    (q.flags || []).forEach((f) => all.push({ ...f, label: q.label, name: quotes[i]?.installer_name || null }));
    return { label: q.label, name: quotes[i]?.installer_name || null, flags };
  });
  all.sort(order);
  const top = all[0] ? { label: all[0].label, name: all[0].name, title: TITLES[all[0].id] || "Issue to check", text: all[0].text } : null;

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ total: all.length, quotes: out, top });
}
