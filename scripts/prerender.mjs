// After `vite build` and page-meta.mjs: puts each public page's rendered HTML inside
// <div id="root"> of its index.html, and adds structured data (JSON-LD) to the homepage.
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";

const DIST = "dist";
const SITE = "https://curivanta.com";
// Booking-system pages (/square, /salonultimate) get FAQ structured data too.
const FAQ_PAGES = { "/square": "Square", "/salonultimate": "SalonUltimate" };

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "error" });
try {
  const { render, routes, posts } = await vite.ssrLoadModule("/src/prerender.tsx");
  for (const route of routes) {
    const file = path.join(DIST, route === "/" ? "" : route.slice(1), "index.html");
    let html = fs.readFileSync(file, "utf8");
    const body = render(route);
    if (!html.includes('<div id="root"></div>')) throw new Error(`prerender: no empty root in ${file}`);
    html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    if (route === "/") html = html.replace("</head>", `${jsonLd(body)}\n  </head>`);
    else if (FAQ_PAGES[route]) html = html.replace("</head>", `${faqLd(body, route)}\n  </head>`);
    else if (route.startsWith("/blog/")) html = html.replace("</head>", `${articleLd(posts.find(p => `/blog/${p.slug}` === route))}\n  </head>`);
    fs.writeFileSync(file, html);
    console.log(`prerender: ${route} (${Math.round(body.length / 1024)} KB)`);
  }
} finally {
  await vite.close();
}
// Vite's module runner can leave handles open; the work is done, so end the build step here.
process.exit(0);

function text(s) {
  return s.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

// FAQ answers come from the rendered page, so the structured data always matches what's shown.
function faqOf(body) {
  return [...body.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)]
    .map(([, q, a]) => ({ "@type": "Question", name: text(q), acceptedAnswer: { "@type": "Answer", text: text(a) } }));
}

// The booking-system pages: their FAQ, and what the page is about.
function faqLd(body, route) {
  const faq = faqOf(body);
  if (faq.length < 5) throw new Error(`prerender: found only ${faq.length} FAQ entries on ${route}`);
  const graph = [
    { "@type": "WebPage", "@id": `${SITE}${route}`, url: `${SITE}${route}`, name: `Curivanta for ${FAQ_PAGES[route]}`,
      isPartOf: { "@id": `${SITE}/#site` }, about: { "@type": "SoftwareApplication", name: "Curivanta", url: `${SITE}/` },
      mentions: { "@type": "SoftwareApplication", name: FAQ_PAGES[route] } },
    { "@type": "FAQPage", mainEntity: faq },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return `    <script type="application/ld+json">${json}</script>`;
}

// Each blog article: what it is, who wrote it and when (for search results).
function articleLd(p) {
  const url = `${SITE}/blog/${p.slug}`;
  const json = JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title,
    description: p.description, datePublished: p.date, url, mainEntityOfPage: url, image: `${SITE}/brand/og-salon.jpg`,
    author: { "@type": "Organization", name: p.author, url: `${SITE}/` },
    publisher: { "@type": "Organization", name: "Curivanta", logo: { "@type": "ImageObject", url: `${SITE}/brand/logo-light.png` } } })
    .replace(/</g, "\\u003c");
  return `    <script type="application/ld+json">${json}</script>`;
}

function jsonLd(body) {
  const faq = [...body.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/g)]
    .map(([, q, a]) => ({ "@type": "Question", name: text(q), acceptedAnswer: { "@type": "Answer", text: text(a) } }));
  if (faq.length < 5) throw new Error(`prerender: found only ${faq.length} FAQ entries`);
  const plan = (name, price, desc) => ({ "@type": "Offer", name, price, priceCurrency: "USD", description: desc,
    priceSpecification: { "@type": "UnitPriceSpecification", price, priceCurrency: "USD", unitText: "MONTH" },
    url: `https://app.curivanta.com/start?plan=${name.toLowerCase()}` });
  const graph = [
    { "@type": "Organization", "@id": `${SITE}/#org`, name: "Curivanta", legalName: "AUM SL LLC", url: `${SITE}/`,
      logo: `${SITE}/brand/logo-light.png`, email: "hello@curivanta.com" },
    { "@type": "WebSite", "@id": `${SITE}/#site`, url: `${SITE}/`, name: "Curivanta", publisher: { "@id": `${SITE}/#org` } },
    { "@type": "SoftwareApplication", name: "Curivanta", applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android", url: `${SITE}/`, publisher: { "@id": `${SITE}/#org` },
      description: "AI front desk for hair salons and solo stylists: missed-call text-back, AI texting that answers clients and books appointments into SalonUltimate or Square, Google review requests, and AI phone answering on Pro.",
      offers: [plan("Starter", "49", "For solo stylists: 400 texts and 300 call minutes a month, $49 setup counted toward the first month."),
               plan("Light", "99", "For salons with a team: 1,000 texts and 300 call minutes a month, $49 setup counted toward the first month."),
               plan("Pro", "149", "AI answers calls: 1,500 texts, 300 call minutes and 200 assistant minutes a month, $49 setup counted toward the first month.")] },
    { "@type": "FAQPage", mainEntity: faq },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return `    <script type="application/ld+json">${json}</script>`;
}
