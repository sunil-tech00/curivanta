// Build-time only (scripts/prerender.mjs): the HTML of each public page, so search engines and
// link previews get the real text without running JavaScript. The browser then renders the app
// over it as usual.
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePreview";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DeleteAccount from "./pages/DeleteAccount";
import SquarePage from "./pages/SquarePage";
import SalonUltimatePage from "./pages/SalonUltimatePage";
import { BlogIndex, BlogPost } from "./pages/Blog";
import { ALL } from "./blog/posts";

const PAGES: Record<string, () => JSX.Element> = { "/": Home, "/privacy": PrivacyPolicy, "/terms": TermsOfService,
  "/delete-account": DeleteAccount,  "/square": SquarePage, "/salonultimate": SalonUltimatePage, "/blog": BlogIndex };
for (const p of ALL) PAGES[`/blog/${p.slug}`] = BlogPost;

export function render(route: string): string {
  const Page = PAGES[route];
  return renderToString(<MemoryRouter initialEntries={[route]}><Routes>
    <Route path={route.startsWith("/blog/") ? "/blog/:slug" : route} element={<Page />} />
  </Routes></MemoryRouter>);
}

export const routes = Object.keys(PAGES);

// For the article structured data (scripts/prerender.mjs).
export const posts = ALL.map(({ slug, title, description, date, author }) => ({ slug, title, description, date, author }));
