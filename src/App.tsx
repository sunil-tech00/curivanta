import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import HomeNext from "./pages/HomeNext";
import RoiNext from "./pages/RoiNext";
import PricingNext from "./pages/PricingNext";
import StoryNext from "./pages/StoryNext";
import NextPage from "./pages/NextPages";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DeleteAccount from "./pages/DeleteAccount";
import SquarePage from "./pages/SquarePage";
import SalonUltimatePage from "./pages/SalonUltimatePage";
import { BlogIndex, BlogPost } from "./pages/Blog";

// The old homepage, Hair Salon Bot, Review Automation and Website Development pages are archived
// (git tag old-site-2026-11-13, branch archive/old-site); their URLs redirect to / (vercel.json).

// The preview addresses (/new, /new/pricing, ...) became the real ones on 2026-11-22; vercel.json redirects too.
const FromNew = () => { const { pathname, hash } = useLocation(); return <Navigate to={(pathname.replace(/^\/new/, "") || "/") + hash} replace />; };

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeNext />} />
          <Route path="/roi" element={<RoiNext />} />
          <Route path="/pricing" element={<PricingNext />} />
          <Route path="/story" element={<StoryNext />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/square" element={<SquarePage />} />
          <Route path="/salonultimate" element={<SalonUltimatePage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/new/*" element={<FromNew />} />
          <Route path="/:slug" element={<NextPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
