import React, { Suspense } from "react";
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
import { OptimizedNotificationPopup } from "@/components/OptimizedNotificationPopup";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { createAppQueryClient } from "@/lib/queryClient";
import { lazyWithPreload } from "@/utils/lazyLoadRoutes";

// Lazy load pages with preloading capability
// Lazy load pages with preloading capability
const Index = lazyWithPreload(() => import("./pages/Index"));
const Login = lazyWithPreload(() => import("./pages/Login"));
const Signup = lazyWithPreload(() => import("./pages/Signup"));

// Lazy load admin pages for better code splitting
const AdminRoot = lazyWithPreload(() => import("./pages/admin"));
const AdminDashboard = lazyWithPreload(() => import("./pages/admin/Dashboard"));
const AdminSiteManagement = lazyWithPreload(() => import("./pages/admin/sites/SiteManagement"));
const AdminBlogManagement = lazyWithPreload(() => import("./pages/admin/blog/BlogManagement"));
const AdminAffiliateManagement = lazyWithPreload(() => import("./pages/admin/finance/AffiliateManagement"));
const AdminBonusManagement = lazyWithPreload(() => import("./pages/admin/finance/BonusManagement"));
const AdminReviews = lazyWithPreload(() => import("./pages/admin/Reviews"));
const AdminNotifications = lazyWithPreload(() => import("./pages/admin/Notifications"));
const AdminNews = lazyWithPreload(() => import("./pages/admin/News"));
const AdminAnalytics = lazyWithPreload(() => import("./pages/admin/analytics/AnalyticsDashboard"));
const AdminRealtimeAnalytics = lazyWithPreload(() => import("./pages/admin/analytics/RealtimeAnalytics"));
const AdminKeywords = lazyWithPreload(() => import("./pages/admin/analytics/KeywordPerformance"));
const AdminCasinoContent = lazyWithPreload(() => import("./pages/admin/content/CasinoContent"));
const AdminCategoryManagement = lazyWithPreload(() => import("./pages/admin/content/CategoryManagement"));
const AdminSystemHealth = lazyWithPreload(() => import("./pages/admin/system/SystemHealth"));
const AdminAI = lazyWithPreload(() => import("./pages/admin/AIAssistant"));
const AdminBonusRequests = lazyWithPreload(() => import("./pages/admin/finance/BonusRequests"));
const AdminContentPlanner = lazyWithPreload(() => import("./pages/admin/content/ContentPlanner"));
const AdminChangeHistory = lazyWithPreload(() => import("./pages/admin/system/ChangeHistory"));
const AdminPerformance = lazyWithPreload(() => import("./pages/admin/system/Performance"));
const AdminBuildHealth = lazyWithPreload(() => import("./pages/admin/system/BuildHealth"));
const AdminCacheManagement = lazyWithPreload(() => import("./pages/admin/system/CacheManagement"));
const AdminFeaturedSites = lazyWithPreload(() => import("./pages/admin/sites/FeaturedSites"));
const AdminBannerManagement = lazyWithPreload(() => import("./pages/admin/sites/BannerManagement"));
const AdminRecommendedSites = lazyWithPreload(() => import("./pages/admin/sites/RecommendedSites"));
const AdminSiteStats = lazyWithPreload(() => import("./pages/admin/sites/SiteStats"));
const AdminBlogStats = lazyWithPreload(() => import("./pages/admin/blog/BlogStats"));
const AdminBlogComments = lazyWithPreload(() => import("./pages/admin/blog/BlogComments"));
const AdminCasinoAnalytics = lazyWithPreload(() => import("./pages/admin/content/CasinoAnalytics"));
const AdminAIHistory = lazyWithPreload(() => import("./pages/admin/ai/AIHistory"));
const AdminSystemLogs = lazyWithPreload(() => import("./pages/admin/system/SystemLogs"));
const AdminRoleManagement = lazyWithPreload(() => import("./pages/admin/system/RoleManagement"));
const Blog = lazyWithPreload(() => import("./pages/Blog"));
const BlogPost = lazyWithPreload(() => import("./pages/BlogPost"));
const News = lazyWithPreload(() => import("./pages/News"));
const NewsDetail = lazyWithPreload(() => import("./pages/NewsDetail"));
const NotFound = lazyWithPreload(() => import("./pages/NotFound"));
const SiteDetail = lazyWithPreload(() => import("./pages/SiteDetail"));
const CasinoSites = lazyWithPreload(() => import("./pages/CasinoSites"));
const SportsBetting = lazyWithPreload(() => import("./pages/SportsBetting"));
const LiveCasino = lazyWithPreload(() => import("./pages/LiveCasino"));
const BonusCampaigns = lazyWithPreload(() => import("./pages/BonusCampaigns"));
const MobileBetting = lazyWithPreload(() => import("./pages/MobileBetting"));
const About = lazyWithPreload(() => import("./pages/About"));
const Privacy = lazyWithPreload(() => import("./pages/Privacy"));
const Terms = lazyWithPreload(() => import("./pages/Terms"));
const Cookies = lazyWithPreload(() => import("./pages/Cookies"));
const KVKK = lazyWithPreload(() => import("./pages/KVKK"));
const Sitemap = lazyWithPreload(() => import("./pages/Sitemap"));
const SiteRedirect = lazyWithPreload(() => import("./pages/SiteRedirect"));
const AMPBlogPost = lazyWithPreload(() => import("./pages/amp/AMPBlogPost"));
const AMPSiteDetail = lazyWithPreload(() => import("./pages/amp/AMPSiteDetail"));
const Categories = lazyWithPreload(() => import("./pages/Categories"));
const CategoryDetail = lazyWithPreload(() => import("./pages/CategoryDetail"));

