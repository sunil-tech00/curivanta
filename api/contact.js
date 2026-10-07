import { allowPost, tooMany } from "./_lib/http.js";
import { allow } from "./_lib/limit.js";

// Homepage "Book a free automation audit" form → GHL inbound webhook (workflow creates the
// contact and follows up). Proxied here so the webhook URL isn't exposed to scrapers.
const WEBHOOK_URL = process.env.CONTACT_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/s6TIfFHOzZj6rBEEWpBG/webhook-trigger/CsP3zaWSLWOlpf14hrEj";

const SMS_CONSENT_TEXT = "By checking this box, I agree to receive SMS text messages regarding my inquiry and service updates. Message and data rates may apply.";

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export default async function handler(req, res) {
  if (!allowPost(req, res)) return;
  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot: real visitors never fill the hidden field; pretend success for bots.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });
  if (!allow(req, "contact", 5, 10 * 60 * 1000)) return tooMany(res);

  const name = clean(body.name, 120);
  const business = clean(body.business, 200);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 200).toLowerCase();
  if (!name || !business || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, "").length < 7) {
    return res.status(400).json({ error: "Please fill in every field with a valid email and mobile number." });
  }
  if (body.smsConsent !== true) {
    return res.status(400).json({ error: "Please tick the consent box to continue." });
  }

  const [firstName, ...rest] = name.split(" ");
  const payload = {
    name,
    first_name: firstName,
    last_name: rest.join(" "),
    business,
    phone,
    email,
    sms_consent: true,
    sms_consent_text: SMS_CONSENT_TEXT,
    consent_at: new Date().toISOString(),
    source: "curivanta_audit_form",
    page: "https://curivanta.com/#contact"
  };

  try {
    const r = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) throw new Error(`GHL ${r.status}: ${await r.text().catch(() => "")}`);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact webhook error:", err.message);
    res.status(502).json({ error: "Something went wrong sending your request. Please email hello@curivanta.com." });
  }
}
