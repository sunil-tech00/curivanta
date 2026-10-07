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

export function sendError(res, err) {
  console.error(err);
  res.status(err.status && err.status < 500 ? err.status : 502)
    .json({ error: err.status && err.status < 500 ? err.message : "Something went wrong talking to the AI. Please try again." });
}
