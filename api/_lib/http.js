import { timingSafeEqual } from "node:crypto";

// Prototype gate: every review endpoint requires REVIEW_PASSCODE.
export function checkPasscode(req, res) {
  const expected = process.env.REVIEW_PASSCODE;
  if (!expected) {
    res.status(503).json({ error: "Review isn't configured yet (REVIEW_PASSCODE missing)." });
    return false;
  }
  const given = Buffer.from(String(req.body?.passcode ?? ""));
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    res.status(401).json({ error: "Wrong passcode." });
    return false;
  }
  return true;
}

export function allowPost(req, res) {
  if (req.method === "POST") return true;
  res.setHeader("Allow", "POST");
  res.status(405).json({ error: "Method not allowed" });
  return false;
}

// Only errors we raise ourselves (expose: true) reach the customer; API/SDK errors are logged.
export function sendError(res, err) {
  console.error(err);
  if (err.expose) return res.status(err.status).json({ error: err.message });
  res.status(502).json({ error: "Something went wrong reading your documents. Please try again in a minute." });
}
