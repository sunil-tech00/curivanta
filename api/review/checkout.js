import { allowPost, checkAccess, sendError, tooMany, hasPasscode, siteOrigin } from "../_lib/http.js";
import { allow } from "../_lib/limit.js";
import { createCheckout } from "../_lib/payments.js";

export default async function handler(req, res) {
  if (!allowPost(req, res) || !checkAccess(req, res)) return;
  if (!hasPasscode(req) && !allow(req, "checkout", 10, 10 * 60 * 1000)) return tooMany(res);
  try {
    res.status(200).json({ url: await createCheckout(siteOrigin(req)) });
  } catch (err) {
    sendError(res, err, req);
  }
}
