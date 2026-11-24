# Moving curivanta.com from Vercel to Render

Status: steps 1-2 prepared 2026-11-24 on branch move-to-render (render.yaml, archive/, 404 page, scripts/compare-hosts.mjs). Owner: Sunil decides the DNS switch.

## Why
- Vercel's free (Hobby) plan is for non-commercial use only; Curivanta is a business. Pro would be $20/month.
- Render static sites are included in the Render plan we already pay for, and the app is there already.
- Not for speed: both serve the pre-built pages from a worldwide network.
- The site stays separate from the app: its own Render static site, its own deploys, from this repo.

## What changes
Retired (Sunil, 2026-11-24): the old review tool (`api/review`, `api/_lib`, the daily `api/cron/cleanup`) and the
GoHighLevel links (`/book`, `/widget/*` to link.curivanta.com). Removed, not moved.

Kept exactly as today (Google sees no change):
- Every page address in the sitemap, with the same title, description and canonical tag.
- Permanent redirects: www.curivanta.com -> curivanta.com, `/new` and `/new/*` -> the same page without `/new`.
- Old product pages -> `/`: `/home-preview`, `/hair-salon-bot`, `/reviewautomation`, `/website-development`,
  `/hair-salon-bot/welcome`, `/reviewautomation/welcome`.
- `robots.txt`, `sitemap.xml`, `llms.txt`, the Google verification file, `analytics.js`.
- Noindex headers on `/solar` and `/solar/*` (if the solar pages stay, see open questions).

Better than today:
- Unknown addresses return a real 404. Today Vercel answers any made-up address with the homepage and status 200
  (the `/((?!solar/|api/).*)` -> `/index.html` rewrite), which Google can treat as duplicate pages. On Render, only
  the real pages are served; everything else gets a 404 page.

## Steps
1. **Clean up the repo** (about 1 hour)
   - Delete `api/` and the `crons`, `/book`, `/widget` entries; remove `public/_redirects` (catch-all to index.html).
   - Add a static `404.html` built from the NotFound page, with noindex.
   - Add `render.yaml` (or dashboard settings) for the static site: build `npm ci && npm run build`, publish `dist`,
     the redirects and headers above, rewrites `/<page>` -> `/<page>/index.html` for each page (same as vercel.json).
   - Keep `vercel.json` working until the switch, so Vercel keeps serving meanwhile.
2. **Create the Render static site** (about 1 hour)
   - New static site from this repo, auto-deploy from `main`, same Node version as Vercel.
   - Check it on its `.onrender.com` address.
3. **Compare both copies** (about 1 hour)
   - A script requests every sitemap address, every redirect, the noindex pages, `robots.txt`, `sitemap.xml`,
     `llms.txt` and a made-up address, from Vercel (curivanta.com) and from the Render copy, and compares:
     status code, redirect target, title, canonical, X-Robots-Tag. Watch for trailing-slash redirects
     (`/pricing` must answer 200 directly, not redirect to `/pricing/`).
   - Click through on a phone: homepage, pricing, ROI calculator, blog article, demo number link, sign-up buttons.
   - Sunil looks at the Render copy before the switch.
4. **Switch the domain** (Sunil at Namecheap, at a quiet hour; 15 minutes plus waiting)
   - Add curivanta.com and www.curivanta.com to the Render site; Render shows the records.
   - At Namecheap change only the website records: `@` (A record to Render's address) and `www` (CNAME to the
     `.onrender.com` name). Don't touch MX, SPF, DKIM, DMARC, Brevo, Google verification, `app` or the salon
     wildcard records.
   - Wait for Render to show both domains verified with certificates; rerun the comparison against curivanta.com.
5. **After** 
   - Resubmit the sitemap in Google Search Console; check its Pages report after a week.
   - Keep the Vercel project for a week as a fallback (switch back = put the old records back), then delete it.
   - Update notes: README, the app's `docs/systems.md`, CLAUDE.md (marketing site on Render).

About half a day of work plus the DNS wait. No downtime: the DNS switch happens only after the Render copy matches.

## Open questions for Sunil
- Decided 2026-11-24: `/solar` archived in `archive/` (redirects to `/`), `/book` retired (404).
- When: any quiet weekday morning works.
