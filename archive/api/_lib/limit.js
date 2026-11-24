// Per-visitor rate limit for the free steps (reading documents costs real money).
// In-memory per server instance: a speed bump against scripted abuse, not a hard quota.
const hits = new Map();

export function clientIp(req) {
  return String(req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
}

// true if this visitor is under `max` calls to `bucket` in the last `windowMs`.
export function allow(req, bucket, max, windowMs) {
  const key = `${bucket}:${clientIp(req)}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}
