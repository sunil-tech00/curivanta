// Tells GHL about a delivered report (contact + report link). A GHL workflow with an
// Inbound Webhook trigger does the rest (create/update contact, send the email).
// Never blocks or fails the customer's report: errors are logged only.
export async function notifyGhl(payload) {
  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) console.error("GHL webhook failed:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("GHL webhook error:", err.message);
    return false;
  }
}
