import { isPublic } from "../_lib/http.js";
import { PRICE_CENTS, MAX_RUNS, paymentsReady } from "../_lib/payments.js";

// What the page needs to know before showing anything.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ public: isPublic(), priceCents: PRICE_CENTS, maxRuns: MAX_RUNS, paymentsReady: paymentsReady() });
}
