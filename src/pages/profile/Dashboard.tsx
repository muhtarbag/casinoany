import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageSquare, AlertTriangle, Gift, User, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isSiteOwner, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect site owners to their management panel
  useEffect(() => {
    if (!loading && isSiteOwner) {
      navigate('/panel/site-management', { replace: true });
    }
  }, [isSiteOwner, loading, navigate]);

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [favorites, memberships, reviews, complaints, bonuses] = await Promise.all([
        supabase.from('user_favorite_sites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_site_memberships').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('site_reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('site_complaints').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_bonus_tracking').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active')
      ]);

      return {
        favorites: favorites.count || 0,
        memberships: memberships.count || 0,
        reviews: reviews.count || 0,
        complaints: complaints.count || 0,
        activeBonuses: bonuses.count || 0
      };
    },
    enabled: !!user
  });

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Yükleniyor...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Hesabınıza erişmek için lütfen giriş yapın.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={() => navigate('/login')}>Giriş Yap</Button>
              <Button variant="outline" onClick={() => navigate('/signup')}>Kayıt Ol</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has any activity
  const hasActivity = stats && (
    stats.favorites > 0 || 
    stats.memberships > 0 || 
    stats.reviews > 0 || 
    stats.complaints > 0 || 
    stats.activeBonuses > 0
  );

  // Priority-ordered quick actions
  const quickActions = [
    {
      title: 'Aktif Bonuslarım',
      description: 'Takip ettiğiniz aktif bonuslar',
      icon: Gift,
      count: stats?.activeBonuses,
      href: '/profile/bonus-tracking',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      hoverBg: 'hover:bg-primary/15',
      isPrimary: true,
      emptyMessage: 'Henüz bonus takibi yapmıyorsunuz'
    },
    {
      title: 'Favorilerim',
      description: 'Favori bahis siteleriniz',
      icon: Heart,
      count: stats?.favorites,
      href: '/profile/favorites',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      hoverBg: 'hover:bg-red-500/15',
      emptyMessage: 'Favori sitenizi ekleyin'
    },
    {
      title: 'Üyeliklerim',
      description: 'Kayıtlı olduğunuz siteler',
      icon: User,
      count: stats?.memberships,
      href: '/profile/memberships',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      hoverBg: 'hover:bg-blue-500/15',
      emptyMessage: 'Üyeliklerinizi takip edin'
    },
    {
      title: 'Yorumlarım',
      description: 'Yazdığınız yorumlar',
      icon: MessageSquare,
      count: stats?.reviews,
      href: '/profile/reviews',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      hoverBg: 'hover:bg-green-500/15',
      emptyMessage: 'İlk yorumunuzu yazın'
    },
    {
      title: 'Şikayetlerim',
      description: 'Aktif şikayetleriniz',
      icon: AlertTriangle,
      count: stats?.complaints,
      href: '/profile/complaints',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      hoverBg: 'hover:bg-orange-500/15',
      emptyMessage: 'Şikayetiniz yoksa ne mutlu!'
    }
  ];

  // Primary action (most important)
  const primaryAction = quickActions[0];
  const secondaryActions = quickActions.slice(1);

  return (
    <>
      <SEO 
        title="Hesabım | Kullanıcı Paneli"
        description="Favori sitelerinizi yönetin, üyeliklerinizi takip edin ve bonus kampanyalarından haberdar olun."
      />
      <ProfileLayout>
        <div className="space-y-4 md:space-y-6">
          
          {/* Onboarding / Empty State for New Users */}
          {!hasActivity && (
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2">Hoş Geldiniz! 👋</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Hesabınız hazır. Şimdi favori sitelerinizi ekleyerek, bonusları takip ederek ve yorumlar yazarak başlayabilirsiniz.
                    </p>
                    <Button size="sm" asChild>
                      <Link to="/">
                        Siteleri Keşfet
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hero Primary Action (Mobile: Full Width, Desktop: Prominent) */}
          <Link to={primaryAction.href}>
            <Card className={cn(
              "group cursor-pointer transition-all duration-300 border-2",
              primaryAction.borderColor,
              primaryAction.bgColor,
              primaryAction.hoverBg,
              "hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]",
              "md:hover:scale-[1.02]"
            )}>
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110",
                    primaryAction.bgColor
                  )}>
                    <primaryAction.icon className={cn("h-8 w-8 md:h-10 md:w-10", primaryAction.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg md:text-xl truncate">{primaryAction.title}</h3>
                      {(primaryAction.count || 0) > 0 && (
                        <TrendingUp className={cn("h-5 w-5 flex-shrink-0", primaryAction.color)} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 truncate">
                      {primaryAction.description}
                    </p>
                    {(primaryAction.count || 0) === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        {primaryAction.emptyMessage}
                      </p>
                    )}
                  </div>

                  {/* Badge */}
                  {(primaryAction.count || 0) > 0 ? (
                    <Badge className="text-2xl md:text-3xl px-4 py-2 font-bold flex-shrink-0">
                      {primaryAction.count}
                    </Badge>
                  ) : (
                    <ArrowRight className={cn("h-6 w-6 flex-shrink-0 transition-transform group-hover:translate-x-1", primaryAction.color)} />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Secondary Stats Grid - Mobile: 2x2, Desktop: 4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {secondaryActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card className={cn(
                  "group cursor-pointer transition-all duration-300 h-full",
                  action.borderColor,
                  action.bgColor,
                  action.hoverBg,
                  "hover:shadow-lg hover:scale-[1.03] active:scale-[0.97]"
                )}>
                  <CardContent className="p-4 text-center">
                    <div className="relative inline-block mb-3">
                      <action.icon className={cn("h-8 w-8 mx-auto transition-transform group-hover:scale-110", action.color)} />
                      {(action.count || 0) > 0 && (
                        <span className={cn("absolute -top-1 -right-1 h-3 w-3 rounded-full animate-pulse", action.bgColor)} />
                      )}
                    </div>
                    <p className="text-xl md:text-2xl font-bold mb-1">{action.count || 0}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Actions List - Better for Mobile Scrolling */}
          <div className="space-y-4 md:hidden">
            <h2 className="text-base font-semibold px-1">Hızlı Erişim</h2>
            <div className="space-y-6">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href}>
                  <Card className={cn(
                    "group cursor-pointer transition-all duration-200 border-l-4",
                    action.borderColor,
                    action.bgColor,
                    action.hoverBg,
                    "active:scale-[0.98]"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 min-h-[44px]">
                        {/* Icon */}
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                          action.bgColor
                        )}>
                          <action.icon className={cn("h-6 w-6", action.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-0.5 truncate">{action.title}</h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {(action.count || 0) > 0 ? action.description : action.emptyMessage}
                          </p>
                        </div>

                        {/* Count or Arrow */}
                        {(action.count || 0) > 0 ? (
                          <Badge variant="secondary" className="text-base px-2.5 py-1 font-bold flex-shrink-0">
                            {action.count}
                          </Badge>
                        ) : (
                          <ArrowRight className={cn("h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1", action.color)} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ProfileLayout>
    </>
  );
}
