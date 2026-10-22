import { getStripe, exposed } from "./payments.js";
import { notifyGhl } from "./ghl.js";

// Hair Salon Bot subscriptions, sold per location through Stripe Checkout.
// Prices live here (not in Stripe) so the page and checkout can't disagree; amounts in cents.
// The setup fee is charged at checkout; the monthly fee starts after a 14-day setup period.
// Text-Back: missed-call text-back plus inbound text booking. Voice / Voice Pro: AI answers calls live instead
// (text-back and voice can't run together). Clients can text to book on Text-Back and Voice Pro, and on Voice with
// the Text Booking add-on; each comes with 500 texts a month. Ids starter/autopilot are kept for existing subscriptions.
export const PLANS = {
  textback: { name: "Hair Salon Bot: Text-Back", monthly: 9900, setup: 4900, minutes: 0, includes: "Missed-call text-back and text booking, 500 texts" },
  starter: { name: "Hair Salon Bot: Voice", monthly: 14900, setup: 4900, minutes: 300, includes: "300 AI voice minutes" },
  autopilot: { name: "Hair Salon Bot: Voice Pro", monthly: 24900, setup: 14900, minutes: 1000, includes: "1,000 AI voice minutes and text booking, 500 texts" }
};
export const ADDONS = {
  whatsapp: { name: "WhatsApp Add-On", monthly: 4900, setup: 0, plans: ["textback", "starter", "autopilot"] },
  textbooking: { name: "Text Booking Add-On (500 texts a month)", monthly: 4900, setup: 3500, plans: ["starter"] }, // Voice only: Text-Back and Voice Pro include it
  sms: { name: "SMS Add-On", monthly: 4900, setup: 3500, plans: [] } // retired; kept so older orders still read correctly
};
export const SOFTWARE = { salon_ultimate: "Salon Ultimate" };
export const SETUP_DAYS = 14;
const PRODUCT = "hair_salon_bot";

// New-customer workflow in GHL (separate from the lead-form workflows).
const CUSTOMER_WEBHOOK_URL = process.env.SALON_CUSTOMER_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/s6TIfFHOzZj6rBEEWpBG/webhook-trigger/37eb5e5c-62bd-497d-9dc9-cb28a9348c68";
export const onboardingEnabled = () => Boolean(CUSTOMER_WEBHOOK_URL);

export function normalizeOrder(body) {
  const plan = PLANS[body?.plan] ? body.plan : null;
  if (!plan) throw exposed(400, "Choose Text-Back, Voice or Voice Pro.");
  const software = SOFTWARE[body?.software] ? body.software : null;
  if (!software) throw exposed(400, "Online checkout is for Salon Ultimate. For other software, talk to us first.");
  const addons = [...new Set(Array.isArray(body?.addons) ? body.addons : [])]
    .filter((a) => ADDONS[a] && ADDONS[a].plans.includes(plan));
  return { plan, addons, software };
}

const money = (cents) => ({ currency: "usd", unit_amount: cents });

export async function createSalonCheckout(order, origin) {
  const { plan, addons, software } = order;
  const p = PLANS[plan];
  const line_items = [
    { quantity: 1, price_data: { ...money(p.monthly), recurring: { interval: "month" },
      product_data: { name: p.name, description: `${p.includes} a month included. One salon location. No contract.` } } },
    { quantity: 1, price_data: { ...money(p.setup), product_data: { name: `${p.name.replace("Hair Salon Bot: ", "")} setup (one-time)` } } }
  ];
  for (const a of addons) {
    const x = ADDONS[a];
    line_items.push({ quantity: 1, price_data: { ...money(x.monthly), recurring: { interval: "month" }, product_data: { name: x.name } } });
    if (x.setup) line_items.push({ quantity: 1, price_data: { ...money(x.setup), product_data: { name: `${x.name} setup (one-time)` } } });
  }
  const metadata = { product: PRODUCT, plan, addons: addons.join(","), software };
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items,
    subscription_data: { trial_period_days: SETUP_DAYS, metadata, description: `Hair Salon Bot (${plan}) for one salon location` },
    metadata,
    allow_promotion_codes: true,
    phone_number_collection: { enabled: true },
    custom_fields: [{ key: "salon_name", label: { type: "custom", custom: "Salon name and city" }, type: "text" }],
    consent_collection: { terms_of_service: "required" },
    success_url: `${origin}/hair-salon-bot/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/hair-salon-bot?checkout=canceled#pricing`
  });
  return session.url;
}

// Loads a completed Hair Salon Bot checkout. Throws a customer-safe error otherwise.
export async function loadSalonSession(sessionId) {
  if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    throw exposed(404, "We couldn't find that order.");
  }
  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
  } catch (err) {
    if (err?.statusCode === 404 || err?.code === "resource_missing") throw exposed(404, "We couldn't find that order.");
    throw err;
  }
  const ok = session.status === "complete" && ["paid", "no_payment_required"].includes(session.payment_status);
  if (!ok || session.metadata?.product !== PRODUCT) throw exposed(402, "This order hasn't gone through yet.");
  const sub = typeof session.subscription === "object" ? session.subscription : null;
  const m = session.metadata;
  const p = PLANS[m.plan];
  const addons = m.addons ? m.addons.split(",").filter((a) => ADDONS[a]) : [];
  const salonName = session.custom_fields?.find((f) => f.key === "salon_name")?.text?.value || "";
  return {
    session,
    subscription: sub,
    summary: {
      plan: m.plan,
      planName: p?.name || m.plan,
      addons: addons.map((a) => ADDONS[a].name),
      software: SOFTWARE[m.software] || m.software,
      monthly: (p?.monthly || 0) + addons.reduce((t, a) => t + ADDONS[a].monthly, 0),
      paidToday: session.amount_total ?? 0,
      billingStarts: sub?.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      salonName,
      email: session.customer_details?.email || "",
      name: session.customer_details?.name || "",
      phone: session.customer_details?.phone || ""
    }
  };
}

// Tells GHL about a new customer once (marked on the subscription so reloads don't repeat it).
export async function announceNewCustomer({ subscription, summary }) {
  if (!subscription || subscription.metadata?.ghl_notified === "1") return false;
  const [first = "", ...rest] = summary.name.split(" ");
  const ok = await notifyGhl({
    type: "new_customer",
    source: "hair_salon_bot_checkout",
    email: summary.email,
    name: summary.name,
    first_name: first,
    last_name: rest.join(" "),
    phone: summary.phone,
    business: summary.salonName,
    plan: summary.planName,
    addons: summary.addons.join(", "),
    software: summary.software,
    monthly_usd: summary.monthly / 100,
    paid_today_usd: summary.paidToday / 100,
    billing_starts: summary.billingStarts,
    stripe_subscription: subscription.id
  }, CUSTOMER_WEBHOOK_URL);
  if (ok) await getStripe().subscriptions.update(subscription.id, { metadata: { ghl_notified: "1" } });
  return ok;
}

export async function sendOnboarding(summary, subscriptionId, details) {
  return notifyGhl({
    type: "onboarding",
    source: "hair_salon_bot_onboarding",
    email: summary.email,
    business: details.salon_name || summary.salonName,
    plan: summary.planName,
    software: summary.software,
    stripe_subscription: subscriptionId,
    ...details
  }, CUSTOMER_WEBHOOK_URL);
}
