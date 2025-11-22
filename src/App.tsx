import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OptimizedNotificationPopup } from "@/components/OptimizedNotificationPopup";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SEOSnippets } from "@/components/seo/SEOSnippets";
import { createAppQueryClient } from "@/lib/queryClient";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { cn } from "@/lib/utils";

// Create queryClient once outside component to avoid React dispatcher issues
const queryClient = createAppQueryClient();

// All pages imported directly (no lazy loading for maximum stability)
import Index from "./pages/Index";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// CRITICAL: Core auth & admin pages imported directly
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminRoot from "./pages/admin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSitesHub from "./pages/admin/sites/index";
import AdminRoleManagement from "./pages/admin/system/RoleManagement";
import AdminUsers from "./pages/admin/system/Users";

// Admin pages - all imported directly
import AdminBlogManagement from "./pages/admin/blog/BlogManagement";
import AdminAffiliateManagement from "./pages/admin/finance/AffiliateManagement";
import AdminBonusManagement from "./pages/admin/finance/BonusManagement";
import AdminReviews from "./pages/admin/Reviews";
import AdminComplaints from "./pages/admin/Complaints";
import AdminNotifications from "./pages/admin/Notifications";
import AdminNews from "./pages/admin/News";
import AdminCasinoContent from "./pages/admin/content/CasinoContent";
import AdminCategoryManagement from "./pages/admin/content/CategoryManagement";
import AdminCategorySites from "./pages/admin/content/CategorySites";
import AdminBonusRequests from "./pages/admin/finance/BonusRequests";
import AdminContentPlanner from "./pages/admin/content/ContentPlanner";
import AdminChangeHistory from "./pages/admin/system/ChangeHistory";
import AdminBuildHealth from "./pages/admin/system/BuildHealth";
import AdminFeaturedSites from "./pages/admin/sites/FeaturedSites";
import AdminBannerManagement from "./pages/admin/sites/BannerManagement";
import AdminSiteAdditionRequests from "./pages/admin/sites/SiteAdditionRequests";
import AdminRecommendedSites from "./pages/admin/sites/RecommendedSites";
import AdminSiteStats from "./pages/admin/sites/SiteStats";
import AdminBlogStats from "./pages/admin/blog/BlogStats";
import AdminBlogComments from "./pages/admin/blog/BlogComments";
import GamificationDashboard from "./pages/admin/gamification/Dashboard";
import AchievementsManagement from "./pages/admin/gamification/Achievements";
import RewardsManagement from "./pages/admin/gamification/Rewards";
import UserStatsManagement from "./pages/admin/gamification/UserStats";
import AdminSystemLogs from "./pages/admin/system/SystemLogs";
import AdminSiteOwners from "./pages/admin/SiteOwners";
import AdminFooterManagement from "./pages/admin/system/FooterManagement";
import AdvertisingManagement from "./pages/admin/advertising";

// Public pages - all imported directly
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogRedirect from "./pages/BlogRedirect";
import SlugRouter from "./pages/SlugRouter";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";
import SiteDetail from "./pages/SiteDetail";
import CasinoSites from "./pages/CasinoSites";
import SportsBetting from "./pages/SportsBetting";
import LiveCasino from "./pages/LiveCasino";
import BonusCampaigns from "./pages/BonusCampaigns";
import MobileBetting from "./pages/MobileBetting";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import KVKK from "./pages/KVKK";
import Sitemap from "./pages/Sitemap";
import SitemapXML from "./pages/SitemapXML";
import SiteRedirect from "./pages/SiteRedirect";
import AMPBlogPost from "./pages/amp/AMPBlogPost";
import AMPSiteDetail from "./pages/amp/AMPSiteDetail";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import FAQ from "./pages/FAQ";
import GameProviders from "./pages/GameProviders";
import CategoryPage from "./pages/CategoryPage";

// User profile pages - all imported directly
import Favorites from "./pages/profile/Favorites";
import Memberships from "./pages/profile/Memberships";
import ProfileDashboard from "./pages/profile/Dashboard";
import ProfileReviews from "./pages/profile/Reviews";
import ProfileComplaints from "./pages/profile/Complaints";
import BonusTracking from "./pages/profile/BonusTracking";
import ProfileSettings from "./pages/profile/Settings";
import ProfileNotifications from "./pages/profile/Notifications";
import LoyaltyPoints from "./pages/profile/LoyaltyPoints";
import Referrals from "./pages/profile/Referrals";
import Achievements from "./pages/profile/Achievements";

// User panel pages - all imported directly
import UserDashboard from "./pages/panel/Dashboard";
import SiteManagement from "./pages/panel/SiteManagement";

// Complaint pages - all imported directly
import Complaints from "./pages/Complaints";
import ComplaintDetail from "./pages/ComplaintDetail";
import NewComplaint from "./pages/NewComplaint";

// SEO-optimized pages - all imported directly
import DenemeBonusu from "./pages/DenemeBonusuDynamic";

// PWA Install page - imported directly
import Install from "./pages/Install";

