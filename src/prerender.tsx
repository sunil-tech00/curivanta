// Build-time only (scripts/prerender.mjs): the HTML of each public page, so search engines and
// link previews get the real text without running JavaScript. The browser then renders the app
// over it as usual.
import { renderToString } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomeNext from "./pages/HomeNext";
import RoiNext from "./pages/RoiNext";
import PricingNext from "./pages/PricingNext";
import StoryNext from "./pages/StoryNext";
import NextPage, { PAGES as PRODUCT } from "./pages/NextPages";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DeleteAccount from "./pages/DeleteAccount";
import SquarePage from "./pages/SquarePage";
import SalonUltimatePage from "./pages/SalonUltimatePage";
import { BlogIndex, BlogPost } from "./pages/Blog";
import { ALL } from "./blog/posts";

const PAGES: Record<string, () => JSX.Element> = { "/": HomeNext, "/roi": RoiNext, "/pricing": PricingNext,
  "/story": StoryNext, "/privacy": PrivacyPolicy, "/terms": TermsOfService, "/delete-account": DeleteAccount,
  "/square": SquarePage, "/salonultimate": SalonUltimatePage, "/blog": BlogIndex };
for (const p of ALL) PAGES[`/blog/${p.slug}`] = BlogPost;
for (const slug of Object.keys(PRODUCT)) PAGES[`/${slug}`] = NextPage;     // /missed-calls, /reviews, ... (2026-11-22)

export function render(route: string): string {
  const Page = PAGES[route];
  return renderToString(<MemoryRouter initialEntries={[route]}><Routes>
    <Route path={route.startsWith("/blog/") ? "/blog/:slug" : PAGES[route] === NextPage ? "/:slug" : route} element={<Page />} />
  </Routes></MemoryRouter>);
}

export const routes = Object.keys(PAGES);

// For the article structured data (scripts/prerender.mjs).
export const posts = ALL.map(({ slug, title, description, date, author }) => ({ slug, title, description, date, author }));
