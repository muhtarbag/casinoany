import { Suspense, lazy, useEffect } from "react";
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
import { StatusBar, Style } from '@capacitor/status-bar';

// Create queryClient once outside component to avoid React dispatcher issues
const queryClient = createAppQueryClient();

// ⚡ CRITICAL PAGES - Loaded immediately for fastest initial experience
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// 🔐 Auth Pages - Lazy loaded (not critical for first paint)
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// 👑 Admin Pages - Lazy loaded (only for admin users)
const AdminRoot = lazy(() => import("./pages/admin"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminSitesHub = lazy(() => import("./pages/admin/sites/index"));
const AdminRoleManagement = lazy(() => import("./pages/admin/system/RoleManagement"));
const AdminUsers = lazy(() => import("./pages/admin/system/Users"));
const AdminBlogManagement = lazy(() => import("./pages/admin/blog/BlogManagement"));
const AdminAffiliateManagement = lazy(() => import("./pages/admin/finance/AffiliateManagement"));
const AdminBonusManagement = lazy(() => import("./pages/admin/finance/BonusManagement"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminComplaints = lazy(() => import("./pages/admin/Complaints"));
const AdminNotifications = lazy(() => import("./pages/admin/Notifications"));
const AdminNews = lazy(() => import("./pages/admin/News"));
const AdminCasinoContent = lazy(() => import("./pages/admin/content/CasinoContent"));
const AdminCategoryManagement = lazy(() => import("./pages/admin/content/CategoryManagement"));
const AdminCategorySites = lazy(() => import("./pages/admin/content/CategorySites"));
const AdminBonusRequests = lazy(() => import("./pages/admin/finance/BonusRequests"));
const AdminContentPlanner = lazy(() => import("./pages/admin/content/ContentPlanner"));
const AdminChangeHistory = lazy(() => import("./pages/admin/system/ChangeHistory"));
const AdminBuildHealth = lazy(() => import("./pages/admin/system/BuildHealth"));
const AdminFeaturedSites = lazy(() => import("./pages/admin/sites/FeaturedSites"));
const AdminBannerManagement = lazy(() => import("./pages/admin/sites/BannerManagement"));
const AdminSiteAdditionRequests = lazy(() => import("./pages/admin/sites/SiteAdditionRequests"));
const AdminRecommendedSites = lazy(() => import("./pages/admin/sites/RecommendedSites"));
const AdminSiteStats = lazy(() => import("./pages/admin/sites/SiteStats"));
const AdminBlogStats = lazy(() => import("./pages/admin/blog/BlogStats"));
const AdminBlogComments = lazy(() => import("./pages/admin/blog/BlogComments"));
const GamificationDashboard = lazy(() => import("./pages/admin/gamification/Dashboard"));
const AchievementsManagement = lazy(() => import("./pages/admin/gamification/Achievements"));
const RewardsManagement = lazy(() => import("./pages/admin/gamification/Rewards"));
const UserStatsManagement = lazy(() => import("./pages/admin/gamification/UserStats"));
const AdminSystemLogs = lazy(() => import("./pages/admin/system/SystemLogs"));
const AdminSiteOwners = lazy(() => import("./pages/admin/SiteOwners"));
const AdminFooterManagement = lazy(() => import("./pages/admin/system/FooterManagement"));
const AdminPerformanceMonitoring = lazy(() => import("./pages/admin/system/PerformanceMonitoring"));
const AdvertisingManagement = lazy(() => import("./pages/admin/advertising"));
const DomainMonitoring = lazy(() => import("./pages/panel/DomainMonitoring"));

// 📝 Blog & Content Pages - Lazy loaded (content heavy)
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogRedirect = lazy(() => import("./pages/BlogRedirect"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));

// 🎰 Casino Pages - Lazy loaded (user-facing but not critical)
const SiteDetail = lazy(() => import("./pages/SiteDetail"));
const CasinoSites = lazy(() => import("./pages/CasinoSites"));
const SportsBetting = lazy(() => import("./pages/SportsBetting"));
const LiveCasino = lazy(() => import("./pages/LiveCasino"));
const BonusCampaigns = lazy(() => import("./pages/BonusCampaigns"));
const MobileBetting = lazy(() => import("./pages/MobileBetting"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const GameProviders = lazy(() => import("./pages/GameProviders"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const SiteRedirect = lazy(() => import("./pages/SiteRedirect"));
const DenemeBonusuDynamic = lazy(() => import('@/pages/DenemeBonusuDynamic'));
const LiveBetting = lazy(() => import('@/pages/seo/LiveBetting'));
const FreeSpin = lazy(() => import('@/pages/seo/FreeSpin'));
const IllegalBetting = lazy(() => import('@/pages/seo/IllegalBetting'));
const BonusSites = lazy(() => import('@/pages/seo/BonusSites'));
const PaymentMethodPage = lazy(() => import('@/pages/seo/PaymentMethod'));
const CalculatorPage = lazy(() => import('@/pages/tools/CalculatorPage'));
const Influencer = lazy(() => import('@/pages/seo/Influencer'));
// Other SEO pages can be added next

// 👤 Profile Pages - Lazy loaded (authenticated users only)
const ProfileDashboard = lazy(() => import("./pages/profile/Dashboard"));
const Favorites = lazy(() => import("./pages/profile/Favorites"));
const Memberships = lazy(() => import("./pages/profile/Memberships"));
const ProfileReviews = lazy(() => import("./pages/profile/Reviews"));
const ProfileComplaints = lazy(() => import("./pages/profile/Complaints"));
const BonusTracking = lazy(() => import("./pages/profile/BonusTracking"));
const ProfileSettings = lazy(() => import("./pages/profile/Settings"));
const ProfileNotifications = lazy(() => import("./pages/profile/Notifications"));
const LoyaltyPoints = lazy(() => import("./pages/profile/LoyaltyPoints"));
const Referrals = lazy(() => import("./pages/profile/Referrals"));
const Achievements = lazy(() => import("./pages/profile/Achievements"));

// 🎯 User Panel Pages - Lazy loaded (site owners only)
const UserDashboard = lazy(() => import("./pages/panel/Dashboard"));
const SiteManagement = lazy(() => import("./pages/panel/SiteManagement"));

// 📢 Complaint Pages - Lazy loaded (user submissions)
const Complaints = lazy(() => import("./pages/Complaints"));
const ComplaintDetail = lazy(() => import("./pages/ComplaintDetail"));
const NewComplaint = lazy(() => import("./pages/NewComplaint"));

// 📄 Static/Legal Pages - Lazy loaded (low priority)
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const KVKK = lazy(() => import("./pages/KVKK"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Install = lazy(() => import("./pages/Install"));

// ⚡ AMP & Special Routes - Lazy loaded (SEO crawlers)
const AMPBlogPost = lazy(() => import("./pages/amp/AMPBlogPost"));
const AMPSiteDetail = lazy(() => import("./pages/amp/AMPSiteDetail"));
const SlugRouter = lazy(() => import("./pages/SlugRouter"));

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
            <Route path="system/domain-monitoring" element={<DomainMonitoring />} />
            <Route path="system/performance" element={<AdminPerformanceMonitoring />} />
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
          {/* SEO Landing Pages */}
          <Route path="/canli-bahis" element={<LiveBetting />} />
          <Route path="/free-spin" element={<FreeSpin />} />
          <Route path="/kacak-bahis" element={<IllegalBetting />} />
          <Route path="/bonus-veren-siteler" element={<BonusSites />} />
          <Route path="/odeme/:methodSlug" element={<PaymentMethodPage />} />
          <Route path="/araclar/bahis-hesaplama" element={<CalculatorPage />} />
          <Route path="/fenomen/:slug" element={<Influencer />} />

          <Route path="/deneme-bonusu" element={<DenemeBonusuDynamic />} />

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
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (e) {
        console.warn('StatusBar plugin not available or failed', e);
      }
    };
    initStatusBar();
  }, []);

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
