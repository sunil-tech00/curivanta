import { allowPost, sendError, tooMany } from "../_lib/http.js";
import { allow } from "../_lib/limit.js";
import { loadSalonSession, sendOnboarding } from "../_lib/salon-billing.js";

// Welcome page onboarding form → GHL (only for a completed Hair Salon Bot order).
const FIELDS = { salon_name: 200, address: 300, salon_phone: 40, hours: 600, services: 2000, stylists: 1000, kickoff_time: 300, notes: 2000 };
const clean = (v, max) => String(v ?? "").replace(/\r/g, "").trim().slice(0, max);

export default async function handler(req, res) {
  if (!allowPost(req, res)) return;
  if (!allow(req, "salon-onboard", 10, 10 * 60 * 1000)) return tooMany(res);
  try {
    const body = req.body ?? {};
    const order = await loadSalonSession(String(body.session_id || ""));
    const details = Object.fromEntries(Object.entries(FIELDS).map(([k, max]) => [k, clean(body[k], max)]));
    const ok = await sendOnboarding(order.summary, order.subscription?.id || null, details);
    if (!ok) return res.status(502).json({ error: "We couldn't send that just now. Please email hello@curivanta.com." });
    res.status(200).json({ ok: true });
  } catch (err) {
    sendError(res, err, req);
  }
}
