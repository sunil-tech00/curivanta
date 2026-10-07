import { allowPost, checkPasscode, sendError } from "../_lib/http.js";
import { analyze } from "../_lib/solar.js";
import { writeReport } from "../_lib/claude.js";

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  if (!allowPost(req, res) || !checkPasscode(req, res)) return;
  const { quotes, bill, state, sunHours } = req.body ?? {};
  if (!Array.isArray(quotes) || quotes.length < 1 || quotes.length > 3) {
    return res.status(400).json({ error: "Add 1 to 3 quotes." });
  }
  let metrics;
  try {
    metrics = analyze({
      quotes: quotes.map((q, i) => ({ ...q, label: `Quote ${String.fromCharCode(65 + i)}` })),
      bill,
      state,
      sunHours
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  if (metrics.quotes.every((q) => q.error)) {
    return res.status(400).json({ error: "Each quote needs at least a system size." });
  }
  try {
    res.status(200).json({ metrics, report: await writeReport(metrics) });
  } catch (err) {
    sendError(res, err);
  }
}
