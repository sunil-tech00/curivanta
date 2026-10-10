import { allowPost, sendError, siteOrigin, tooMany } from "../_lib/http.js";
import { allow } from "../_lib/limit.js";
import { normalizeOrder, createSalonCheckout, loadSalonSession, announceNewCustomer, sendOnboarding, onboardingEnabled } from "../_lib/salon-billing.js";

// Hair Salon Bot billing: /api/salon/checkout, /api/salon/confirm and /api/salon/onboard share one
// function (Vercel's Hobby plan allows 12 functions per deployment).
export default async function handler(req, res) {
  const action = String(req.query?.action || "");
  if (action === "checkout") return checkout(req, res);
  if (action === "confirm") return confirm(req, res);
  if (action === "onboard") return onboard(req, res);
  res.status(404).json({ error: "Not found" });
}

// Starts Stripe Checkout for a Hair Salon Bot plan (one location per checkout).
async function checkout(req, res) {
  if (!allowPost(req, res)) return;
  if (!allow(req, "salon-checkout", 10, 10 * 60 * 1000)) return tooMany(res);
  try {
    const order = normalizeOrder(req.body ?? {});
    res.status(200).json({ url: await createSalonCheckout(order, siteOrigin(req)) });
  } catch (err) {
    sendError(res, err, req);
  }
}

// Welcome page: confirms the order and tells GHL about the new customer (once).
async function confirm(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const order = await loadSalonSession(String(req.query?.session_id || ""));
    await announceNewCustomer(order).catch((err) => console.error("new-customer notify failed:", err.message));
    const { email, name, phone, ...summary } = order.summary;
    res.status(200).json({ ...summary, name, onboardingForm: onboardingEnabled() });
  } catch (err) {
    sendError(res, err, req);
  }
}

// Welcome page onboarding form → GHL (only for a completed Hair Salon Bot order).
const FIELDS = { salon_name: 200, address: 300, salon_phone: 40, hours: 600, services: 2000, stylists: 1000, kickoff_time: 300, notes: 2000 };
const clean = (v, max) => String(v ?? "").replace(/\r/g, "").trim().slice(0, max);

async function onboard(req, res) {
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
