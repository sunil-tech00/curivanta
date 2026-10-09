import { loadReport, latestForSession, reportUrl } from "../_lib/reports.js";
import { siteOrigin } from "../_lib/http.js";

// GET ?id=<reportId>   → that report (the id is the secret, like an unlisted link)
// GET ?session=<cs_…>  → the latest report for a paid checkout session (tab-close recovery)
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const url = new URL(req.url, "http://x");
    let id = url.searchParams.get("id");
    const session = url.searchParams.get("session");
    if (!id && session) id = await latestForSession(session);
    const doc = id ? await loadReport(id) : null;
    if (!doc) return res.status(404).json({ error: "We couldn't find that report. Check the link in your email. Reports are kept for 12 months." });
    res.status(200).json({ ...doc, id, url: reportUrl(siteOrigin(req), id) });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Couldn't load the report right now. Please try again in a minute." });
  }
}
