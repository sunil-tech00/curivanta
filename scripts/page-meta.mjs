// After `vite build`: writes a copy of dist/index.html for pages that need their own link
// previews. Social crawlers (Meta, LinkedIn, iMessage, Slack) don't run JavaScript, so each
// page's title, description and image must be in the HTML the server sends.
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const SITE = "https://curivanta.com";

const PAGES = [
  {
    route: "/hair-salon-bot",
    title: "Hair Salon Bot: AI Front Desk for Salons | Curivanta",
    description: "An AI front desk that answers your salon's calls, texts and WhatsApp 24/7 and books straight into Salon Ultimate or Vagaro. No contracts, live in about a week.",
    image: "/brand/og-hair-salon-bot.jpg",
    imageAlt: "Curivanta Hair Salon Bot: never miss a call, text or appointment again"
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
  html = set(html, /<meta property="og:image" content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${img}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:alt" content="${esc(p.imageAlt)}" />\n    <meta property="og:url" content="${url}" />\n    <meta property="og:site_name" content="Curivanta" />\n    <link rel="canonical" href="${url}" />`);
  html = set(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(p.title)}" />`);
  html = set(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(p.description)}" />`);
  html = set(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${img}" />`);
  const out = path.join(DIST, p.route.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`page-meta: wrote ${out}`);
}
