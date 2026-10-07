import { timingSafeEqual } from "node:crypto";

// Before launch the review is private: everything needs REVIEW_PASSCODE.
// Set REVIEW_PUBLIC=1 to open uploads to everyone (reports still require payment).
export const isPublic = () => process.env.REVIEW_PUBLIC === "1";

export function hasPasscode(req) {
  const expected = process.env.REVIEW_PASSCODE;
  if (!expected) return false;
  const given = Buffer.from(String(req.body?.passcode ?? ""));
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}

// Access to the free steps (reading documents, starting checkout).
export function checkAccess(req, res) {
  if (isPublic() || hasPasscode(req)) return true;
  if (!process.env.REVIEW_PASSCODE) {
    res.status(503).json({ error: "Review isn't configured yet (REVIEW_PASSCODE missing)." });
  } else {
    res.status(401).json({ error: "Wrong passcode." });
  }
  return false;
}

// Kept for the passcode screen.
export const checkPasscode = checkAccess;

export function siteOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || (String(host).startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
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
  res.status(502).json({
    error: "Something went wrong reading your documents. Please try again in a minute.",
    // Prototype only: callers already passed the passcode. Remove before public launch.
    detail: `${err.status ?? ""} ${err.error?.error?.message ?? err.message ?? err}`.trim()
  });
}
