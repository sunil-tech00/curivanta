import { deleteExpired, RETENTION_DAYS } from "../_lib/reports.js";

// Daily (see vercel.json "crons"): removes AI review reports older than the retention period.
// Only ever deletes expired data, so it's harmless if called by anyone; if CRON_SECRET is set,
// Vercel sends it and we require it.
export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const deleted = await deleteExpired();
    console.log(`[cleanup] deleted ${deleted} blobs older than ${RETENTION_DAYS} days`);
    res.status(200).json({ deleted, retentionDays: RETENTION_DAYS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cleanup failed" });
  }
}
