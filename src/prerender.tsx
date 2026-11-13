// Build-time only (scripts/prerender.mjs): the HTML of each public page, so search engines and
// link previews get the real text without running JavaScript. The browser then renders the app
// over it as usual.
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Home from "./pages/HomePreview";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const PAGES: Record<string, () => JSX.Element> = { "/": Home, "/privacy": PrivacyPolicy, "/terms": TermsOfService };

export function render(route: string): string {
  const Page = PAGES[route];
  return renderToString(<MemoryRouter initialEntries={[route]}><Page /></MemoryRouter>);
}

export const routes = Object.keys(PAGES);
