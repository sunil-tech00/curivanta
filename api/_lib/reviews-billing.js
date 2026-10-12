import { getStripe, exposed } from "./payments.js";
import { notifyGhl } from "./ghl.js";

// Review Automation subscriptions, sold per location through Stripe Checkout. Amounts in cents.
// $35 carrier registration is charged at checkout. The free month starts at go-live, so the
// first monthly charge comes after the setup period plus 30 days.
export const PLANS = {
  starter: { name: "Review Automation: Starter", monthly: 7900, requests: 100 },
  growth: { name: "Review Automation: Growth", monthly: 12900, requests: 200 }
};
export const REGISTRATION = 3500;
export const SETUP_DAYS = 14;
export const FREE_DAYS = 30;
const PRODUCT = "review_automation";

const CUSTOMER_WEBHOOK_URL = process.env.REVIEWS_CUSTOMER_WEBHOOK_URL || "";

export function normalizeOrder(body) {
  const plan = PLANS[body?.plan] ? body.plan : null;
  if (!plan) throw exposed(400, "Choose Starter or Growth.");
  return { plan };
}

const money = (cents) => ({ currency: "usd", unit_amount: cents });

export async function createReviewsCheckout({ plan }, origin) {
  const p = PLANS[plan];
  const metadata = { product: PRODUCT, plan };
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { quantity: 1, price_data: { ...money(p.monthly), recurring: { interval: "month" },
        product_data: { name: p.name, description: `Up to ${p.requests} review requests a month. One salon location. No contract.` } } },
      { quantity: 1, price_data: { ...money(REGISTRATION), product_data: { name: "Text message carrier registration (one-time)" } } }
    ],
    subscription_data: { trial_period_days: SETUP_DAYS + FREE_DAYS, metadata, description: `Review Automation (${plan}) for one salon location` },
    metadata,
    allow_promotion_codes: true,
    phone_number_collection: { enabled: true },
    custom_fields: [
      { key: "salon_name", label: { type: "custom", custom: "Salon or shop name and city" }, type: "text" },
      { key: "booking_software", label: { type: "custom", custom: "Booking software you use" }, type: "text", optional: true }
    ],
    consent_collection: { terms_of_service: "required" },
    success_url: `${origin}/reviewautomation/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reviewautomation?checkout=canceled#pricing`
  });
  return session.url;
}

// Loads a completed Review Automation checkout. Throws a customer-safe error otherwise.
export async function loadReviewsSession(sessionId) {
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
  return {
    subscription: sub,
    summary: {
      plan: m.plan,
      planName: p?.name || m.plan,
      software: session.custom_fields?.find((f) => f.key === "booking_software")?.text?.value || "",
      monthly: p?.monthly || 0,
      paidToday: session.amount_total ?? 0,
      billingStarts: sub?.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      salonName: session.custom_fields?.find((f) => f.key === "salon_name")?.text?.value || "",
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
    source: "review_automation_checkout",
    email: summary.email,
    name: summary.name,
    first_name: first,
    last_name: rest.join(" "),
    phone: summary.phone,
    business: summary.salonName,
    plan: summary.planName,
    software: summary.software,
    monthly_usd: summary.monthly / 100,
    paid_today_usd: summary.paidToday / 100,
    billing_starts: summary.billingStarts,
    stripe_subscription: subscription.id
  }, CUSTOMER_WEBHOOK_URL);
  if (ok) await getStripe().subscriptions.update(subscription.id, { metadata: { ghl_notified: "1" } });
  return ok;
}