// SEO-optimized pages
const DenemeBonusu = lazyWithPreload(() => import("./pages/DenemeBonusuDynamic"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
    <div className="container mx-auto px-4 space-y-4">
      <Skeleton className="h-16 w-full max-w-2xl mx-auto" />
      <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
    </div>
  </div>
);

const AppContent = () => {
  usePageTracking();
  
  return (
    <>
      <OfflineIndicator />
      <PWAInstallPrompt />
      <OptimizedNotificationPopup />
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
            
            <Route path="sites/featured" element={<AdminFeaturedSites />} />
            <Route path="sites/banners" element={<AdminBannerManagement />} />
            <Route path="sites/recommended" element={<AdminRecommendedSites />} />
            <Route path="sites/stats" element={<AdminSiteStats />} />
            <Route path="blog" element={<AdminBlogManagement />} />
            <Route path="blog/stats" element={<AdminBlogStats />} />
            <Route path="blog/comments" element={<AdminBlogComments />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="analytics/realtime" element={<AdminRealtimeAnalytics />} />
            <Route path="analytics/keywords" element={<AdminKeywords />} />
            <Route path="content/casino" element={<AdminCasinoContent />} />
            <Route path="content/categories" element={<AdminCategoryManagement />} />
            <Route path="content/casino-analytics" element={<AdminCasinoAnalytics />} />
            <Route path="content/planner" element={<AdminContentPlanner />} />
            <Route path="finance/affiliate" element={<AdminAffiliateManagement />} />
            <Route path="finance/bonus" element={<AdminBonusManagement />} />
            <Route path="finance/bonus-requests" element={<AdminBonusRequests />} />
            <Route path="system/health" element={<AdminSystemHealth />} />
            <Route path="system/history" element={<AdminChangeHistory />} />
            <Route path="system/performance" element={<AdminPerformance />} />
            <Route path="system/build-health" element={<AdminBuildHealth />} />
            <Route path="system/cache" element={<AdminCacheManagement />} />
            <Route path="system/logs" element={<AdminSystemLogs />} />
            <Route path="system/roles" element={<AdminRoleManagement />} />
            <Route path="ai" element={<AdminAI />} />
            <Route path="ai/assistant" element={<AdminAI />} />
            <Route path="ai/history" element={<AdminAIHistory />} />
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
          
          {/* Category pages */}
          <Route path="/kategoriler" element={<Categories />} />
          <Route path="/kategori/:slug" element={<CategoryDetail />} />
          
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

// CRITICAL: Create queryClient OUTSIDE component to avoid React hook issues
const queryClient = createAppQueryClient();

const App = () => {
  return (
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
};

export default App;
