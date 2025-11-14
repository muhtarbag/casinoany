import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationPopup } from "@/components/NotificationPopup";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminRoot = lazy(() => import("./pages/admin"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminSiteManagement = lazy(() => import("./pages/admin/sites/SiteManagement"));
const AdminBlogManagement = lazy(() => import("./pages/admin/blog/BlogManagement"));
const AdminAffiliateManagement = lazy(() => import("./pages/admin/finance/AffiliateManagement"));
const AdminBonusManagement = lazy(() => import("./pages/admin/finance/BonusManagement"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminNotifications = lazy(() => import("./pages/admin/Notifications"));
const AdminNews = lazy(() => import("./pages/admin/News"));
const AdminAnalytics = lazy(() => import("./pages/admin/analytics/AnalyticsDashboard"));
const AdminRealtimeAnalytics = lazy(() => import("./pages/admin/analytics/RealtimeAnalytics"));
const AdminKeywords = lazy(() => import("./pages/admin/analytics/KeywordPerformance"));
const AdminCasinoContent = lazy(() => import("./pages/admin/content/CasinoContent"));
const AdminSystemHealth = lazy(() => import("./pages/admin/system/SystemHealth"));
const AdminAI = lazy(() => import("./pages/admin/AIAssistant"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SiteDetail = lazy(() => import("./pages/SiteDetail"));
const CasinoSites = lazy(() => import("./pages/CasinoSites"));
const SportsBetting = lazy(() => import("./pages/SportsBetting"));
const LiveCasino = lazy(() => import("./pages/LiveCasino"));
const BonusCampaigns = lazy(() => import("./pages/BonusCampaigns"));
const MobileBetting = lazy(() => import("./pages/MobileBetting"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const KVKK = lazy(() => import("./pages/KVKK"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const SiteRedirect = lazy(() => import("./pages/SiteRedirect"));
const AMPBlogPost = lazy(() => import("./pages/amp/AMPBlogPost"));
const AMPSiteDetail = lazy(() => import("./pages/amp/AMPSiteDetail"));

// SEO-optimized pages
const DenemeBonusu = lazy(() => import("./pages/DenemeBonusuDynamic"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
    <div className="container mx-auto px-4 space-y-4">
      <Skeleton className="h-16 w-full max-w-2xl mx-auto" />
      <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
    </div>
  </div>
);

import { createAppQueryClient } from "@/lib/queryClient";

const queryClient = createAppQueryClient();

const AppContent = () => {
  usePageTracking();
  
  return (
    <>
      <NotificationPopup />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin routes - nested */}
          <Route path="/admin" element={<AdminRoot />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="sites" element={<AdminSiteManagement />} />
            <Route path="blog" element={<AdminBlogManagement />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="analytics/realtime" element={<AdminRealtimeAnalytics />} />
            <Route path="analytics/keywords" element={<AdminKeywords />} />
            <Route path="content/casino" element={<AdminCasinoContent />} />
            <Route path="finance/affiliate" element={<AdminAffiliateManagement />} />
            <Route path="finance/bonus" element={<AdminBonusManagement />} />
            <Route path="system/health" element={<AdminSystemHealth />} />
            <Route path="ai" element={<AdminAI />} />
          </Route>
          
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/haberler" element={<News />} />
          <Route path="/haber/:slug" element={<NewsDetail />} />
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
          
          {/* SEO-optimized content pages */}
          <Route path="/deneme-bonusu" element={<DenemeBonusu />} />
          
          <Route path="/amp/blog/:slug" element={<AMPBlogPost />} />
          <Route path="/amp/:slug" element={<AMPSiteDetail />} />
          <Route path="/:slug" element={<SiteDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
