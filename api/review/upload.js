import { allowPost, checkAccess, sendError, tooMany, hasPasscode } from "../_lib/http.js";
import { allow } from "../_lib/limit.js";
import { saveUploadPart } from "../_lib/reports.js";

// One base64 piece of a large document (see takeUpload in reports.js).
const MAX_PIECE = 3_900_000;

export default async function handler(req, res) {
  if (!allowPost(req, res) || !checkAccess(req, res)) return;
  if (!hasPasscode(req) && !allow(req, "upload", 40, 10 * 60 * 1000)) return tooMany(res);
  const { uploadId, index, chunk } = req.body ?? {};
  if (typeof chunk !== "string" || !chunk || chunk.length > MAX_PIECE || !/^[A-Za-z0-9+/=]+$/.test(chunk)) {
    return res.status(400).json({ error: "That upload didn't come through. Please try again." });
  }
  try {
    if (!(await saveUploadPart(uploadId, index, chunk))) return res.status(400).json({ error: "That upload didn't come through. Please try again." });
    res.status(200).json({ ok: true });
  } catch (err) {
    sendError(res, err, req);
  }
}
