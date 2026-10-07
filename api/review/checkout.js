import { allowPost, checkAccess, sendError, siteOrigin } from "../_lib/http.js";
import { createCheckout } from "../_lib/payments.js";

export default async function handler(req, res) {
  if (!allowPost(req, res) || !checkAccess(req, res)) return;
  try {
    res.status(200).json({ url: await createCheckout(siteOrigin(req)) });
  } catch (err) {
    sendError(res, err);
  }
}
