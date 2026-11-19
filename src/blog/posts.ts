// The blog (curivanta.com/blog). One Markdown file per article in ./posts, named <slug>.md, starting with:
//   ---
//   title: Why salons lose bookings to missed calls
//   description: One or two sentences for Google and link previews.
//   date: 2026-11-19
//   author: Curivanta            (optional)
//   draft: true                  (optional: built but not listed, linked or in the sitemap)
//   ---
// Then the article: ## headings, paragraphs, - lists, 1. lists, > quotes, **bold**, *italic*, [links](https://...).
// scripts/page-meta.mjs reads the same files for each article's title, link preview and the sitemap.
// Copy rules as the rest of the site: plain salon language, no em dashes, claims in step with what Curivanta does.

export type Post = { slug: string; title: string; description: string; date: string; author: string; draft: boolean;
  body: string; minutes: number };

export function parse(slug: string, raw: string): Post {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`blog: ${slug}.md has no --- header`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  for (const k of ['title', 'description', 'date']) if (!meta[k]) throw new Error(`blog: ${slug}.md is missing ${k}`);
  const body = m[2].trim();
  return { slug, title: meta.title, description: meta.description, date: meta.date, author: meta.author || 'Curivanta',
    draft: meta.draft === 'true', body, minutes: Math.max(1, Math.round(body.split(/\s+/).length / 230)) };
}

const files = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export const ALL: Post[] = Object.entries(files)
  .map(([path, raw]) => parse(path.replace(/^.*\/|\.md$/g, ''), raw))
  .sort((a, b) => b.date.localeCompare(a.date));

export const POSTS = ALL.filter(p => !p.draft);       // listed on /blog

export const bySlug = (slug: string) => ALL.find(p => p.slug === slug);

export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
