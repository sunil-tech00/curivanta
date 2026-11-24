import { allowPost, checkAccess, sendError, tooMany, hasPasscode } from "../_lib/http.js";
import { allow } from "../_lib/limit.js";
import { extractDocument } from "../_lib/claude.js";
import { takeUpload } from "../_lib/reports.js";

const TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BASE64 = 4_300_000; // inline documents: keeps the request under Vercel's 4.5 MB body limit
const MAX_UPLOAD_BASE64 = 14_200_000; // ~10 MB documents sent in pieces via /api/review/upload

export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (!allowPost(req, res) || !checkAccess(req, res)) return;
  if (!hasPasscode(req) && !allow(req, "extract", 15, 10 * 60 * 1000)) return tooMany(res);
  const { kind, mediaType, uploadId, parts } = req.body ?? {};
  let { data } = req.body ?? {};
  if (kind !== "quote" && kind !== "bill") return res.status(400).json({ error: "Unknown document kind." });
  if (!TYPES.has(mediaType)) return res.status(400).json({ error: "Upload a PDF, JPG, or PNG." });
  if (uploadId) {
    try {
      data = await takeUpload(uploadId, parts);
    } catch (err) {
      return sendError(res, err, req);
    }
    if (!data) return res.status(400).json({ error: "We couldn't put your file back together. Please try uploading it again." });
    if (data.length > MAX_UPLOAD_BASE64) return res.status(413).json({ error: "File is too large. Keep PDFs under 10 MB." });
  } else if (typeof data !== "string" || !data || data.length > MAX_BASE64) {
    return res.status(413).json({ error: "File is too large. Keep PDFs under 10 MB." });
  }
  try {
    res.status(200).json({ fields: await extractDocument({ kind, mediaType, data }) });
  } catch (err) {
    sendError(res, err, req);
  }
}
