import { allowPost, sendError, siteOrigin, tooMany } from "../_lib/http.js";
import { allow } from "../_lib/limit.js";
import { normalizeOrder, createSalonCheckout } from "../_lib/salon-billing.js";

// Starts Stripe Checkout for a Hair Salon Bot plan (one location per checkout).
export default async function handler(req, res) {
  if (!allowPost(req, res)) return;
  if (!allow(req, "salon-checkout", 10, 10 * 60 * 1000)) return tooMany(res);
  try {
    const order = normalizeOrder(req.body ?? {});
    res.status(200).json({ url: await createSalonCheckout(order, siteOrigin(req)) });
  } catch (err) {
    sendError(res, err, req);
  }
}
