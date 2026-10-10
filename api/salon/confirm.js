import { sendError } from "../_lib/http.js";
import { loadSalonSession, announceNewCustomer } from "../_lib/salon-billing.js";

// Welcome page: confirms the order and tells GHL about the new customer (once).
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const order = await loadSalonSession(String(req.query?.session_id || ""));
    await announceNewCustomer(order).catch((err) => console.error("new-customer notify failed:", err.message));
    const { email, name, phone, ...summary } = order.summary;
    res.status(200).json({ ...summary, name });
  } catch (err) {
    sendError(res, err, req);
  }
}