// Loading fallback component - Clean and minimal
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background flex items-center justify-center">
    <div className="container mx-auto px-4 space-y-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-48 mx-auto bg-muted/20" />
        <Skeleton className="h-6 w-64 mx-auto bg-muted/20" />
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full bg-muted/20" />
        ))}
      </div>
      
      {/* Loading indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm">Yükleniyor...</span>
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  usePageTracking();
  const { isImpersonating } = useAuth();
  
  return (
    <div className={cn(
      "transition-all duration-300",
      isImpersonating ? "pt-[44px]" : ""
    )}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin routes - AdminRoot provides internal Suspense for lazy pages */}
          <Route path="/admin" element={<AdminRoot />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="sites" element={<AdminSitesHub />} />
            <Route path="system/users" element={<AdminUsers />} />
            <Route path="system/roles" element={<AdminRoleManagement />} />
            
            <Route path="sites/featured" element={<AdminFeaturedSites />} />
            <Route path="sites/banners" element={<AdminBannerManagement />} />
            <Route path="sites/recommended" element={<AdminRecommendedSites />} />
            <Route path="sites/stats" element={<AdminSiteStats />} />
            <Route path="sites/addition-requests" element={<AdminSiteAdditionRequests />} />
            <Route path="blog" element={<AdminBlogManagement />} />
            <Route path="blog/stats" element={<AdminBlogStats />} />
            <Route path="blog/comments" element={<AdminBlogComments />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="news" element={<AdminNews />} />
          <Route path="content/casino" element={<AdminCasinoContent />} />
            <Route path="content/categories" element={<AdminCategoryManagement />} />
            <Route path="content/categories/:slug/sites" element={<AdminCategorySites />} />
            <Route path="content/planner" element={<AdminContentPlanner />} />
            <Route path="finance/affiliate" element={<AdminAffiliateManagement />} />
            <Route path="finance/bonus" element={<AdminBonusManagement />} />
            <Route path="finance/bonus-requests" element={<AdminBonusRequests />} />
            <Route path="advertising" element={<AdvertisingManagement />} />
            <Route path="system/history" element={<AdminChangeHistory />} />
            <Route path="system/build-health" element={<AdminBuildHealth />} />
            <Route path="system/logs" element={<AdminSystemLogs />} />
            <Route path="system/footer" element={<AdminFooterManagement />} />
            <Route path="site-owners" element={<AdminSiteOwners />} />
            
            {/* Gamification Routes */}
            <Route path="gamification/dashboard" element={<GamificationDashboard />} />
            <Route path="gamification/achievements" element={<AchievementsManagement />} />
            <Route path="gamification/rewards" element={<RewardsManagement />} />
            <Route path="gamification/user-stats" element={<UserStatsManagement />} />
          </Route>
          
          {/* User Panel Routes */}
          <Route path="/panel/dashboard" element={<UserDashboard />} />
          <Route path="/panel/site-management" element={<SiteManagement />} />
          
          {/* Profile Routes */}
          <Route path="/profile/dashboard" element={<ProfileDashboard />} />
          <Route path="/profile/favorites" element={<Favorites />} />
          <Route path="/profile/memberships" element={<Memberships />} />
          <Route path="/profile/reviews" element={<ProfileReviews />} />
          <Route path="/profile/complaints" element={<ProfileComplaints />} />
          <Route path="/profile/bonus-tracking" element={<BonusTracking />} />
          <Route path="/profile/notifications" element={<ProfileNotifications />} />
          <Route path="/profile/loyalty-points" element={<LoyaltyPoints />} />
          <Route path="/profile/referrals" element={<Referrals />} />
          <Route path="/profile/achievements" element={<Achievements />} />
          <Route path="/profile/settings" element={<ProfileSettings />} />
          
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          {/* 301 Redirect old blog URLs to new structure */}
          <Route path="/blog/:slug" element={<BlogRedirect />} />
          <Route path="/haberler" element={<News />} />
          <Route path="/haber/:slug" element={<NewsDetail />} />
          
          {/* Complaint Routes - Support both slug and ID for backward compatibility */}
          <Route path="/sikayetler" element={<Complaints />} />
          <Route path="/sikayetler/yeni" element={<NewComplaint />} />
          <Route path="/sikayetler/*" element={<ComplaintDetail />} />
          
          {/* HTML Sitemap Page */}
          <Route path="/sitemap" element={<Sitemap />} />
          
          <Route path="/site/:id" element={<SiteRedirect />} />
          <Route path="/about" element={<About />} />
          <Route path="/hakkimizda" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/kvkk" element={<KVKK />} />
          <Route path="/sss" element={<FAQ />} />
          <Route path="/sik-sorulan-sorular" element={<FAQ />} />
          <Route path="/casino-siteleri" element={<CasinoSites />} />
          <Route path="/spor-bahisleri" element={<SportsBetting />} />
          <Route path="/bonus-kampanyalari" element={<BonusCampaigns />} />
          <Route path="/mobil-bahis" element={<MobileBetting />} />
          <Route path="/canli-casino" element={<LiveCasino />} />
          
          {/* SEO-optimized content pages */}
          <Route path="/deneme-bonusu" element={<DenemeBonusu />} />
          
          {/* PWA Install page */}
          <Route path="/install" element={<Install />} />
          
          {/* Category pages */}
          <Route path="/kategoriler" element={<Categories />} />
          <Route path="/kategori/:slug" element={<CategoryDetail />} />
          
          {/* Game Providers */}
          <Route path="/oyun-saglayicilari" element={<GameProviders />} />
          
          {/* Dynamic routing - checks blog posts first, then categories */}
          <Route path="/:slug" element={<SlugRouter />} />
          
          {/* AMP pages keep old structure for compatibility */}
          <Route path="/amp/blog/:slug" element={<AMPBlogPost />} />
          <Route path="/amp/:slug" element={<AMPSiteDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
          <HelmetProvider>
          <AuthProvider>
            <TooltipProvider>
              <OfflineIndicator />
              <PWAInstallPrompt />
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <SEOSnippets 
                  includeAnalytics={true}
                  includeGTM={false}
                  includeFacebookPixel={false}
                  includeSchemas={true}
                />
                <ImpersonationBanner />
                <OptimizedNotificationPopup />
                <ScrollToTop />
                <AppContent />
                <MobileBottomNav />
              </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </HelmetProvider>
        </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
