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

// The homepage's canonical link. Unknown URLs are served this same file (then show the 404 page,
// which adds noindex), so pointing them at / is harmless.
{
  const home = path.join(DIST, "index.html");
  const html = fs.readFileSync(home, "utf8");
  fs.writeFileSync(home, html.replace(/(<meta property="og:url" content="[^"]*"\s*\/?>)/,
    `$1\n    <link rel="canonical" href="${SITE}/" />`));
}
