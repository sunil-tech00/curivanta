import { randomBytes } from "node:crypto";
import { put, get, list, del } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";

// Reports live in a private Vercel Blob store under an unguessable id; the customer's link
// goes to our page, which reads the blob server-side. Uploaded documents are never stored.
// REPORTS_LOCAL_DIR swaps in plain files for local testing.
const ID_RE = /^[A-Za-z0-9_-]{24}$/;
export const RETENTION_DAYS = 365;
const SESSION_RE = /^cs_[A-Za-z0-9_]+$/;

async function write(name, data) {
  const body = JSON.stringify(data);
  if (process.env.REPORTS_LOCAL_DIR) {
    const file = path.join(process.env.REPORTS_LOCAL_DIR, name);
    await fs.mkdir(path.dirname(file), { recursive: true });
    return fs.writeFile(file, body);
  }
  await put(name, body, { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true });
}

async function read(name) {
  if (process.env.REPORTS_LOCAL_DIR) {
    try { return JSON.parse(await fs.readFile(path.join(process.env.REPORTS_LOCAL_DIR, name), "utf8")); }
    catch { return null; }
  }
  const res = await get(name, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return JSON.parse(await new Response(res.stream).text());
}

export function reportUrl(origin, id) {
  return `${origin}/solar/report/${id}`;
}

export async function saveReport({ metrics, report, test, sessionId }) {
  const id = randomBytes(18).toString("base64url");
  await write(`reports/${id}.json`, { createdAt: new Date().toISOString(), test: Boolean(test), metrics, report });
  // Lets a paying customer recover their latest report from the checkout session.
  if (sessionId) await write(`sessions/${sessionId}.json`, { latest: id, updatedAt: new Date().toISOString() });
  return id;
}

export async function loadReport(id) {
  if (!ID_RE.test(String(id))) return null;
  return read(`reports/${id}.json`);
}

// Large uploads arrive in base64 pieces (Vercel caps a request at ~4.5 MB). Pieces are held
// only until the document is read, then deleted; the daily cleanup removes any leftovers.
const UPLOAD_RE = /^[A-Za-z0-9_-]{16,40}$/;
export const MAX_UPLOAD_PARTS = 5;
const uploadName = (id, i) => `uploads/${id}/${i}.json`;

export async function saveUploadPart(id, index, chunk) {
  if (!UPLOAD_RE.test(String(id)) || !Number.isInteger(index) || index < 0 || index >= MAX_UPLOAD_PARTS) return false;
  await write(uploadName(id, index), { c: chunk });
  return true;
}

export async function takeUpload(id, parts) {
  if (!UPLOAD_RE.test(String(id)) || !Number.isInteger(parts) || parts < 1 || parts > MAX_UPLOAD_PARTS) return null;
  const pieces = [];
  for (let i = 0; i < parts; i++) {
    const p = await read(uploadName(id, i));
    if (!p || typeof p.c !== "string") return null;
    pieces.push(p.c);
  }
  await removeUpload(id, parts).catch(() => {});
  return pieces.join("");
}

async function removeUpload(id, parts) {
  const names = Array.from({ length: parts }, (_, i) => uploadName(id, i));
  if (process.env.REPORTS_LOCAL_DIR) {
    await Promise.all(names.map((n) => fs.rm(path.join(process.env.REPORTS_LOCAL_DIR, n), { force: true })));
    return;
  }
  const { blobs } = await list({ prefix: `uploads/${id}/` });
  if (blobs.length) await del(blobs.map((b) => b.url));
}

export async function latestForSession(sessionId) {
  if (!SESSION_RE.test(String(sessionId))) return null;
  const pointer = await read(`sessions/${sessionId}.json`);
  return pointer?.latest ?? null;
}

// Deletes saved reports and session pointers older than RETENTION_DAYS, and any upload pieces
// older than a day. Run daily by Vercel Cron.
export async function deleteExpired(now = Date.now()) {
  const day = 24 * 60 * 60 * 1000;
  let deleted = 0;
  for (const [prefix, keepDays] of [["reports/", RETENTION_DAYS], ["sessions/", RETENTION_DAYS], ["uploads/", 1]]) {
    const cutoff = now - keepDays * day;
    let cursor;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      const old = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff).map((b) => b.url);
      if (old.length) {
        await del(old);
        deleted += old.length;
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  }
  return deleted;
}
