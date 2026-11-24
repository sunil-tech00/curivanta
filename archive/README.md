# Archive

Old Curivanta products kept for possible reuse. Nothing here is built or deployed (Vite only copies `public/`,
and serverless functions only run from a top-level `api/`).

- `solar/`: the solar proposal review site (was served at curivanta.com/solar, noindex). Archived 2026-11-24 when
  the site moved from Vercel to Render; /solar now redirects to the homepage.
- `api/`: its Vercel serverless functions (`review/*`: upload, extract with Claude, report, checkout; `cron/cleanup`)
  and helpers (`_lib`, including the old GoHighLevel and payments code). To bring it back, it needs a server
  (e.g. a small Render web service), since Render static sites don't run functions.

Older archived pages (old homepage, Hair Salon Bot, Review Automation, Website Development): git tag
old-site-2026-11-13, branch archive/old-site.
