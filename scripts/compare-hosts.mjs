// Compares two copies of the website, address by address (docs/move-to-render.md, step 3):
//   node scripts/compare-hosts.mjs https://curivanta.com https://curivanta-site.onrender.com
// For every page in the sitemap, the old addresses that redirect, robots.txt, the sitemap, llms.txt and a made-up
// address: status code, where a redirect goes, title, canonical, and noindex (meta tag or header). Prints only the
// differences, then a count. Expected differences: made-up addresses (404 on Render, 200 on Vercel), /book (retired).
const [A, B] = process.argv.slice(2).map(u => u.replace(/\/$/, ""));
if (!A || !B) { console.error("usage: node scripts/compare-hosts.mjs <old base URL> <new base URL>"); process.exit(1); }

const sitemap = await (await fetch(`${A}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>https:\/\/curivanta\.com([^<]*)<\/loc>/g)].map(m => m[1] || "/");
const extra = ["/robots.txt", "/sitemap.xml", "/llms.txt", "/dbf4c7bb7d4e92df0319a7ea0281f797.txt",
  "/new", "/new/pricing", "/new/blog", "/home-preview", "/hair-salon-bot", "/reviewautomation", "/website-development",
  "/hair-salon-bot/welcome", "/reviewautomation/welcome", "/solar", "/solar/guides/dealer-fees",
  "/book", "/no-such-page", "/blog/no-such-article", "/pricing/", "/brand/og-salon.jpg"];
const paths = [...new Set([...pages, ...extra])];

async function look(base, p) {
  const r = await fetch(base + p, { redirect: "manual", signal: AbortSignal.timeout(20000) });
  const text = await r.text();                       // always read, so the connection is freed
  const body = r.headers.get("content-type")?.includes("html") ? text : "";
  const loc = (r.headers.get("location") || "").replace(base, "").replace("https://curivanta.com", "");
  const pick = re => (body.match(re) || [])[1] || "";
  return {
    status: r.status >= 300 && r.status < 400 ? "redirect" : r.status,
    to: loc,
    title: pick(/<title>([^<]*)<\/title>/),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/),
    noindex: /<meta name="robots" content="[^"]*noindex/.test(body) || /noindex/.test(r.headers.get("x-robots-tag") || ""),
  };
}

let same = 0;
for (const p of paths) {
  const [a, b] = await Promise.all([look(A, p), look(B, p)]);
  const diffs = Object.keys(a).filter(k => String(a[k]) !== String(b[k]));
  if (!diffs.length) { same++; continue; }
  console.log(`\n${p}`);
  for (const k of diffs) console.log(`  ${k}: ${JSON.stringify(a[k])}  ->  ${JSON.stringify(b[k])}`);
}
console.log(`\n${same} of ${paths.length} addresses the same (${pages.length} sitemap pages).`);
