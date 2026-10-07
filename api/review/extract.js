import { allowPost, checkAccess, sendError } from "../_lib/http.js";
import { extractDocument } from "../_lib/claude.js";

const TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BASE64 = 4_300_000; // keeps the request under Vercel's 4.5 MB body limit

export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (!allowPost(req, res) || !checkAccess(req, res)) return;
  const { kind, mediaType, data } = req.body ?? {};
  if (kind !== "quote" && kind !== "bill") return res.status(400).json({ error: "Unknown document kind." });
  if (!TYPES.has(mediaType)) return res.status(400).json({ error: "Upload a PDF, JPG, or PNG." });
  if (typeof data !== "string" || !data || data.length > MAX_BASE64) {
    return res.status(413).json({ error: "File is too large. Keep PDFs under 3 MB." });
  }
  try {
    res.status(200).json({ fields: await extractDocument({ kind, mediaType, data }) });
  } catch (err) {
    sendError(res, err);
  }
}
