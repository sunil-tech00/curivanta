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
  // The new site's pages (switch-over 2026-11-22).
  { "route": "/missed-calls", "title": "Missed-call text-back and booking by text for salons | Curivanta", "description": "When nobody can pick up, the caller gets a text from your salon within a minute. Curivanta answers their questions and books them into your calendar, day or night.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/reviews", "title": "Google review requests and replies for salons | Curivanta", "description": "After a visit, clients get one short text asking for a review. Every review request includes your Google link. Anything less than great also comes to you privately, so you can make it right.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/phone", "title": "A phone system for salons: calls in the app, answered when you can't | Curivanta", "description": "Call clients from the app with your salon's number, put calls on hold or transfer them, and on Pro, have calls nobody picks up answered and booked for you.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/owner-app", "title": "The salon owner app: calls, bookings and reviews on one screen | Curivanta", "description": "Calls, bookings and reviews on one screen, on your phone or computer. What needs you is at the top, and a short email lands every morning.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/salons", "title": "Curivanta for salons with a team | Curivanta", "description": "Keep your salon number. Curivanta catches the calls your team can't get to, books them into SalonUltimate or Square, and asks clients for reviews.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/solo", "title": "Curivanta for solo stylists and booth renters | Curivanta", "description": "Starter gives you a separate business number that rings your cell during your hours, texts back the calls you miss, and books clients while you work.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/locations", "title": "Curivanta for salons with several locations | Curivanta", "description": "Each location gets its own number, setup and plan. You switch between them in one app, and notifications tell you which salon they're for.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/pricing", "title": "Pricing | Curivanta", "description": "Starter $49, Light $99, Pro $149 a month, per location. Texts and call minutes included, AI call answering on Light and Pro, no contract. $49 setup credited to your first month.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/roi", "title": "What missed calls cost your salon | Curivanta", "description": "Work out what missed calls cost your salon each month, how many bookings Curivanta could win back, and how soon a plan pays for itself.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  { "route": "/story", "title": "Our story | Curivanta", "description": "Curivanta was built by a salon owner, at our own front desk. What we promise: prices on the page, no review gating, texts that play by the rules, and a real person who answers.", "image": "/brand/og-salon.jpg", "imageAlt": "Curivanta: the AI front desk for salons and solo stylists"},
  {
    route: "/square",
    title: "AI front desk for Square salons: books into Square Appointments | Curivanta",
    description: "Curivanta texts back missed calls, answers clients by text 24/7 and books them into Square Appointments, on Square's free plan too. Google review requests after every checkout. From $49/month.",
    image: "/brand/og-salon.jpg",
    imageAlt: "Curivanta: the AI front desk for Square salons"
  },
  {
    route: "/salonultimate",
    title: "AI front desk for SalonUltimate salons: books into your appointment book | Curivanta",
    description: "Curivanta texts back missed calls, answers clients by text 24/7 and books them straight into SalonUltimate using your live online booking openings. Review requests after checkout. From $49/month.",
    image: "/brand/og-salon.jpg",
    imageAlt: "Curivanta: the AI front desk for SalonUltimate salons"
  },
  {
    route: "/privacy",
    title: "Privacy Policy | Curivanta",
    description: "How Curivanta handles salon owners' and clients' information: texts, calls, recordings, AI, who we share with, and your choices.",
    image: "/brand/og-salon.jpg",
    imageAlt: "Curivanta: the AI front desk for salons and solo stylists"
  },
  {
    route: "/delete-account",
    title: "Delete your account | Curivanta",
    description: "How to delete your Curivanta account and its data: what we delete, what we keep and for how long.",
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

// The blog: /blog and one page per article (src/blog/posts/<slug>.md; same header as src/blog/posts.ts reads).
const POSTS_DIR = "src/blog/posts";
const posts = (fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR) : []).filter(f => f.endsWith(".md")).map(f => {
  const raw = fs.readFileSync(path.join(POSTS_DIR, f), "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error(`page-meta: ${f} has no --- header`);
  const meta = Object.fromEntries(m[1].split("\n").filter(l => l.indexOf(":") > 0)
    .map(l => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim().replace(/^["']|["']$/g, "")]));
  return { slug: f.replace(/\.md$/, ""), ...meta, draft: meta.draft === "true" };
}).sort((a, b) => b.date.localeCompare(a.date));
const listed = posts.filter(p => !p.draft);
PAGES.push({
  route: "/blog",
  title: "Blog: running a salon front desk | Curivanta",
  description: "Plain advice for salon owners and solo stylists on missed calls, bookings, reviews and the AI tools that help, from someone who runs salons.",
  image: "/brand/og-salon.jpg",
  imageAlt: "The Curivanta blog",
  noindex: listed.length === 0,
});
for (const p of posts) PAGES.push({ route: `/blog/${p.slug}`, title: `${p.title} | Curivanta`, description: p.description,
  image: "/brand/og-salon.jpg", imageAlt: p.title, noindex: p.draft, article: true });

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
  if (p.article) html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/, '<meta property="og:type" content="article" />');
  if (p.noindex) html = html.replace("</head>", '    <meta name="robots" content="noindex" />\n  </head>');
  const out = path.join(DIST, p.route.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log(`page-meta: wrote ${out}`);
}

// The sitemap: public/sitemap.xml plus the blog and its published articles.
if (listed.length) {
  const file = path.join(DIST, "sitemap.xml");
  const urls = [`  <url><loc>${SITE}/blog</loc><lastmod>${listed[0].date}</lastmod></url>`,
    ...listed.map(p => `  <url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${p.date}</lastmod></url>`)].join("\n");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("</urlset>", `${urls}\n</urlset>`));
  console.log(`page-meta: sitemap + ${listed.length} blog article(s)`);
}

// Render (render.yaml) serves each page's folder only for addresses it lists: every page and blog article needs its
// rewrite there, or Render answers 404. A catch-all /blog/:slug would answer made-up articles with an empty page.
{
  const yaml = fs.readFileSync("render.yaml", "utf8");
  const missing = PAGES.map(p => p.route).filter(r => !yaml.includes(`source: ${r}\n`));
  if (missing.length) throw new Error(`page-meta: add a rewrite to render.yaml for ${missing.join(", ")}`);
}

// The "page not found" page: Render serves dist/404.html, with status 404, for any address that isn't a real page,
// so made-up addresses aren't indexed as copies of the homepage. The app shows its NotFound page there.
{
  let html = base.replace(/<title>[^<]*<\/title>/, "<title>Page not found | Curivanta</title>");
  html = html.replace("</head>", '    <meta name="robots" content="noindex" />\n  </head>');
  fs.writeFileSync(path.join(DIST, "404.html"), html);
  console.log("page-meta: wrote dist/404.html");
}

// The homepage's canonical link. Unknown URLs are served this same file (then show the 404 page,
// which adds noindex), so pointing them at / is harmless.
{
  const home = path.join(DIST, "index.html");
  const html = fs.readFileSync(home, "utf8");
  fs.writeFileSync(home, html.replace(/(<meta property="og:url" content="[^"]*"\s*\/?>)/,
    `$1\n    <link rel="canonical" href="${SITE}/" />`));
}
