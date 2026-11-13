// After `vite build`: writes a copy of dist/index.html for pages that need their own link
// previews. Social crawlers (Meta, LinkedIn, iMessage, Slack) don't run JavaScript, so each
// page's title, description and image must be in the HTML the server sends.
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const SITE = "https://curivanta.com";

// Pages that need their own title, description and canonical link. The homepage's own tags
// are in index.html (its canonical is added below); the old product pages are archived.
const PAGES = [
  {
    route: "/privacy",
    title: "Privacy Policy | Curivanta",
    description: "How Curivanta handles salon owners' and clients' information: texts, calls, recordings, AI, who we share with, and your choices.",
    image: "/brand/og-salon.jpg",
    imageAlt: "Curivanta: the AI front desk for salons and solo stylists"
  },
  {
    route: "/terms",
    title: "Terms of Service | Curivanta",
    description: "The terms for Curivanta's Starter, Light and Pro plans: billing, included usage, cancelling, and how the AI front desk works.",
    image: "/brand/og-salon.jpg",
    imageAlt: "Curivanta: the AI front desk for salons and solo stylists"
  }
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const base = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

for (const p of PAGES) {
  const url = SITE + p.route;
  const img = SITE + p.image;
  const set = (html, re, tag) => {
    if (!re.test(html)) throw new Error(`page-meta: ${re} not found in index.html`);
    return html.replace(re, tag);
  };
  let html = base;
  html = set(html, /<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`);
  html = set(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(p.description)}" />`);
  html = set(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(p.title)}" />`);
  html = set(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(p.description)}" />`);
  html = set(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${img}" />`);
  html = set(html, /<meta property="og:image:alt" content="[^"]*"\s*\/?>/, `<meta property="og:image:alt" content="${esc(p.imageAlt)}" />`);
  // index.html has no canonical (other routes share it), so pages with their own HTML add one.
  html = set(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />\n    <link rel="canonical" href="${url}" />`);
  html = set(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(p.title)}" />`);
  html = set(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(p.description)}" />`);
  html = set(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${img}" />`);
  const out = path.join(DIST, p.route.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`page-meta: wrote ${out}`);
}

// The homepage's canonical link. Unknown URLs are served this same file (then show the 404 page,
// which adds noindex), so pointing them at / is harmless.
{
  const home = path.join(DIST, "index.html");
  const html = fs.readFileSync(home, "utf8");
  fs.writeFileSync(home, html.replace(/(<meta property="og:url" content="[^"]*"\s*\/?>)/,
    `$1\n    <link rel="canonical" href="${SITE}/" />`));
}
