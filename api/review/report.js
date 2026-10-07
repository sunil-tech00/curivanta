import { allowPost, hasPasscode, sendError } from "../_lib/http.js";
import { analyze } from "../_lib/solar.js";
import { writeReport } from "../_lib/claude.js";
import { checkPaid, recordRun, MAX_RUNS } from "../_lib/payments.js";

export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (!allowPost(req, res)) return;
  const { quotes, bill, state, sunHours, sessionId, bypass } = req.body ?? {};
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

  // A paid Checkout Session unlocks the report; the passcode + bypass flag is the owner's test path.
  const testRun = bypass === true && hasPasscode(req);
  try {
    const payment = testRun ? null : await checkPaid(sessionId);
    const report = await writeReport(metrics);
    const runsLeft = payment ? await recordRun(payment) : MAX_RUNS;
    res.status(200).json({ metrics, report, runsLeft, test: testRun });
  } catch (err) {
    sendError(res, err);
  }
}
