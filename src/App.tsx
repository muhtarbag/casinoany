import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { usePageTracking } from "@/hooks/usePageTracking";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Sitemap from "./pages/Sitemap";
import SiteDetail from "./pages/SiteDetail";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import KVKK from "./pages/KVKK";
import CasinoSites from "./pages/CasinoSites";
import SportsBetting from "./pages/SportsBetting";
import BonusCampaigns from "./pages/BonusCampaigns";
import MobileBetting from "./pages/MobileBetting";
import SiteRedirect from "./pages/SiteRedirect";
import LiveCasino from "./pages/LiveCasino";

const queryClient = new QueryClient();

const AppContent = () => {
  usePageTracking();
  
  return (
    <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/sitemap.xml" element={<Sitemap />} />
              <Route path="/site/:id" element={<SiteRedirect />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/kvkk" element={<KVKK />} />
              <Route path="/casino-siteleri" element={<CasinoSites />} />
              <Route path="/spor-bahisleri" element={<SportsBetting />} />
              <Route path="/bonus-kampanyalari" element={<BonusCampaigns />} />
              <Route path="/mobil-bahis" element={<MobileBetting />} />
              <Route path="/canli-casino" element={<LiveCasino />} />
              <Route path="/:slug" element={<SiteDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
