import Stripe from "stripe";

// $49 unlocks the AI report; each purchase allows a few re-runs (e.g. after fixing a number).
// Run counts live in the PaymentIntent's metadata, so no database is needed.
export const PRICE_CENTS = Number(process.env.REVIEW_PRICE_CENTS) || 4900;
export const MAX_RUNS = 3;
const PRODUCT = "ai_quote_review";

let stripe;
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw exposed(503, "Payments aren't set up yet.");
  if (!stripe) {
    // STRIPE_API_BASE points the SDK at a local fake for testing; unset in production.
    const base = process.env.STRIPE_API_BASE ? new URL(process.env.STRIPE_API_BASE) : null;
    stripe = new Stripe(key, base ? { host: base.hostname, port: base.port, protocol: base.protocol.replace(":", "") } : {});
  }
  return stripe;
}

const exposed = (status, message) => Object.assign(new Error(message), { status, expose: true });

export function paymentsReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function createCheckout(origin) {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: PRICE_CENTS,
        product_data: {
          name: "AI Solar Quote Review",
          description: "Instant review of up to 3 solar quotes: verdict, red flags, and negotiation talking points."
        }
      }
    }],
    allow_promotion_codes: true,
    metadata: { product: PRODUCT },
    payment_intent_data: { metadata: { product: PRODUCT, runs_used: "0" } },
    success_url: `${origin}/solar/review?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/solar/review?canceled=1`
  });
  return session.url;
}

// Confirms the Checkout Session is a paid AI review with runs left.
export async function checkPaid(sessionId) {
  if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    throw exposed(402, "We couldn't find your payment. Please unlock the report again.");
  }
  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  } catch (err) {
    if (err?.statusCode === 404 || err?.code === "resource_missing") {
      throw exposed(402, "We couldn't find your payment. Please unlock the report again.");
    }
    throw err;
  }
  const pi = session.payment_intent;
  if (session.payment_status !== "paid" || session.metadata?.product !== PRODUCT || !pi || typeof pi !== "object") {
    throw exposed(402, "This payment hasn't gone through yet.");
  }
  const runsUsed = Number(pi.metadata?.runs_used) || 0;
  if (runsUsed >= MAX_RUNS) {
    throw exposed(402, `You've used all ${MAX_RUNS} reports included with this purchase.`);
  }
  return { paymentIntentId: pi.id, runsUsed, email: session.customer_details?.email || null };
}

// Counted only after a report is delivered, so failed runs don't use one up.
export async function recordRun({ paymentIntentId, runsUsed }) {
  await getStripe().paymentIntents.update(paymentIntentId, {
    metadata: { runs_used: String(runsUsed + 1) }
  });
  return MAX_RUNS - (runsUsed + 1);
}
